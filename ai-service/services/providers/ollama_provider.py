"""Ollama local LLM provider via REST API."""

import logging
import os
from typing import Any, Dict, List, Optional

import requests

from services.providers.base import BaseAIProvider
from services.providers.prompts import (
    build_description_prompt,
    build_evaluation_prompt,
    build_mentor_prompt,
    build_refine_prompt,
    parse_json_response,
    validate_evaluation_response,
)

logger = logging.getLogger(__name__)


class OllamaProvider(BaseAIProvider):
    """Calls a local Ollama instance for structured JSON responses."""

    def __init__(self) -> None:
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
        self.model_name = os.getenv("OLLAMA_MODEL", "llama3.2")
        self.timeout = float(os.getenv("OLLAMA_TIMEOUT", "60"))
        self._available = self._check_availability()

        if self._available:
            logger.info(
                "OllamaProvider: connected to %s (model=%s)",
                self.base_url,
                self.model_name,
            )
        else:
            logger.warning(
                "OllamaProvider: unavailable at %s — startup will fall back to mock",
                self.base_url,
            )

    @staticmethod
    def check_server_reachable(base_url: str, timeout: float = 3.0) -> bool:
        """Return True if Ollama responds to a tags listing request."""
        try:
            response = requests.get(f"{base_url.rstrip('/')}/api/tags", timeout=timeout)
            return response.status_code == 200
        except requests.RequestException:
            return False

    def _check_availability(self) -> bool:
        return self.check_server_reachable(self.base_url)

    @property
    def is_available(self) -> bool:
        return self._available

    @property
    def provider_name(self) -> str:
        return "ollama"

    @property
    def is_configured(self) -> bool:
        return self._available

    def evaluate_idea(self, title: str, description: str) -> dict:
        prompt = build_evaluation_prompt(title, description)
        result = self._generate_json(prompt)
        if result:
            validated = validate_evaluation_response(result)
            validated["mode"] = "live"
            return validated
        raise RuntimeError("Ollama evaluation failed")

    def mentor_chat(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> dict:
        system_prompt = (
            "You are an innovation mentor for university students. "
            "Respond ONLY with valid JSON as specified in the user message."
        )
        user_prompt = build_mentor_prompt(message, conversation_history, context)
        result = self._chat_json(system_prompt, user_prompt, conversation_history)
        if result:
            result.setdefault("mode", "live")
            return result
        raise RuntimeError("Ollama mentor chat failed")

    def generate_project_description(
        self,
        title: str,
        brief_concept: str = "",
        keywords: Optional[List[str]] = None,
        target_audience: str = "",
        template: str = "standard",
    ) -> dict:
        keywords = keywords or []
        prompt = build_description_prompt(
            title, brief_concept, keywords, target_audience, template
        )
        result = self._generate_json(prompt)
        if result:
            result.setdefault("title", title)
            result.setdefault("template_used", template)
            result.setdefault("mode", "live")
            return result
        raise RuntimeError("Ollama description generation failed")

    def refine_description(self, title: str, description: str, focus: str = "clarity") -> dict:
        prompt = build_refine_prompt(title, description, focus)
        result = self._generate_json(prompt)
        if result:
            result.setdefault("title", title)
            result.setdefault("original_description", description)
            result.setdefault("focus", focus)
            result.setdefault("mode", "live")
            return result
        raise RuntimeError("Ollama description refinement failed")

    def _generate_json(self, prompt: str) -> Optional[dict]:
        if not self._available:
            raise RuntimeError("OllamaProvider is not available")

        try:
            logger.info("OllamaProvider generate (model=%s)", self.model_name)
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                },
                timeout=self.timeout,
            )
            response.raise_for_status()
            payload = response.json()
            content = payload.get("response", "")
            if not content:
                return None
            return parse_json_response(content)
        except Exception as exc:
            logger.warning("OllamaProvider generate failed: %s", exc)
            return None

    def _chat_json(
        self,
        system_prompt: str,
        user_prompt: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> Optional[dict]:
        if not self._available:
            raise RuntimeError("OllamaProvider is not available")

        messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]
        for msg in conversation_history or []:
            role = msg.get("role", "user")
            ollama_role = "assistant" if role == "assistant" else "user"
            messages.append({"role": ollama_role, "content": msg.get("content", "")})
        messages.append({"role": "user", "content": user_prompt})

        try:
            logger.info("OllamaProvider chat (model=%s)", self.model_name)
            response = requests.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model_name,
                    "messages": messages,
                    "stream": False,
                    "format": "json",
                },
                timeout=self.timeout,
            )
            response.raise_for_status()
            payload = response.json()
            content = payload.get("message", {}).get("content", "")
            if not content:
                return None
            return parse_json_response(content)
        except Exception as exc:
            logger.warning("OllamaProvider chat failed: %s", exc)
            return None
