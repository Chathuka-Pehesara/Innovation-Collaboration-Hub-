"""
Team Matching Engine endpoints for finding complementary teammates and validating team composition.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict
import logging
from datetime import datetime, timezone

from utils.helpers import (
    calculate_skill_match, calculate_complementary_skills,
    calculate_proficiency_alignment, normalize_skill_name,
)
from utils.constants import (
    SkillCategory, ProficiencyLevel, PREDEFINED_SKILLS, PREDEFINED_SKILLS_LOWERCASE,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/matching", tags=["matching"])


# ============================================================================
# SCHEMAS FOR MATCHING ENDPOINTS
# ============================================================================

from pydantic import BaseModel, Field


class TeammateResult(BaseModel):
    """Single teammate suggestion result."""
    user_id: str = Field(..., description="Suggested teammate's user ID")
    compatibility_score: float = Field(
        ..., ge=0.0, le=1.0,
        description="Overall compatibility score (0-1)"
    )
    matching_skills: List[str] = Field(
        ..., description="Skills both users share"
    )
    complementary_skills: Dict[str, List[str]] = Field(
        ..., description="Unique skills each user offers"
    )
    team_balance_score: float = Field(
        ..., ge=0.0, le=1.0,
        description="How well this person balances the team (0-1)"
    )
    proficiency_distribution: Dict[str, int] = Field(
        ..., description="Count of skills at each proficiency level"
    )


class FindTeammatesResponse(BaseModel):
    """Response for find-teammates endpoint."""
    user_id: str = Field(..., description="User requesting teammates")
    suggestions: List[TeammateResult] = Field(
        ..., description="List of suggested teammates ranked by compatibility"
    )
    total_suggestions: int = Field(..., description="Number of suggestions provided")


class TeamCompositionAnalysis(BaseModel):
    """Analysis of team composition."""
    overall_team_score: float = Field(
        ..., ge=1.0, le=10.0,
        description="Overall team quality score (1-10)"
    )
    skill_diversity: float = Field(
        ..., ge=1.0, le=10.0,
        description="Diversity of skills in team (1-10)"
    )
    coverage_completeness: float = Field(
        ..., ge=1.0, le=10.0,
        description="How many key skill areas are covered (1-10)"
    )
    skill_gaps: List[str] = Field(
        ..., description="Missing skills that would strengthen the team"
    )
    skill_redundancy: Dict[str, int] = Field(
        ..., description="Skills that are over-represented in the team"
    )
    proficiency_balance: Dict[str, int] = Field(
        ..., description="Distribution of proficiency levels"
    )
    team_recommendations: List[str] = Field(
        ..., description="Recommendations to improve team composition"
    )


class ValidateTeamResponse(BaseModel):
    """Response for validate-team endpoint."""
    team_analysis: TeamCompositionAnalysis
    member_count: int = Field(..., description="Number of team members")


class SkillGap(BaseModel):
    """A skill gap that needs to be filled."""
    skill_name: str
    category: SkillCategory
    recommended_proficiency: ProficiencyLevel
    learning_resources: List[str]
    priority: str = Field(
        ..., description="Priority level: high, medium, low"
    )


class TeamGapsResponse(BaseModel):
    """Response for team-gaps endpoint."""
    team_id: str
    gaps: List[SkillGap]
    total_gaps: int


class CompatibilityBreakdown(BaseModel):
    """Detailed compatibility analysis between two users."""
    skill_category: str
    matching_skills_count: int
    user1_unique: List[str]
    user2_unique: List[str]
    compatibility_in_category: float = Field(
        ..., ge=0.0, le=1.0
    )


class DuoCompatibilityResponse(BaseModel):
    """Response for duo compatibility analysis."""
    user1_id: str
    user2_id: str
    overall_compatibility: float = Field(
        ..., ge=0.0, le=1.0,
        description="Overall compatibility score"
    )
    skill_match_score: float = Field(
        ..., ge=0.0, le=1.0,
        description="Skill overlap compatibility"
    )
    complementary_score: float = Field(
        ..., ge=0.0, le=1.0,
        description="How well they complement each other"
    )
    category_breakdown: List[CompatibilityBreakdown]
    communication_style_match: str = Field(
        ..., description="Estimated communication compatibility"
    )
    timezone_compatibility: Optional[str] = Field(
        None, description="Timezone overlap for collaboration"
    )
    recommendation: str = Field(
        ..., description="'Good match' / 'Moderate' / 'Build skills first'"
    )
    rationale: str = Field(..., description="Explanation for recommendation")


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _get_mock_user_skills(user_id: str) -> Dict[str, str]:
    """Get mock user skills for MVP (database integration pending)."""
    mock_data = {
        "user1": {
            "Python": "Advanced",
            "FastAPI": "Advanced",
            "Machine Learning": "Intermediate",
            "PostgreSQL": "Intermediate",
            "Docker": "Beginner",
        },
        "user2": {
            "Python": "Intermediate",
            "React": "Advanced",
            "TypeScript": "Advanced",
            "Project Management": "Advanced",
            "Communication": "Advanced",
        },
        "user3": {
            "Java": "Advanced",
            "Spring Boot": "Advanced",
            "AWS": "Intermediate",
            "Leadership": "Advanced",
            "Kubernetes": "Beginner",
        },
        "user4": {
            "Python": "Expert",
            "Data Science": "Expert",
            "TensorFlow": "Advanced",
            "NumPy": "Advanced",
            "Critical Thinking": "Expert",
        },
    }
    return mock_data.get(user_id, {})


def _get_skill_gaps_for_team(team_members: List[Dict]) -> List[SkillGap]:
    """Identify missing expertise in a team."""
    all_team_skills = set()
    for member in team_members:
        for skill in member.get("skills", []):
            try:
                all_team_skills.add(normalize_skill_name(skill))
            except ValueError:
                pass

    critical_skills = [
        ("Communication", SkillCategory.SOFT_SKILLS, ProficiencyLevel.INTERMEDIATE, "high"),
        ("Project Management", SkillCategory.SOFT_SKILLS, ProficiencyLevel.INTERMEDIATE, "high"),
        ("Leadership", SkillCategory.SOFT_SKILLS, ProficiencyLevel.ADVANCED, "medium"),
        ("Problem Solving", SkillCategory.SOFT_SKILLS, ProficiencyLevel.ADVANCED, "high"),
        ("Python", SkillCategory.PROGRAMMING_LANGUAGE, ProficiencyLevel.INTERMEDIATE, "medium"),
    ]

    gaps = []
    for skill_name, category, recommended_prof, priority in critical_skills:
        if skill_name not in all_team_skills:
            gaps.append(SkillGap(
                skill_name=skill_name,
                category=category,
                recommended_proficiency=recommended_prof,
                learning_resources=[
                    f"Coursera: {skill_name} Fundamentals",
                    f"Udemy: {skill_name} Mastery",
                    f"LinkedIn Learning: {skill_name} for Teams",
                ],
                priority=priority,
            ))

    return gaps


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/find-teammates", response_model=FindTeammatesResponse, status_code=200)
async def find_teammates(
    user_id: str = Query(..., description="User requesting teammates"),
    max_suggestions: int = Query(5, ge=1, le=20, description="Maximum number of suggestions"),
) -> FindTeammatesResponse:
    """
    Suggest complementary teammates for a user.

    Algorithm combines:
    - Skill overlap (Jaccard similarity)
    - Complementary skills (unique skills each offers)
    - Proficiency balance (teams need junior/senior mix)

    MVP: uses hardcoded mock user profiles (`user1`–`user4`); no database lookup.
    """
    if not user_id or not user_id.strip():
        raise HTTPException(status_code=400, detail="Invalid user ID")

    try:
        # MVP: mock data until database integration
        user_skills = _get_mock_user_skills(user_id)
        if not user_skills:
            logger.warning(f"No skills found for user {user_id}")
            raise HTTPException(
                status_code=404,
                detail=f"User {user_id} not found or has no skills"
            )

        user_skill_list = list(user_skills.keys())

        suggestions: List[TeammateResult] = []
        candidate_users = ["user1", "user2", "user3", "user4"]

        for candidate_id in candidate_users:
            if candidate_id == user_id:
                continue

            # MVP: mock data until database integration
            candidate_skills = _get_mock_user_skills(candidate_id)
            candidate_skill_list = list(candidate_skills.keys())

            if not candidate_skill_list:
                continue

            # Calculate skill match (Jaccard similarity)
            skill_match = calculate_skill_match(user_skill_list, candidate_skill_list)

            # Calculate complementary skills
            complementary = calculate_complementary_skills(user_skill_list, candidate_skill_list)
            unique_for_user = len(complementary.get("user1_unique", []))
            unique_for_candidate = len(complementary.get("user2_unique", []))
            complementary_value = (unique_for_user + unique_for_candidate) / max(
                len(user_skill_list) + len(candidate_skill_list), 1
            )

            # Calculate proficiency balance
            user_prof_levels = [
                ProficiencyLevel(user_skills[s]) for s in user_skill_list
            ]
            candidate_prof_levels = [
                ProficiencyLevel(candidate_skills[s]) for s in candidate_skill_list
            ]

            balance_diffs = []
            for prof1 in user_prof_levels:
                for prof2 in candidate_prof_levels:
                    balance_diffs.append(
                        calculate_proficiency_alignment(prof1, prof2)
                    )

            balance_score = sum(balance_diffs) / len(balance_diffs) if balance_diffs else 0.5

            # Multi-factor compatibility score
            weights = {
                "skill_match": 0.35,
                "complementary": 0.35,
                "balance": 0.30,
            }
            compatibility = (
                skill_match * weights["skill_match"] +
                complementary_value * weights["complementary"] +
                balance_score * weights["balance"]
            )

            # Get proficiency distribution
            proficiency_dist = {}
            for prof in ProficiencyLevel:
                count = sum(1 for p in candidate_prof_levels if p == prof)
                if count > 0:
                    proficiency_dist[prof.value] = count

            suggestions.append(TeammateResult(
                user_id=candidate_id,
                compatibility_score=min(1.0, max(0.0, compatibility)),
                matching_skills=sorted(
                    list(set(user_skill_list) & set(candidate_skill_list))
                ),
                complementary_skills=complementary,
                team_balance_score=min(1.0, max(0.0, balance_score)),
                proficiency_distribution=proficiency_dist,
            ))

        suggestions.sort(key=lambda x: x.compatibility_score, reverse=True)
        suggestions = suggestions[:max_suggestions]

        logger.info(
            f"Found {len(suggestions)} teammate suggestions for user {user_id}"
        )

        return FindTeammatesResponse(
            user_id=user_id,
            suggestions=suggestions,
            total_suggestions=len(suggestions),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error finding teammates for {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/validate-team", response_model=ValidateTeamResponse, status_code=200)
async def validate_team(
    team_ids: List[str] = Query(..., description="List of user IDs forming the team"),
) -> ValidateTeamResponse:
    """
    Score existing team composition.

    Analyzes:
    - Overall team score (1-10)
    - Skill diversity
    - Coverage completeness
    - Skill gaps and redundancy
    - Balance metrics
    """
    if not team_ids or len(team_ids) == 0:
        raise HTTPException(status_code=400, detail="Team must have at least one member")

    if len(team_ids) > 20:
        raise HTTPException(status_code=400, detail="Team cannot exceed 20 members")

    try:
        # MVP: mock data until database integration
        team_members = []
        all_skills = {}
        all_skill_names = set()

        for user_id in team_ids:
            skills = _get_mock_user_skills(user_id)
            if not skills:
                logger.warning(f"User {user_id} has no skills")
                continue

            team_members.append({
                "user_id": user_id,
                "skills": list(skills.keys()),
                "proficiency_levels": skills,
            })

            for skill_name, prof_level in skills.items():
                all_skill_names.add(skill_name)
                all_skills[skill_name] = prof_level

        if not team_members:
            raise HTTPException(
                status_code=404,
                detail="No valid users found with skills"
            )

        # Calculate skill diversity (unique skills / total skills)
        unique_skill_count = len(all_skill_names)
        total_team_skills = sum(len(m["skills"]) for m in team_members)
        skill_diversity = min(10.0, (unique_skill_count / max(total_team_skills, 1)) * 10)

        # Calculate coverage completeness
        skill_categories_covered = set()
        for skill in all_skill_names:
            skill_info = PREDEFINED_SKILLS_LOWERCASE.get(skill.lower())
            if skill_info:
                skill_categories_covered.add(skill_info.get("category", SkillCategory.OTHER))

        coverage = len(skill_categories_covered) / len(SkillCategory) * 10

        # Find skill gaps
        gaps = _get_skill_gaps_for_team(team_members)

        # Calculate proficiency distribution
        all_profs = [
            ProficiencyLevel(prof) for prof in all_skills.values()
        ]
        prof_balance = {}
        for prof in ProficiencyLevel:
            count = sum(1 for p in all_profs if p == prof)
            prof_balance[prof.value] = count

        # Find skill redundancy
        skill_counts = {}
        for member in team_members:
            for skill in member["skills"]:
                skill_counts[skill] = skill_counts.get(skill, 0) + 1

        redundancy = {
            skill: count for skill, count in skill_counts.items() if count > 1
        }

        # Generate recommendations
        recommendations = []
        if skill_diversity < 5.0:
            recommendations.append("Consider adding members with diverse skill sets")
        if coverage < 5.0:
            recommendations.append("Team is missing expertise in several key skill categories")
        if len(gaps) > 0:
            recommendations.append(f"Priority: Fill {len([g for g in gaps if g.priority == 'high'])} high-priority skill gaps")

        # Overall team score (1-10)
        overall_score = (skill_diversity + coverage) / 2
        if len(gaps) >= 5:
            overall_score -= 1.0
        overall_score = min(10.0, max(1.0, overall_score))

        analysis = TeamCompositionAnalysis(
            overall_team_score=overall_score,
            skill_diversity=min(10.0, max(1.0, skill_diversity)),
            coverage_completeness=min(10.0, max(1.0, coverage)),
            skill_gaps=[g.skill_name for g in gaps],
            skill_redundancy=redundancy,
            proficiency_balance=prof_balance,
            team_recommendations=recommendations,
        )

        logger.info(f"Validated team with {len(team_members)} members")

        return ValidateTeamResponse(
            team_analysis=analysis,
            member_count=len(team_members),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating team: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/team-gaps/{team_id}", response_model=TeamGapsResponse, status_code=200)
async def get_team_gaps(
    team_id: str,
) -> TeamGapsResponse:
    """
    Identify missing expertise in a team and suggest proficiency levels needed.

    Returns required skills to fill gaps with learning resources.
    """
    if not team_id or not team_id.strip():
        raise HTTPException(status_code=400, detail="Invalid team ID")

    try:
        # MVP: mock data until database integration
        # For MVP, mock team with team_id
        mock_teams = {
            "team1": ["user1", "user2"],
            "team2": ["user3", "user4"],
        }

        member_ids = mock_teams.get(team_id)
        if not member_ids:
            raise HTTPException(
                status_code=404,
                detail=f"Team {team_id} not found"
            )

        team_members = []
        for user_id in member_ids:
            skills = _get_mock_user_skills(user_id)
            if skills:
                team_members.append({
                    "user_id": user_id,
                    "skills": list(skills.keys()),
                })

        gaps = _get_skill_gaps_for_team(team_members)

        logger.info(f"Identified {len(gaps)} skill gaps for team {team_id}")

        return TeamGapsResponse(
            team_id=team_id,
            gaps=gaps,
            total_gaps=len(gaps),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting team gaps for {team_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post(
    "/compatibility/{user1_id}/{user2_id}",
    response_model=DuoCompatibilityResponse,
    status_code=200
)
async def get_duo_compatibility(
    user1_id: str,
    user2_id: str,
) -> DuoCompatibilityResponse:
    """
    Deep dive into two-person compatibility with detailed analysis.

    Includes:
    - Skills match breakdown by category
    - Communication style analysis (mock for MVP)
    - Timezone compatibility (mock for MVP)
    - Detailed recommendation
    """
    if not user1_id or not user2_id:
        raise HTTPException(status_code=400, detail="Invalid user IDs")

    if user1_id == user2_id:
        raise HTTPException(status_code=400, detail="Cannot compare user with themselves")

    try:
        # MVP: mock data until database integration
        user1_skills = _get_mock_user_skills(user1_id)
        user2_skills = _get_mock_user_skills(user2_id)

        if not user1_skills or not user2_skills:
            raise HTTPException(
                status_code=404,
                detail="One or both users not found or have no skills"
            )

        user1_skill_list = list(user1_skills.keys())
        user2_skill_list = list(user2_skills.keys())

        # Overall skill match
        skill_match_score = calculate_skill_match(user1_skill_list, user2_skill_list)

        # Complementary skills score
        complementary = calculate_complementary_skills(user1_skill_list, user2_skill_list)
        unique_for_user1 = len(complementary.get("user1_unique", []))
        unique_for_user2 = len(complementary.get("user2_unique", []))
        complementary_score = (unique_for_user1 + unique_for_user2) / max(
            len(user1_skill_list) + len(user2_skill_list), 1
        )

        # Category breakdown
        category_breakdown: List[CompatibilityBreakdown] = []

        def _skills_in_category(skill_list: List[str], category: SkillCategory) -> List[str]:
            return [
                skill for skill in skill_list
                if PREDEFINED_SKILLS_LOWERCASE.get(skill.lower(), {}).get("category") == category
            ]

        for category in SkillCategory:
            category_skills1 = _skills_in_category(user1_skill_list, category)
            category_skills2 = _skills_in_category(user2_skill_list, category)

            matching_in_cat = len(
                set(category_skills1) & set(category_skills2)
            )

            if matching_in_cat > 0 or category_skills1 or category_skills2:
                compat_in_cat = calculate_skill_match(
                    category_skills1, category_skills2
                ) if category_skills1 and category_skills2 else 0.0

                category_breakdown.append(CompatibilityBreakdown(
                    skill_category=category.value,
                    matching_skills_count=matching_in_cat,
                    user1_unique=[s for s in category_skills1 if s not in category_skills2],
                    user2_unique=[s for s in category_skills2 if s not in category_skills1],
                    compatibility_in_category=compat_in_cat,
                ))

        # Calculate overall compatibility
        overall_compatibility = (skill_match_score * 0.5) + (complementary_score * 0.5)

        # Recommendation logic
        if overall_compatibility >= 0.75 and complementary_score >= 0.5:
            recommendation = "Good match"
            rationale = "Strong skill overlap with good complementary expertise"
        elif overall_compatibility >= 0.5:
            recommendation = "Moderate"
            rationale = "Reasonable compatibility with some gaps"
        else:
            recommendation = "Build skills first"
            rationale = "Limited compatibility; recommend skill development before pairing"

        # Mock communication style and timezone (for MVP)
        communication_styles = ["Direct & concise", "Detailed & thorough", "Collaborative"]
        timezone_compatibility_options = [
            "Full overlap (same timezone)",
            "Partial overlap (1-2 hours difference)",
            "Limited overlap (3+ hours difference)",
        ]

        communication_style = communication_styles[
            hash(user1_id + user2_id) % len(communication_styles)
        ]
        timezone_compat = timezone_compatibility_options[
            hash(user1_id + user2_id) % len(timezone_compatibility_options)
        ]

        logger.info(
            f"Calculated compatibility for {user1_id} and {user2_id}: "
            f"{overall_compatibility:.2f}"
        )

        return DuoCompatibilityResponse(
            user1_id=user1_id,
            user2_id=user2_id,
            overall_compatibility=min(1.0, max(0.0, overall_compatibility)),
            skill_match_score=min(1.0, max(0.0, skill_match_score)),
            complementary_score=min(1.0, max(0.0, complementary_score)),
            category_breakdown=category_breakdown,
            communication_style_match=communication_style,
            timezone_compatibility=timezone_compat,
            recommendation=recommendation,
            rationale=rationale,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error calculating compatibility for {user1_id} and {user2_id}: {str(e)}",
            exc_info=True
        )
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/health")
async def health_check() -> dict:
    """Health check for matching service."""
    return {
        "status": "healthy",
        "service": "Team Matching Engine",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
