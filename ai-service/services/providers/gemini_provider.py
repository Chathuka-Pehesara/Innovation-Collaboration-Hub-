"""Google Gemini LLM provider (optional; requires google-genai package)."""

import logging
import os
import time
from typing import Any, Dict, List, Optional

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

_PLACEHOLDER_KEYS = frozenset({"your_gemini_key", "your_gemini_api_key_here"})


class GeminiProvider(BaseAIProvider):
    """Calls the Gemini API for structured JSON responses via the google-genai SDK."""

    def __init__(self) -> None:
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        self._client: Any = None
        self._configured = False
        self._sdk_missing = False

        if not self._has_valid_api_key():
            logger.warning("GeminiProvider: GEMINI_API_KEY missing or placeholder")
            return

        try:
            from google import genai
        except ImportError:
            self._sdk_missing = True
            logger.warning(
                "GeminiProvider: google-genai is not installed "
                "(pip install -r requirements-gemini.txt)"
            )
            return

        try:
            self._client = genai.Client(api_key=self.api_key)
            self._configured = True
            logger.info("GeminiProvider: API configured (model=%s)", self.model_name)
        except Exception as exc:
            logger.error("GeminiProvider: configuration failed: %s", exc)

    def _has_valid_api_key(self) -> bool:
        return bool(self.api_key) and self.api_key not in _PLACEHOLDER_KEYS

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def is_configured(self) -> bool:
        return self._configured

    def evaluate_idea(self, title: str, description: str) -> dict:
        prompt = build_evaluation_prompt(title, description)
        result = self._generate_json(prompt)
        if result:
            validated = validate_evaluation_response(result)
            validated["mode"] = "live"
            return validated
        raise RuntimeError("Gemini evaluation failed after retries")

    def mentor_chat(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> dict:
        prompt = build_mentor_prompt(message, conversation_history, context)
        result = self._generate_json(prompt)
        if result:
            result.setdefault("mode", "live")
            return result
        raise RuntimeError("Gemini mentor chat failed after retries")

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
        raise RuntimeError("Gemini description generation failed after retries")

    def refine_description(self, title: str, description: str, focus: str = "clarity") -> dict:
        prompt = build_refine_prompt(title, description, focus)
        result = self._generate_json(prompt)
        if result:
            result.setdefault("title", title)
            result.setdefault("original_description", description)
            result.setdefault("focus", focus)
            result.setdefault("mode", "live")
            return result
        raise RuntimeError("Gemini description refinement failed after retries")

    def _generate_json(self, prompt: str, max_retries: int = 3) -> Optional[dict]:
        if not self._configured or self._client is None:
            if self._sdk_missing:
                raise RuntimeError(
                    "GeminiProvider requires google-genai; install requirements-gemini.txt"
                )
            raise RuntimeError("GeminiProvider is not configured")

        from google.genai import types

        retry_delay = 2
        for attempt in range(max_retries):
            try:
                logger.info(
                    "GeminiProvider JSON generation (attempt %d/%d)",
                    attempt + 1,
                    max_retries,
                )
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    ),
                )
                return parse_json_response(response.text)
            except Exception as exc:
                logger.warning(
                    "GeminiProvider attempt %d failed: %s",
                    attempt + 1,
                    exc,
                )
                if attempt < max_retries - 1:
                    time.sleep(retry_delay * (attempt + 1))
        return None
