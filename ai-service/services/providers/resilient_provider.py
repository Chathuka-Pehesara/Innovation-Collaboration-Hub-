"""Wraps a live provider with runtime fallback to MockProvider on errors."""

import logging
from typing import Any, Dict, List, Optional

from services.providers.base import BaseAIProvider
from services.providers.mock_provider import MockProvider

logger = logging.getLogger(__name__)


class ResilientAIProvider(BaseAIProvider):
    """Delegates to a primary provider and falls back to mock on failure."""

    def __init__(self, primary: BaseAIProvider, fallback: Optional[MockProvider] = None) -> None:
        self._primary = primary
        self._fallback = fallback or MockProvider()

    @property
    def provider_name(self) -> str:
        return self._primary.provider_name

    @property
    def is_configured(self) -> bool:
        return self._primary.is_configured

    def _with_fallback(self, operation: str, primary_call, fallback_call) -> dict:
        try:
            return primary_call()
        except Exception as exc:
            logger.warning(
                "%s failed via %s (%s); falling back to mock",
                operation,
                self._primary.provider_name,
                exc,
            )
            return fallback_call()

    def evaluate_idea(self, title: str, description: str) -> dict:
        return self._with_fallback(
            "evaluate_idea",
            lambda: self._primary.evaluate_idea(title, description),
            lambda: self._fallback.evaluate_idea(title, description),
        )

    def mentor_chat(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> dict:
        return self._with_fallback(
            "mentor_chat",
            lambda: self._primary.mentor_chat(message, conversation_history, context),
            lambda: self._fallback.mentor_chat(message, conversation_history, context),
        )

    def generate_project_description(
        self,
        title: str,
        brief_concept: str = "",
        keywords: Optional[List[str]] = None,
        target_audience: str = "",
        template: str = "standard",
    ) -> dict:
        return self._with_fallback(
            "generate_project_description",
            lambda: self._primary.generate_project_description(
                title, brief_concept, keywords, target_audience, template
            ),
            lambda: self._fallback.generate_project_description(
                title, brief_concept, keywords, target_audience, template
            ),
        )

    def refine_description(self, title: str, description: str, focus: str = "clarity") -> dict:
        return self._with_fallback(
            "refine_description",
            lambda: self._primary.refine_description(title, description, focus),
            lambda: self._fallback.refine_description(title, description, focus),
        )
