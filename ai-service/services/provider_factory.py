"""Factory for selecting and initializing the active AI provider."""

import logging
import os
from typing import Optional

from services.providers.base import BaseAIProvider
from services.providers.gemini_provider import GeminiProvider
from services.providers.mock_provider import MockProvider
from services.providers.ollama_provider import OllamaProvider
from services.providers.resilient_provider import ResilientAIProvider

logger = logging.getLogger(__name__)

VALID_PROVIDERS = frozenset({"mock", "gemini", "ollama"})

_provider_instance: Optional[BaseAIProvider] = None
_requested_provider: Optional[str] = None
_fallback_applied: bool = False


def _normalize_provider_name(name: str) -> str:
    normalized = (name or "mock").strip().lower()
    if normalized not in VALID_PROVIDERS:
        logger.warning(
            "Unknown AI_PROVIDER '%s'; valid values: %s. Defaulting to mock.",
            name,
            ", ".join(sorted(VALID_PROVIDERS)),
        )
        return "mock"
    return normalized


def create_ai_provider() -> BaseAIProvider:
    """Create the AI provider based on AI_PROVIDER and fallback rules."""
    global _provider_instance, _requested_provider, _fallback_applied

    requested = _normalize_provider_name(os.getenv("AI_PROVIDER", "mock"))
    _requested_provider = requested
    _fallback_applied = False
    mock = MockProvider()
    provider: BaseAIProvider

    if requested == "mock":
        logger.info("AI provider selected: mock (default)")
        provider = mock
    elif requested == "gemini":
        gemini = GeminiProvider()
        if not gemini.is_configured:
            _fallback_applied = True
            logger.warning(
                "AI_PROVIDER=gemini but Gemini is unavailable "
                "(missing/invalid GEMINI_API_KEY or google-genai not installed); "
                "falling back to MockProvider"
            )
            provider = mock
        else:
            logger.info("AI provider selected: gemini (with mock runtime fallback)")
            provider = ResilientAIProvider(gemini, mock)
    elif requested == "ollama":
        ollama = OllamaProvider()
        if not ollama.is_configured:
            _fallback_applied = True
            logger.warning(
                "AI_PROVIDER=ollama but Ollama is unavailable at %s; "
                "falling back to MockProvider",
                ollama.base_url,
            )
            provider = mock
        else:
            logger.info("AI provider selected: ollama (with mock runtime fallback)")
            provider = ResilientAIProvider(ollama, mock)
    else:
        provider = mock

    _provider_instance = provider
    return provider


def get_ai_provider() -> BaseAIProvider:
    """Return the singleton AI provider instance."""
    global _provider_instance
    if _provider_instance is None:
        _provider_instance = create_ai_provider()
    return _provider_instance


def reset_ai_provider() -> None:
    """Clear the cached provider (for tests)."""
    global _provider_instance, _requested_provider, _fallback_applied
    _provider_instance = None
    _requested_provider = None
    _fallback_applied = False


def get_provider_status() -> dict:
    """Return startup validation details for logging and health checks."""
    provider = get_ai_provider()
    return {
        "requested_provider": _requested_provider or _normalize_provider_name(
            os.getenv("AI_PROVIDER", "mock")
        ),
        "active_provider": provider.provider_name,
        "is_live": provider.is_configured,
        "fallback_applied": _fallback_applied,
    }


def get_provider_health_fields() -> dict:
    """Provider-agnostic fields for health and status endpoints."""
    status = get_provider_status()
    return {
        "requested_provider": status["requested_provider"],
        "active_provider": status["active_provider"],
        "provider_configured": status["is_live"],
        "provider_available": not status["fallback_applied"],
        "fallback_applied": status["fallback_applied"],
    }


def validate_provider_startup() -> BaseAIProvider:
    """Initialize and log provider selection at application startup."""
    provider = get_ai_provider()
    status = get_provider_status()

    logger.info(
        "AI provider startup validation: requested=%s active=%s live=%s fallback=%s",
        status["requested_provider"],
        status["active_provider"],
        status["is_live"],
        status["fallback_applied"],
    )

    if status["requested_provider"] == "gemini" and not os.getenv("GEMINI_API_KEY"):
        logger.warning("GEMINI_API_KEY is not set in environment")

    if status["requested_provider"] == "ollama":
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        if status["fallback_applied"]:
            logger.warning(
                "Ollama health check failed for %s — ensure Ollama is running",
                base_url,
            )
        else:
            logger.info("Ollama health check passed for %s", base_url)

    return provider
