"""Deterministic text embedding fallback for AI service features."""

import hashlib
import logging
import math
import re
from typing import List, Optional

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Generate lightweight deterministic embeddings for local similarity checks."""

    def __init__(self, vector_size: int = 64):
        self.vector_size = vector_size
        self.is_configured = True
        logger.info("EmbeddingService initialized with deterministic local embeddings")

    def embed_text(self, text: str) -> Optional[List[float]]:
        """Generate a normalized hashed bag-of-words vector for text."""
        if not isinstance(text, str) or not text.strip():
            return None

        vector = [0.0] * self.vector_size
        tokens = re.findall(r"[a-zA-Z0-9+#.]+", text.lower())

        for token in tokens:
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:2], "big") % self.vector_size
            sign = 1.0 if digest[2] % 2 == 0 else -1.0
            vector[index] += sign

        magnitude = math.sqrt(sum(value * value for value in vector))
        if magnitude == 0:
            return None

        return [value / magnitude for value in vector]

    def embed_batch(self, texts: List[str]) -> List[Optional[List[float]]]:
        """Generate embedding vectors for a batch of texts."""
        return [self.embed_text(text) for text in texts]

    def similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Compute cosine similarity between two embedding vectors."""
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0

        dot_product = sum(left * right for left, right in zip(vec1, vec2))
        score = (dot_product + 1.0) / 2.0
        return min(1.0, max(0.0, score))
