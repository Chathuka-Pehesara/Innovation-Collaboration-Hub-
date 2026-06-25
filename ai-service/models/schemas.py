"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict
from datetime import datetime, timezone
from utils.constants import ProficiencyLevel, SkillCategory, MAX_SKILL_NAME_LENGTH, MIN_SKILL_NAME_LENGTH

class IdeaEvaluationRequest(BaseModel):
    title: str = Field(..., description="Title of the project or idea")
    description: str = Field(..., description="Detailed description of the project or idea")

class IdeaEvaluationResponse(BaseModel):
    overall_score: int = Field(..., description="Overall score between 0 and 100")
    feasibility_score: int = Field(..., description="Feasibility score between 0 and 100")
    feasibility_rationale: str = Field(..., description="Explanation of the feasibility score")
    innovation_score: int = Field(..., description="Innovation score between 0 and 100")
    innovation_rationale: str = Field(..., description="Explanation of the innovation score")
    impact_score: int = Field(..., description="Impact score between 0 and 100")
    impact_rationale: str = Field(..., description="Explanation of the impact score")
    strengths: List[str] = Field(..., description="Key strengths of the proposed idea")
    weaknesses: List[str] = Field(..., description="Key weaknesses/risks of the proposed idea")
    recommendations: List[str] = Field(..., description="Actionable recommendations to improve the idea")
    suggested_tech_stack: List[str] = Field(..., description="List of recommended technologies for development")

# ============================================================================
# SKILLS ENGINE SCHEMAS
# ============================================================================

class SkillBase(BaseModel):
    """Base skill information."""
    name: str = Field(
        ..., 
        min_length=MIN_SKILL_NAME_LENGTH,
        max_length=MAX_SKILL_NAME_LENGTH,
        description="Name of the skill"
    )
    category: Optional[SkillCategory] = Field(
        None, 
        description="Category of the skill (auto-inferred if not provided)"
    )

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        """Validate skill name contains valid characters."""
        v = v.strip()
        if not v:
            raise ValueError("Skill name cannot be empty or whitespace-only")
        return v

class SkillValidationRequest(BaseModel):
    """Request to validate and normalize a skill name."""
    skill_name: str = Field(
        ...,
        min_length=MIN_SKILL_NAME_LENGTH,
        max_length=MAX_SKILL_NAME_LENGTH,
        description="Skill name to validate"
    )
    suggest_category: bool = Field(
        True,
        description="Whether to suggest a category for this skill"
    )

class SkillValidationResponse(BaseModel):
    """Response from skill validation endpoint."""
    original_name: str = Field(..., description="Original skill name provided")
    normalized_name: str = Field(..., description="Normalized skill name")
    category: Optional[SkillCategory] = Field(None, description="Suggested or confirmed category")
    is_predefined: bool = Field(..., description="Whether this is a predefined skill in taxonomy")
    message: str = Field(..., description="Validation status message")

class UserSkill(SkillBase):
    """User's skill with proficiency level."""
    id: Optional[str] = Field(None, description="Unique identifier for user skill record")
    proficiency_level: ProficiencyLevel = Field(
        ProficiencyLevel.BEGINNER,
        description="Proficiency level in this skill"
    )
    endorsements_count: int = Field(
        0,
        ge=0,
        description="Number of peer endorsements"
    )
    created_at: Optional[datetime] = Field(None, description="When this skill was added")
    updated_at: Optional[datetime] = Field(None, description="When this skill was last updated")

class UserSkillRequest(SkillBase):
    """Request to add or update a user skill."""
    proficiency_level: ProficiencyLevel = Field(
        ProficiencyLevel.BEGINNER,
        description="Proficiency level for this skill"
    )

class UserSkillResponse(BaseModel):
    """Response after updating user skill."""
    message: str = Field(..., description="Operation status")
    skill: UserSkill = Field(..., description="Updated skill information")

class SkillListResponse(BaseModel):
    """Response containing list of user skills."""
    user_id: str = Field(..., description="User identifier")
    skills: List[UserSkill] = Field(..., description="List of user's skills")
    total_count: int = Field(..., description="Total number of skills")

class SkillCategoryResponse(BaseModel):
    """Response containing skills in a category."""
    category: SkillCategory = Field(..., description="Skill category")
    description: str = Field(..., description="Category description")
    skills: List[str] = Field(..., description="List of predefined skills in this category")
    total_count: int = Field(..., description="Total number of skills in category")

class SkillCategoriesListResponse(BaseModel):
    """Response containing all skill categories."""
    categories: List[SkillCategoryResponse] = Field(..., description="List of all categories")
    total_categories: int = Field(..., description="Total number of categories")

class SkillMatch(BaseModel):
    """Representation of skill match between two users."""
    skill_name: str = Field(..., description="Name of the matching skill")
    user1_proficiency: ProficiencyLevel = Field(..., description="First user's proficiency level")
    user2_proficiency: ProficiencyLevel = Field(..., description="Second user's proficiency level")
    proficiency_alignment: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="How well-aligned the proficiency levels are (0-1)"
    )

class SkillMatchingResponse(BaseModel):
    """Response from skill matching calculation."""
    user1_id: str = Field(..., description="First user identifier")
    user2_id: str = Field(..., description="Second user identifier")
    overall_similarity: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Overall skill similarity score (0-1)"
    )
    matching_skills: List[SkillMatch] = Field(..., description="Detailed skill matches")
    complementary_skills: Dict[str, List[str]] = Field(
        ...,
        description="Skills user1 has but user2 lacks and vice versa"
    )

class SkillRecommendation(BaseModel):
    """Recommended skill for a user."""
    skill_name: str = Field(..., description="Name of recommended skill")
    category: SkillCategory = Field(..., description="Category of skill")
    reason: str = Field(..., description="Why this skill is recommended")
    complementary_to: List[str] = Field(..., description="Which of user's skills it complements")
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score for recommendation (0-1)"
    )

class SkillRecommendationsResponse(BaseModel):
    """Response containing skill recommendations."""
    user_id: str = Field(..., description="User identifier")
    recommendations: List[SkillRecommendation] = Field(..., description="List of recommendations")
    based_on_count: int = Field(..., description="Number of user's skills analyzed")

class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Machine-readable error code")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="When error occurred"
    )
