"""
Skills management endpoints for skill validation, categorization, and team matching.
"""

from fastapi import APIRouter, HTTPException, Query, status, Depends
from typing import Optional, List
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from utils.db import get_db
from models.db_models import UserSkill as DBUserSkill
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
    calculate_proficiency_alignment,
)
from utils.constants import (
    SkillCategory, ProficiencyLevel,
    SKILL_CATEGORY_DESCRIPTIONS, PREDEFINED_SKILLS,
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
async def add_user_skill(
    user_id: str,
    request: UserSkillRequest,
    db: Session = Depends(get_db)
) -> UserSkillResponse:
    """Add or update a skill for a user profile in the database."""
    if not user_id or not user_id.strip():
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    try:
        normalized_name = normalize_skill_name(request.name)
        category = request.category or categorize_skill(normalized_name)
        
        # Check if the skill already exists for this user
        existing = db.query(DBUserSkill).filter_by(user_id=user_id, skill_name=normalized_name).first()
        if existing:
            existing.proficiency_level = request.proficiency_level.value if hasattr(request.proficiency_level, 'value') else request.proficiency_level
            existing.skill_category = category.value if hasattr(category, 'value') else category
            existing.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing)
            db_skill = existing
        else:
            db_skill = DBUserSkill(
                id=f"{user_id}_{normalized_name.replace(' ', '_').lower()}",
                user_id=user_id,
                skill_name=normalized_name,
                skill_category=category.value if hasattr(category, 'value') else category,
                proficiency_level=request.proficiency_level.value if hasattr(request.proficiency_level, 'value') else request.proficiency_level,
                endorsements_count=0
            )
            db.add(db_skill)
            db.commit()
            db.refresh(db_skill)
        
        user_skill = UserSkill(
            id=db_skill.id,
            name=db_skill.skill_name,
            category=SkillCategory(db_skill.skill_category) if db_skill.skill_category else None,
            proficiency_level=ProficiencyLevel(db_skill.proficiency_level),
            endorsements_count=db_skill.endorsements_count,
            created_at=db_skill.created_at.replace(tzinfo=timezone.utc),
            updated_at=db_skill.updated_at.replace(tzinfo=timezone.utc)
        )
        
        logger.info(f"User {user_id} added/updated skill: {normalized_name} ({request.proficiency_level})")
        return UserSkillResponse(
            message=f"Skill '{normalized_name}' added successfully",
            skill=user_skill
        )
    except ValueError as e:
        logger.warning(f"Invalid skill for user {user_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error adding user skill: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/profile/{user_id}/skills", response_model=SkillListResponse, status_code=200)
async def get_user_skills(
    user_id: str,
    category: Optional[str] = Query(None),
    min_proficiency: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> SkillListResponse:
    """Retrieve user's skills from the database with optional filtering by category or proficiency level."""
    if not user_id or not user_id.strip():
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    try:
        query = db.query(DBUserSkill).filter_by(user_id=user_id)
        
        if category:
            try:
                cat = SkillCategory(category)
                query = query.filter_by(skill_category=cat.value)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
        
        db_skills = query.all()
        
        user_skills = []
        levels = [ProficiencyLevel.BEGINNER, ProficiencyLevel.INTERMEDIATE,
                 ProficiencyLevel.ADVANCED, ProficiencyLevel.EXPERT]
        
        min_idx = -1
        if min_proficiency:
            try:
                prof = ProficiencyLevel(min_proficiency)
                min_idx = levels.index(prof)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid proficiency: {min_proficiency}")
        
        for db_skill in db_skills:
            try:
                prof = ProficiencyLevel(db_skill.proficiency_level)
                if min_idx != -1 and levels.index(prof) < min_idx:
                    continue
                
                user_skills.append(UserSkill(
                    id=db_skill.id,
                    name=db_skill.skill_name,
                    category=SkillCategory(db_skill.skill_category) if db_skill.skill_category else None,
                    proficiency_level=prof,
                    endorsements_count=db_skill.endorsements_count,
                    created_at=db_skill.created_at.replace(tzinfo=timezone.utc) if db_skill.created_at else None,
                    updated_at=db_skill.updated_at.replace(tzinfo=timezone.utc) if db_skill.updated_at else None
                ))
            except ValueError:
                continue
                
        return SkillListResponse(user_id=user_id, skills=user_skills, total_count=len(user_skills))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching skills for {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/profile/{user_id}/skills/{skill_name}", status_code=204)
async def delete_user_skill(
    user_id: str,
    skill_name: str,
    db: Session = Depends(get_db)
):
    """Remove a skill from user's profile in the database."""
    if not user_id or not skill_name:
        raise HTTPException(status_code=400, detail="Missing user ID or skill name")
    
    try:
        normalized = normalize_skill_name(skill_name)
        db_skill = db.query(DBUserSkill).filter_by(user_id=user_id, skill_name=normalized).first()
        if db_skill:
            db.delete(db_skill)
            db.commit()
            logger.info(f"User {user_id} deleted skill: {normalized}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting skill: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/match/{user1_id}/{user2_id}", response_model=SkillMatchingResponse, status_code=200)
async def match_users_by_skills(
    user1_id: str,
    user2_id: str,
    db: Session = Depends(get_db)
) -> SkillMatchingResponse:
    """Calculate skill compatibility between two users for team matching using database data."""
    if not user1_id or not user2_id:
        raise HTTPException(status_code=400, detail="Invalid user IDs")
    
    try:
        skills1_records = db.query(DBUserSkill).filter_by(user_id=user1_id).all()
        skills2_records = db.query(DBUserSkill).filter_by(user_id=user2_id).all()
        
        skills1 = [s.skill_name for s in skills1_records]
        skills2 = [s.skill_name for s in skills2_records]
        
        similarity = calculate_skill_match(skills1, skills2)
        complementary = calculate_complementary_skills(skills1, skills2)
        
        matching_skills = []
        skills2_map = {s.skill_name: s for s in skills2_records}
        for s1 in skills1_records:
            if s1.skill_name in skills2_map:
                s2 = skills2_map[s1.skill_name]
                prof1 = ProficiencyLevel(s1.proficiency_level)
                prof2 = ProficiencyLevel(s2.proficiency_level)
                matching_skills.append(SkillMatch(
                    skill_name=s1.skill_name,
                    user1_proficiency=prof1,
                    user2_proficiency=prof2,
                    proficiency_alignment=calculate_proficiency_alignment(prof1, prof2)
                ))
                
        return SkillMatchingResponse(
            user1_id=user1_id,
            user2_id=user2_id,
            overall_similarity=similarity,
            matching_skills=matching_skills,
            complementary_skills=complementary
        )
    except Exception as e:
        logger.error(f"Error matching users {user1_id} and {user2_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/profile/{user_id}/recommendations", response_model=SkillRecommendationsResponse)
async def get_skill_recommendations(
    user_id: str,
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
) -> SkillRecommendationsResponse:
    """Get AI-powered skill recommendations based on user's current skills from database."""
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    try:
        skills_records = db.query(DBUserSkill).filter_by(user_id=user_id).all()
        current_skills = [s.skill_name for s in skills_records]
        
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
    except Exception as e:
        logger.error(f"Error fetching recommendations for {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/health")
async def health_check() -> dict:
    """Health check for skills service."""
    return {
        "status": "healthy",
        "service": "Skills Engine",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

