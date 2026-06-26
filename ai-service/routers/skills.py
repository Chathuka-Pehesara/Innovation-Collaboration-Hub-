"""
Skills management endpoints for skill validation, categorization, and team matching.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
import logging
from datetime import datetime, timezone

from models.schemas import (
    SkillValidationRequest, SkillValidationResponse,
    UserSkill, UserSkillRequest, UserSkillResponse, SkillListResponse,
    SkillCategoryResponse, SkillCategoriesListResponse,
    SkillMatchingResponse, SkillMatch,
    SkillRecommendationsResponse, SkillRecommendation,
)
from utils.helpers import (
    normalize_skill_name, find_predefined_skill, categorize_skill,
    calculate_skill_match, calculate_complementary_skills,
    calculate_proficiency_alignment, extract_skills_from_text,
)
from utils.constants import (
    SkillCategory, ProficiencyLevel,
    SKILL_CATEGORY_DESCRIPTIONS, PREDEFINED_SKILLS, MAX_SKILLS_PER_USER,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/skills", tags=["skills"])


@router.post("/validate", response_model=SkillValidationResponse, status_code=200)
async def validate_skill(request: SkillValidationRequest) -> SkillValidationResponse:
    """Validate and normalize a skill name with optional category suggestion."""
    try:
        normalized_name = normalize_skill_name(request.skill_name)
        predefined = find_predefined_skill(normalized_name)
        is_predefined = predefined is not None
        category = predefined[1].get("category") if predefined else None
        
        if not category and request.suggest_category:
            category = categorize_skill(normalized_name)
        
        return SkillValidationResponse(
            original_name=request.skill_name,
            normalized_name=normalized_name,
            category=category,
            is_predefined=is_predefined,
            message="Skill validated successfully"
        )
    except ValueError as e:
        logger.warning(f"Skill validation failed for '{request.skill_name}': {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during skill validation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/categories", response_model=SkillCategoriesListResponse, status_code=200)
async def list_skill_categories() -> SkillCategoriesListResponse:
    """Get all skill categories with their available skills."""
    try:
        categories = []
        for category in SkillCategory:
            skills = [
                skill for skill, info in PREDEFINED_SKILLS.items()
                if info.get("category") == category
            ]
            categories.append(
                SkillCategoryResponse(
                    category=category,
                    description=SKILL_CATEGORY_DESCRIPTIONS.get(category, ""),
                    skills=sorted(skills),
                    total_count=len(skills)
                )
            )
        return SkillCategoriesListResponse(
            categories=categories,
            total_categories=len(categories)
        )
    except Exception as e:
        logger.error(f"Error listing skill categories: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error retrieving skill categories")


@router.get("/categories/{category_name}", response_model=SkillCategoryResponse, status_code=200)
async def get_category_skills(category_name: str) -> SkillCategoryResponse:
    """Get all predefined skills in a specific category."""
    matching_category = next(
        (cat for cat in SkillCategory if cat.value.lower() == category_name.lower()),
        None
    )
    
    if not matching_category:
        raise HTTPException(status_code=404, detail=f"Category '{category_name}' not found")
    
    skills = [
        skill for skill, info in PREDEFINED_SKILLS.items()
        if info.get("category") == matching_category
    ]
    
    return SkillCategoryResponse(
        category=matching_category,
        description=SKILL_CATEGORY_DESCRIPTIONS.get(matching_category, ""),
        skills=sorted(skills),
        total_count=len(skills)
    )


@router.post("/profile/{user_id}/skills", response_model=UserSkillResponse, status_code=201)
async def add_user_skill(user_id: str, request: UserSkillRequest) -> UserSkillResponse:
    """Add or update a skill for a user profile."""
    if not user_id or not user_id.strip():
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    try:
        normalized_name = normalize_skill_name(request.name)
        category = request.category or categorize_skill(normalized_name)
        
        # MVP: persist via backend ORM when database integration is enabled
        user_skill = UserSkill(
            id=f"{user_id}_{normalized_name.replace(' ', '_').lower()}",
            name=normalized_name,
            category=category,
            proficiency_level=request.proficiency_level,
            endorsements_count=0,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        
        logger.info(f"User {user_id} added skill: {normalized_name} ({request.proficiency_level})")
        return UserSkillResponse(
            message=f"Skill '{normalized_name}' added successfully",
            skill=user_skill
        )
    except ValueError as e:
        logger.warning(f"Invalid skill for user {user_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/profile/{user_id}/skills", response_model=SkillListResponse, status_code=200)
async def get_user_skills(
    user_id: str,
    category: Optional[str] = Query(None),
    min_proficiency: Optional[str] = Query(None)
) -> SkillListResponse:
    """Retrieve user's skills with optional filtering by category or proficiency level."""
    if not user_id or not user_id.strip():
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # MVP: mock data until database integration
    mock_skills = [
        UserSkill(
            id=f"{user_id}_python",
            name="Python", category=SkillCategory.PROGRAMMING_LANGUAGE,
            proficiency_level=ProficiencyLevel.ADVANCED, endorsements_count=5,
            created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc),
        ),
    ]
    
    filtered = mock_skills
    if category:
        try:
            cat = SkillCategory(category)
            filtered = [s for s in filtered if s.category == cat]
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    
    if min_proficiency:
        try:
            prof = ProficiencyLevel(min_proficiency)
            levels = [ProficiencyLevel.BEGINNER, ProficiencyLevel.INTERMEDIATE,
                     ProficiencyLevel.ADVANCED, ProficiencyLevel.EXPERT]
            min_idx = levels.index(prof)
            filtered = [s for s in filtered if levels.index(s.proficiency_level) >= min_idx]
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid proficiency: {min_proficiency}")
    
    return SkillListResponse(user_id=user_id, skills=filtered, total_count=len(filtered))


@router.delete("/profile/{user_id}/skills/{skill_name}", status_code=204)
async def delete_user_skill(user_id: str, skill_name: str):
    """Remove a skill from user's profile."""
    if not user_id or not skill_name:
        raise HTTPException(status_code=400, detail="Missing user ID or skill name")
    
    try:
        normalized = normalize_skill_name(skill_name)
        logger.info(f"User {user_id} deleted skill: {normalized}")
        # MVP: mock data until database integration
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/match/{user1_id}/{user2_id}", response_model=SkillMatchingResponse, status_code=200)
async def match_users_by_skills(user1_id: str, user2_id: str) -> SkillMatchingResponse:
    """Calculate skill compatibility between two users for team matching."""
    if not user1_id or not user2_id:
        raise HTTPException(status_code=400, detail="Invalid user IDs")
    
    # MVP: mock data until database integration
    skills1 = ["Python", "FastAPI", "Machine Learning"]
    skills2 = ["Python", "React", "Project Management"]
    
    similarity = calculate_skill_match(skills1, skills2)
    complementary = calculate_complementary_skills(skills1, skills2)
    
    matching_skills = [
        SkillMatch(
            skill_name="Python",
            user1_proficiency=ProficiencyLevel.ADVANCED,
            user2_proficiency=ProficiencyLevel.INTERMEDIATE,
            proficiency_alignment=calculate_proficiency_alignment(
                ProficiencyLevel.ADVANCED,
                ProficiencyLevel.INTERMEDIATE
            )
        )
    ]
    
    return SkillMatchingResponse(
        user1_id=user1_id,
        user2_id=user2_id,
        overall_similarity=similarity,
        matching_skills=matching_skills,
        complementary_skills=complementary
    )


@router.get("/profile/{user_id}/recommendations", response_model=SkillRecommendationsResponse)
async def get_skill_recommendations(
    user_id: str,
    limit: int = Query(5, ge=1, le=20)
) -> SkillRecommendationsResponse:
    """Get AI-powered skill recommendations based on user's current skills."""
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # MVP: mock data until database integration
    current_skills = ["Python", "FastAPI"]
    recommendations = []
    
    if any("python" in s.lower() for s in current_skills):
        recommendations.extend([
            SkillRecommendation(
                skill_name="Django",
                category=SkillCategory.FRAMEWORK_LIBRARY,
                reason="Complementary web framework for Python developers",
                complementary_to=["Python"],
                confidence_score=0.9
            ),
            SkillRecommendation(
                skill_name="PostgreSQL",
                category=SkillCategory.TOOLS_PLATFORMS,
                reason="Essential database for backend developers",
                complementary_to=["Python", "FastAPI"],
                confidence_score=0.85
            ),
        ])
    
    return SkillRecommendationsResponse(
        user_id=user_id,
        recommendations=recommendations[:limit],
        based_on_count=len(current_skills)
    )


@router.get("/health")
async def health_check() -> dict:
    """Health check for skills service."""
    return {
        "status": "healthy",
        "service": "Skills Engine",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

