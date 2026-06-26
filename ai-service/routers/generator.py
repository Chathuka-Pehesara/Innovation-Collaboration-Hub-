"""
Description generator endpoints for drafting project proposals from concepts.
Uses the configured AI provider to produce structured descriptions, outlines, and skill suggestions.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from services.provider_factory import get_ai_provider, get_provider_health_fields
from utils.helpers import extract_skills_from_text, normalize_skill_name

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/generator", tags=["generator"])

ai_provider = get_ai_provider()


# ============================================================================
# SCHEMAS
# ============================================================================

class ProjectOutline(BaseModel):
    """Structured outline sections for a project description."""
    problem_statement: str = Field(..., description="Problem the project addresses")
    proposed_solution: str = Field(..., description="How the project solves it")
    key_features: List[str] = Field(..., description="Main features or deliverables")
    expected_outcomes: List[str] = Field(..., description="Expected results or impact")


class GenerateDescriptionRequest(BaseModel):
    """Request to generate a project description from a concept."""
    title: str = Field(..., min_length=3, max_length=200, description="Project title")
    brief_concept: Optional[str] = Field(
        None,
        max_length=2000,
        description="Short concept or pitch (optional if title is descriptive)",
    )
    keywords: Optional[List[str]] = Field(
        default_factory=list,
        max_length=15,
        description="Technology or domain keywords",
    )
    target_audience: Optional[str] = Field(
        None,
        max_length=300,
        description="Who benefits from this project",
    )
    template: Literal["standard", "technical", "pitch"] = Field(
        "standard",
        description="Writing style: standard, technical, or pitch",
    )

    @field_validator("title", "brief_concept")
    @classmethod
    def strip_whitespace(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return v.strip()


class GenerateDescriptionResponse(BaseModel):
    """Generated project description response."""
    title: str
    description: str = Field(..., description="Full generated description")
    outline: ProjectOutline
    suggested_skills: List[str] = Field(default_factory=list)
    estimated_timeline_weeks: int = Field(..., ge=1, le=52)
    template_used: str
    mode: str = Field(..., description="live or mock")
    generated_at: str


class RefineDescriptionRequest(BaseModel):
    """Request to improve an existing description."""
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=10000)
    focus: Literal["clarity", "technical", "concise", "pitch"] = Field(
        "clarity",
        description="Refinement focus area",
    )


class RefineDescriptionResponse(BaseModel):
    """Refined description response."""
    title: str
    original_description: str
    refined_description: str
    changes_summary: List[str]
    focus: str
    mode: str
    generated_at: str


class GenerateFromKeywordsRequest(BaseModel):
    """Generate a description from keywords only."""
    keywords: List[str] = Field(..., min_length=1, max_length=15)
    domain: Optional[str] = Field(None, max_length=100, description="e.g. healthcare, education")


class ExtractSkillsRequest(BaseModel):
    """Request to extract skills from a description."""
    description: str = Field(..., min_length=10, max_length=10000)


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/description", response_model=GenerateDescriptionResponse, status_code=200)
async def generate_description(request: GenerateDescriptionRequest) -> GenerateDescriptionResponse:
    """
    Generate a structured project description from a title and brief concept.
    Returns description, outline, suggested skills, and estimated timeline.
    """
    if not request.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project title cannot be empty",
        )

    try:
        logger.info(f"Generating description for: {request.title[:50]}")

        result = ai_provider.generate_project_description(
            title=request.title.strip(),
            brief_concept=(request.brief_concept or "").strip(),
            keywords=request.keywords or [],
            target_audience=(request.target_audience or "").strip(),
            template=request.template,
        )

        outline_data = result.get("outline", {})
        outline = ProjectOutline(
            problem_statement=outline_data.get("problem_statement", "To be defined"),
            proposed_solution=outline_data.get("proposed_solution", request.brief_concept or request.title),
            key_features=outline_data.get("key_features", [])[:8],
            expected_outcomes=outline_data.get("expected_outcomes", [])[:5],
        )

        mode = result.get("mode", "live" if ai_provider.is_configured else "mock")

        return GenerateDescriptionResponse(
            title=result.get("title", request.title),
            description=result.get("description", ""),
            outline=outline,
            suggested_skills=result.get("suggested_skills", [])[:15],
            estimated_timeline_weeks=min(52, max(1, result.get("estimated_timeline_weeks", 12))),
            template_used=result.get("template_used", request.template),
            mode=mode,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Description generation error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating project description",
        )


@router.post("/refine", response_model=RefineDescriptionResponse, status_code=200)
async def refine_description(request: RefineDescriptionRequest) -> RefineDescriptionResponse:
    """Improve an existing project description with a specific focus."""
    if not request.description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description cannot be empty",
        )

    try:
        logger.info(f"Refining description for: {request.title[:50]} (focus={request.focus})")

        result = ai_provider.refine_description(
            title=request.title.strip(),
            description=request.description.strip(),
            focus=request.focus,
        )

        mode = result.get("mode", "live" if ai_provider.is_configured else "mock")

        return RefineDescriptionResponse(
            title=result.get("title", request.title),
            original_description=result.get("original_description", request.description),
            refined_description=result.get("refined_description", request.description),
            changes_summary=result.get("changes_summary", []),
            focus=result.get("focus", request.focus),
            mode=mode,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Description refine error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error refining project description",
        )


@router.post("/from-keywords", response_model=GenerateDescriptionResponse, status_code=200)
async def generate_from_keywords(request: GenerateFromKeywordsRequest) -> GenerateDescriptionResponse:
    """Generate a project description starting from keywords and optional domain."""
    keywords = [k.strip() for k in request.keywords if k.strip()]
    if not keywords:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one keyword is required",
        )

    domain = (request.domain or "technology innovation").strip()
    title = f"{domain.title()} Project: {' & '.join(keywords[:3]).title()}"
    brief = (
        f"A student innovation project in {domain} leveraging "
        f"{', '.join(keywords)} to solve a real-world problem."
    )

    gen_request = GenerateDescriptionRequest(
        title=title,
        brief_concept=brief,
        keywords=keywords,
        target_audience=f"Users in the {domain} space",
        template="standard",
    )
    return await generate_description(gen_request)


@router.post("/extract-skills", status_code=200)
async def extract_skills_from_description(request: ExtractSkillsRequest) -> Dict[str, Any]:
    """
    Extract and normalize suggested skills from a project description.
    Uses the Skills Engine helpers (no LLM required).
    """
    description = request.description.strip()
    if not description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description cannot be empty",
        )

    try:
        raw_skills = extract_skills_from_text(description, max_skills=20)
        normalized = []
        seen = set()
        for skill in raw_skills:
            try:
                name = normalize_skill_name(skill)
                key = name.lower()
                if key not in seen:
                    seen.add(key)
                    normalized.append(name)
            except ValueError:
                continue

        return {
            "skills": normalized,
            "total_count": len(normalized),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        logger.error(f"Skill extraction error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error extracting skills from description",
        )


@router.get("/health", status_code=200)
async def generator_health() -> Dict[str, Any]:
    """Health check for description generator service."""
    return {
        "status": "healthy",
        "service": "Description Generator",
        **get_provider_health_fields(),
        "endpoints": [
            "/generator/description",
            "/generator/refine",
            "/generator/from-keywords",
            "/generator/extract-skills",
        ],
        "templates": ["standard", "technical", "pitch"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
