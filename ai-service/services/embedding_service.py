"""
Embedding service stub for AI team integration.
Other teams will implement their own embedding services as needed.
This file serves as a template/interface for semantic operations.
"""

import logging
from typing import List, Optional

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Stub for semantic embedding operations.
    TODO: Implement with sentence-transformers or a cloud embedding API.
    """

    def __init__(self):
        self.is_configured = False
        logger.info("EmbeddingService initialized (stub mode — embeddings not active)")

    def embed_text(self, text: str) -> Optional[List[float]]:
        """
        Generate an embedding vector for the given text.
        Returns None until implemented.
        """
        logger.debug(f"EmbeddingService.embed_text called (stub): '{text[:50]}...'")
        return None

    def embed_batch(self, texts: List[str]) -> List[Optional[List[float]]]:
        """
        Generate embedding vectors for a batch of texts.
        Returns list of None until implemented.
        """
        logger.debug(f"EmbeddingService.embed_batch called (stub): {len(texts)} texts")
        return [None] * len(texts)

    def similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """
        Compute cosine similarity between two embedding vectors.
        Returns 0.0 until implemented.
        """
        return 0.0
