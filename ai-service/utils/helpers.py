"""Skill utility functions for normalization, matching, and categorization."""

import re
import logging
from typing import List, Tuple, Optional, Dict
from utils.constants import (
    PREDEFINED_SKILLS_LOWERCASE, ProficiencyLevel, SkillCategory,
    SKILL_NAME_PATTERN, MAX_SKILL_NAME_LENGTH, MIN_SKILL_NAME_LENGTH,
)

logger = logging.getLogger(__name__)


def normalize_skill_name(skill_name: str) -> str:
    """Normalize skill name with validation and case standardization."""
    normalized = skill_name.strip()
    
    if len(normalized) < MIN_SKILL_NAME_LENGTH or len(normalized) > MAX_SKILL_NAME_LENGTH:
        raise ValueError(
            f"Skill name must be between {MIN_SKILL_NAME_LENGTH} "
            f"and {MAX_SKILL_NAME_LENGTH} characters"
        )
    
    if not re.match(SKILL_NAME_PATTERN, normalized):
        raise ValueError("Invalid characters in skill name")
    
    words = normalized.split()
    words = [w.title() if not any(c in w for c in ["+", "#", "."]) else w for w in words]
    return " ".join(words)


def find_predefined_skill(skill_name: str) -> Optional[Tuple[str, Dict]]:
    """Find skill in predefined taxonomy (case-insensitive)."""
    lookup_key = skill_name.lower().strip()
    if lookup_key in PREDEFINED_SKILLS_LOWERCASE:
        return (lookup_key, PREDEFINED_SKILLS_LOWERCASE[lookup_key])
    return None


def categorize_skill(skill_name: str) -> Optional[SkillCategory]:
    """Auto-categorize skill using taxonomy or keyword matching."""
    predefined = find_predefined_skill(skill_name)
    if predefined:
        return predefined[1].get("category")
    
    skill_lower = skill_name.lower()
    
    if any(lang in skill_lower for lang in ["python", "java", "javascript", "c++", "rust", "go"]):
        return SkillCategory.PROGRAMMING_LANGUAGE
    if any(fw in skill_lower for fw in ["react", "angular", "django", "flask", "spring"]):
        return SkillCategory.FRAMEWORK_LIBRARY
    if any(cloud in skill_lower for cloud in ["aws", "azure", "docker", "kubernetes"]):
        return SkillCategory.CLOUD_DEVOPS
    if any(ds in skill_lower for ds in ["machine learning", "tensorflow", "data analysis", "nlp"]):
        return SkillCategory.DATA_SCIENCE
    if any(sec in skill_lower for sec in ["security", "encryption", "oauth"]):
        return SkillCategory.SECURITY
    if any(soft in skill_lower for soft in ["communication", "leadership", "teamwork"]):
        return SkillCategory.SOFT_SKILLS
    
    return SkillCategory.OTHER


def calculate_skill_match(skills1: List[str], skills2: List[str], weights: Dict[str, float] = None) -> float:
    """Calculate Jaccard similarity between two skill sets (0-1)."""
    if not skills1 or not skills2:
        return 0.0
    
    try:
        norm_skills1 = set(normalize_skill_name(s) for s in skills1)
        norm_skills2 = set(normalize_skill_name(s) for s in skills2)
    except ValueError:
        logger.warning("Error normalizing skills during matching")
        return 0.0
    
    intersection = len(norm_skills1 & norm_skills2)
    union = len(norm_skills1 | norm_skills2)
    
    if union == 0:
        return 0.0
    
    similarity = intersection / union
    return min(1.0, max(0.0, similarity))


def calculate_complementary_skills(skills1: List[str], skills2: List[str]) -> Dict[str, List[str]]:
    """Find unique skills each user has that the other doesn't."""
    try:
        norm_skills1 = set(normalize_skill_name(s) for s in skills1)
        norm_skills2 = set(normalize_skill_name(s) for s in skills2)
    except ValueError:
        return {"user1_unique": [], "user2_unique": []}
    
    return {
        "user1_unique": sorted(list(norm_skills1 - norm_skills2)),
        "user2_unique": sorted(list(norm_skills2 - norm_skills1)),
    }


def calculate_proficiency_alignment(prof1: ProficiencyLevel, prof2: ProficiencyLevel) -> float:
    """
    Calculate alignment score between proficiency levels.
    Higher score = better alignment for complementary expertise.
    """
    levels = [
        ProficiencyLevel.BEGINNER,
        ProficiencyLevel.INTERMEDIATE,
        ProficiencyLevel.ADVANCED,
        ProficiencyLevel.EXPERT,
    ]
    
    try:
        idx1 = levels.index(prof1)
        idx2 = levels.index(prof2)
        distance = abs(idx1 - idx2)
        return 1.0 - (distance * 0.25)  # Different levels are complementary
    except ValueError:
        return 0.0


def extract_skills_from_text(text: str, max_skills: int = 10) -> List[str]:
    """Extract potential skills from text by keyword matching."""
    if not text:
        return []
    
    text_lower = text.lower()
    extracted = []
    
    for skill_key in PREDEFINED_SKILLS_LOWERCASE.keys():
        if skill_key in text_lower and skill_key not in extracted:
            extracted.append(skill_key)
            if len(extracted) >= max_skills:
                break
    
    try:
        extracted = [normalize_skill_name(s) for s in extracted]
    except ValueError:
        pass
    
    return extracted[:max_skills]


def clean_text(text: str) -> str:
    """Remove extra whitespace and normalize text."""
    text = " ".join(text.split())
    text = text.encode("ascii", "ignore").decode("ascii")
    return text.strip()


def sanitize_input(text: str) -> str:
    """Sanitize user input by removing control characters."""
    text = "".join(ch for ch in text if ord(ch) >= 32 or ch in "\n\t\r")
    return text[:1000]


