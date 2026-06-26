"""Abstract base interface for AI LLM providers."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseAIProvider(ABC):
    """Common interface for mock, Ollama, and optional Gemini providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Identifier for the active provider (mock, gemini, ollama)."""

    @property
    @abstractmethod
    def is_configured(self) -> bool:
        """True when a live LLM backend is available (used by health endpoints)."""

    @abstractmethod
    def evaluate_idea(self, title: str, description: str) -> dict:
        """Evaluate a project idea and return structured scores and feedback."""

    @abstractmethod
    def mentor_chat(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> dict:
        """Return mentor chat response with reply, suggestions, and topic."""

    @abstractmethod
    def generate_project_description(
        self,
        title: str,
        brief_concept: str = "",
        keywords: Optional[List[str]] = None,
        target_audience: str = "",
        template: str = "standard",
    ) -> dict:
        """Generate a structured project description from a concept."""

    @abstractmethod
    def refine_description(self, title: str, description: str, focus: str = "clarity") -> dict:
        """Improve an existing project description."""
