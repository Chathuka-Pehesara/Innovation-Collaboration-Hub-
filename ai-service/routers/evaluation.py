"""
Endpoints for evaluating project ideas with AI-powered analysis.
Integrates the configured AI provider, embeddings, and skills engine validation.
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status, Path, Query
from models.schemas import IdeaEvaluationRequest, IdeaEvaluationResponse
from services.provider_factory import get_ai_provider, get_provider_health_fields
from utils.helpers import extract_skills_from_text, normalize_skill_name
from utils.constants import PREDEFINED_SKILLS_LOWERCASE

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ideas", tags=["evaluation"])

ai_provider = get_ai_provider()


@router.post("/evaluate", response_model=IdeaEvaluationResponse, status_code=200)
async def evaluate_single_idea(request: IdeaEvaluationRequest) -> IdeaEvaluationResponse:
    """Evaluate a single project idea with scores and recommendations."""
    if not request.title or not request.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project title cannot be empty"
        )
    if not request.description or not request.description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project description cannot be empty"
        )

    try:
        logger.info(f"Evaluating idea: {request.title[:50]}")
        result = ai_provider.evaluate_idea(request.title, request.description)
        
        response = IdeaEvaluationResponse(
            overall_score=result.get("overall_score", 50),
            feasibility_score=result.get("feasibility_score", 50),
            feasibility_rationale=result.get("feasibility_rationale", ""),
            innovation_score=result.get("innovation_score", 50),
            innovation_rationale=result.get("innovation_rationale", ""),
            impact_score=result.get("impact_score", 50),
            impact_rationale=result.get("impact_rationale", ""),
            strengths=result.get("strengths", []),
            weaknesses=result.get("weaknesses", []),
            recommendations=result.get("recommendations", []),
            suggested_tech_stack=result.get("suggested_tech_stack", [])
        )
        
        logger.info(f"Evaluation complete for idea '{request.title}': overall_score={response.overall_score}")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error evaluating idea: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during idea evaluation"
        )


@router.post("/batch-evaluate", status_code=200)
async def batch_evaluate_ideas(requests: List[IdeaEvaluationRequest]) -> List[Dict[str, Any]]:
    """Evaluate multiple ideas efficiently."""
    if not requests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one idea required for batch evaluation"
        )
    
    if len(requests) > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 50 ideas per batch"
        )

    results = []
    logger.info(f"Starting batch evaluation of {len(requests)} ideas")

    for idx, idea in enumerate(requests, 1):
        if not idea.title or not idea.title.strip():
            results.append({
                "idea_index": idx,
                "title": idea.title or "Untitled",
                "error": "Title cannot be empty",
                "status": "failed"
            })
            continue

        if not idea.description or not idea.description.strip():
            results.append({
                "idea_index": idx,
                "title": idea.title,
                "error": "Description cannot be empty",
                "status": "failed"
            })
            continue

        try:
            evaluation = ai_provider.evaluate_idea(idea.title, idea.description)
            results.append({
                "idea_index": idx,
                "title": idea.title,
                "status": "success",
                "overall_score": evaluation.get("overall_score", 50),
                "feasibility_score": evaluation.get("feasibility_score", 50),
                "innovation_score": evaluation.get("innovation_score", 50),
                "impact_score": evaluation.get("impact_score", 50),
            })
        except Exception as e:
            logger.warning(f"Batch evaluation failed for idea {idx}: {str(e)}")
            results.append({
                "idea_index": idx,
                "title": idea.title,
                "error": str(e),
                "status": "failed"
            })

    logger.info(f"Batch evaluation complete: {sum(1 for r in results if r['status'] == 'success')}/{len(requests)} successful")
    return results


@router.get("/{idea_id}/suggestions", status_code=200)
async def get_improvement_suggestions(
    idea_id: str = Path(..., min_length=1, max_length=100)
) -> Dict[str, Any]:
    """Get actionable improvement suggestions for an idea."""
    if not idea_id or not idea_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid idea ID"
        )

    # MVP: mock data until database integration
    mock_idea = {
        "id": idea_id,
        "title": "AI-Powered Collaboration Platform",
        "description": "A web application for team collaboration with AI suggestions"
    }

    logger.info(f"Fetching suggestions for idea: {idea_id}")

    try:
        evaluation = ai_provider.evaluate_idea(mock_idea["title"], mock_idea["description"])
        
        suggestions = {
            "idea_id": idea_id,
            "title": mock_idea["title"],
            "recommendations": evaluation.get("recommendations", []),
            "improvement_areas": [
                {
                    "area": "Technical Architecture",
                    "current_gap": evaluation.get("weaknesses", [])[0] if evaluation.get("weaknesses") else "Not specified",
                    "suggestion": "Define system design and scalability approach"
                },
                {
                    "area": "Market Validation",
                    "current_gap": "Limited user research mentioned",
                    "suggestion": "Conduct user interviews and create product-market fit survey"
                },
                {
                    "area": "Execution Plan",
                    "current_gap": "Timeline and resource allocation unclear",
                    "suggestion": "Create detailed project roadmap with milestones"
                }
            ],
            "priority_actions": evaluation.get("recommendations", [])[:3],
            "estimated_effort": {
                "feasibility_score": evaluation.get("feasibility_score", 50),
                "complexity": "medium" if evaluation.get("feasibility_score", 50) < 70 else "low"
            },
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
        logger.info(f"Suggestions generated for idea '{idea_id}'")
        return suggestions

    except Exception as e:
        logger.error(f"Error generating suggestions for idea {idea_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating suggestions"
        )


@router.get("/{idea_id}/required-skills", status_code=200)
async def get_required_skills(
    idea_id: str = Path(..., min_length=1, max_length=100),
    category: Optional[str] = Query(None)
) -> Dict[str, Any]:
    """Get validated skills required to execute the idea."""
    if not idea_id or not idea_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid idea ID"
        )

    # MVP: mock data until database integration
    mock_idea = {
        "id": idea_id,
        "title": "AI-Powered Collaboration Platform",
        "description": "A web application for team collaboration with AI suggestions. Stack: React frontend, FastAPI backend, PostgreSQL database, machine learning for recommendations."
    }

    logger.info(f"Extracting required skills for idea: {idea_id}")

    try:
        combined_text = f"{mock_idea['title']} {mock_idea['description']}"
        
        extracted_skills = extract_skills_from_text(combined_text, max_skills=20)
        
        validated_skills = []
        for skill in extracted_skills:
            try:
                normalized = normalize_skill_name(skill)
                skill_lower = normalized.lower()
                
                if skill_lower in PREDEFINED_SKILLS_LOWERCASE:
                    skill_info = PREDEFINED_SKILLS_LOWERCASE[skill_lower]
                    skill_category = skill_info.get("category")
                    
                    category_value = (
                        skill_category.value
                        if hasattr(skill_category, "value")
                        else str(skill_category)
                    )
                    if category is None or category_value.lower() == category.lower():
                        validated_skills.append({
                            "name": normalized,
                            "category": skill_category,
                            "proficiency_required": "intermediate" if normalized.lower() in ["react", "fastapi", "postgresql"] else "beginner",
                            "is_predefined": True
                        })
            except (ValueError, KeyError):
                logger.debug(f"Skipped non-predefined skill: {skill}")
                continue

        logger.info(f"Extracted {len(validated_skills)} validated skills for idea '{idea_id}'")

        return {
            "idea_id": idea_id,
            "title": mock_idea["title"],
            "required_skills": validated_skills,
            "total_count": len(validated_skills),
            "by_category": _group_skills_by_category(validated_skills),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        logger.error(f"Error extracting skills for idea {idea_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error extracting required skills"
        )


def _group_skills_by_category(skills: List[Dict[str, Any]]) -> Dict[str, List[str]]:
    """Group skills by category."""
    grouped = {}
    for skill in skills:
        category = str(skill.get("category", "Other"))
        if category not in grouped:
            grouped[category] = []
        grouped[category].append(skill["name"])
    return grouped


@router.get("/health", status_code=200)
async def evaluation_health() -> Dict[str, Any]:
    """Health check for evaluation service."""
    return {
        "status": "healthy",
        "service": "Idea Evaluation Engine",
        **get_provider_health_fields(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
