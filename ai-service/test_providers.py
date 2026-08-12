"""Tests for AI provider selection and fallback behavior."""

import os
import unittest
from unittest.mock import patch

from services.provider_factory import (
    create_ai_provider,
    get_provider_health_fields,
    get_provider_status,
    reset_ai_provider,
)
from services.providers.mock_provider import MockProvider
from services.providers.resilient_provider import ResilientAIProvider


class _FakeGeminiProvider(MockProvider):
    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def is_configured(self) -> bool:
        return True


class _FakeOllamaProvider(MockProvider):
    def __init__(self) -> None:
        super().__init__()
        self.base_url = "http://localhost:11434"

    @property
    def provider_name(self) -> str:
        return "ollama"

    @property
    def is_configured(self) -> bool:
        return True


class _UnavailableOllamaProvider(_FakeOllamaProvider):
    @property
    def is_configured(self) -> bool:
        return False


class ProviderSelectionTests(unittest.TestCase):
    def setUp(self):
        reset_ai_provider()
        self._env_patch = patch.dict(os.environ, {}, clear=False)
        self._env_patch.start()
        os.environ.pop("AI_PROVIDER", None)
        os.environ.pop("GEMINI_API_KEY", None)

    def tearDown(self):
        self._env_patch.stop()
        reset_ai_provider()

    def test_defaults_to_mock_when_unset(self):
        os.environ.pop("AI_PROVIDER", None)
        provider = create_ai_provider()
        self.assertIsInstance(provider, MockProvider)
        self.assertEqual(provider.provider_name, "mock")
        self.assertFalse(provider.is_configured)

    def test_explicit_mock_provider(self):
        os.environ["AI_PROVIDER"] = "mock"
        provider = create_ai_provider()
        self.assertIsInstance(provider, MockProvider)

    def test_unknown_provider_defaults_to_mock(self):
        os.environ["AI_PROVIDER"] = "unknown-backend"
        provider = create_ai_provider()
        self.assertIsInstance(provider, MockProvider)

    def test_gemini_fallback_without_api_key(self):
        os.environ["AI_PROVIDER"] = "gemini"
        os.environ.pop("GEMINI_API_KEY", None)
        provider = create_ai_provider()
        status = get_provider_status()

        self.assertIsInstance(provider, MockProvider)
        self.assertTrue(status["fallback_applied"])
        self.assertEqual(status["active_provider"], "mock")

    def test_gemini_fallback_with_placeholder_api_key(self):
        os.environ["AI_PROVIDER"] = "gemini"
        os.environ["GEMINI_API_KEY"] = "your_gemini_api_key_here"
        provider = create_ai_provider()

        self.assertIsInstance(provider, MockProvider)
        self.assertTrue(get_provider_status()["fallback_applied"])

    @patch("services.provider_factory.GeminiProvider")
    def test_gemini_selected_when_configured(self, mock_gemini_cls):
        os.environ["AI_PROVIDER"] = "gemini"
        os.environ["GEMINI_API_KEY"] = "valid-test-key"
        mock_gemini_cls.return_value = _FakeGeminiProvider()

        provider = create_ai_provider()

        self.assertIsInstance(provider, ResilientAIProvider)
        self.assertEqual(provider.provider_name, "gemini")
        self.assertFalse(get_provider_status()["fallback_applied"])

    @patch("services.provider_factory.OllamaProvider")
    def test_ollama_fallback_when_unavailable(self, mock_ollama_cls):
        os.environ["AI_PROVIDER"] = "ollama"
        mock_ollama_cls.return_value = _UnavailableOllamaProvider()

        provider = create_ai_provider()
        status = get_provider_status()

        self.assertIsInstance(provider, MockProvider)
        self.assertTrue(status["fallback_applied"])
        self.assertEqual(status["active_provider"], "mock")

    @patch("services.provider_factory.OllamaProvider")
    def test_ollama_selected_when_available(self, mock_ollama_cls):
        os.environ["AI_PROVIDER"] = "ollama"
        mock_ollama_cls.return_value = _FakeOllamaProvider()

        provider = create_ai_provider()

        self.assertIsInstance(provider, ResilientAIProvider)
        self.assertEqual(provider.provider_name, "ollama")

    def test_health_fields_use_provider_agnostic_names(self):
        os.environ["AI_PROVIDER"] = "mock"
        create_ai_provider()
        fields = get_provider_health_fields()

        self.assertEqual(fields["requested_provider"], "mock")
        self.assertEqual(fields["active_provider"], "mock")
        self.assertFalse(fields["provider_configured"])
        self.assertTrue(fields["provider_available"])
        self.assertFalse(fields["fallback_applied"])
        self.assertNotIn("gemini_configured", fields)
        self.assertNotIn("gemini_available", fields)


class MockProviderBehaviorTests(unittest.TestCase):
    def test_evaluate_idea_returns_expected_keys(self):
        provider = MockProvider()
        result = provider.evaluate_idea("Test Idea", "A sample project description for testing.")

        self.assertIn("overall_score", result)
        self.assertIn("feasibility_score", result)
        self.assertIn("strengths", result)
        self.assertEqual(result.get("mode"), "mock")

    def test_mentor_chat_returns_mock_mode(self):
        provider = MockProvider()
        result = provider.mentor_chat("How do I build my team?", [], {})

        self.assertIn("reply", result)
        self.assertEqual(result["mode"], "mock")


class ResilientProviderTests(unittest.TestCase):
    def test_runtime_fallback_on_primary_failure(self):
        class FailingProvider(MockProvider):
            @property
            def provider_name(self):
                return "gemini"

            @property
            def is_configured(self):
                return True

            def evaluate_idea(self, title: str, description: str) -> dict:
                raise RuntimeError("API down")

        resilient = ResilientAIProvider(FailingProvider(), MockProvider())
        result = resilient.evaluate_idea("Title", "Description")

        self.assertEqual(result["mode"], "mock")
        self.assertIn("overall_score", result)


if __name__ == "__main__":
    unittest.main()
