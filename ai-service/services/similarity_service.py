"""Similarity scoring helpers for profiles, skills, and free text.

Not wired into ``routers/matching.py``. The Team Matching Engine scores
compatibility with ``calculate_skill_match``, ``calculate_complementary_skills``,
and ``calculate_proficiency_alignment`` from ``utils.helpers`` — the same Jaccard
logic that ``skill_similarity`` wraps here.

Remain standalone because:
- Skill matching is intentionally exact-name Jaccard on the predefined taxonomy.
- ``text_similarity`` / ``EmbeddingService`` target unstructured text, not skill lists.
- ``ranked_candidates`` is a reusable helper for future endpoints (e.g. bulk ranking).

Integrate when a matching endpoint needs text-based or batch ranking; the current
MVP algorithm does not.
"""

from typing import Iterable, List

from services.embedding_service import EmbeddingService
from utils.helpers import calculate_skill_match, normalize_skill_list


class SimilarityService:
    """Shared similarity operations used by AI matching features."""

    def __init__(self, embedding_service: EmbeddingService | None = None):
        self.embedding_service = embedding_service or EmbeddingService()

    def skill_similarity(self, skills1: Iterable[str], skills2: Iterable[str]) -> float:
        """Score normalized skill overlap using Jaccard similarity."""
        return calculate_skill_match(
            normalize_skill_list(skills1),
            normalize_skill_list(skills2),
        )

    def text_similarity(self, text1: str, text2: str) -> float:
        """Score text similarity using deterministic local embeddings."""
        vector1 = self.embedding_service.embed_text(text1)
        vector2 = self.embedding_service.embed_text(text2)
        if vector1 is None or vector2 is None:
            return 0.0
        return self.embedding_service.similarity(vector1, vector2)

    def ranked_candidates(
        self,
        source_skills: Iterable[str],
        candidate_skill_lists: List[Iterable[str]],
    ) -> List[tuple[int, float]]:
        """Rank candidate skill lists by similarity to a source profile."""
        scored = [
            (index, self.skill_similarity(source_skills, candidate_skills))
            for index, candidate_skills in enumerate(candidate_skill_lists)
        ]
        return sorted(scored, key=lambda item: item[1], reverse=True)
