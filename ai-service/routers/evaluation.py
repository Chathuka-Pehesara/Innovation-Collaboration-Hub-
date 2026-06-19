"""
File:        evaluation.py
Owner:       AI Team
Description: FastAPI paths analyzing project proposals.
Depends:     ai-service/services/gemini_service.py
TODO:        Bind /evaluate-idea query values variables mapping LLM requests.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import IdeaEvaluationRequest, IdeaEvaluationResponse
from services.gemini_service import GeminiService

# Setup routing under tag "evaluation"
router = APIRouter(tags=["evaluation"])

# Initialize Gemini wrapper service
gemini_service = GeminiService()

@router.post("/evaluate-idea", response_model=IdeaEvaluationResponse)
@router.post("/ai/evaluate-idea", response_model=IdeaEvaluationResponse)
def evaluate_idea(payload: IdeaEvaluationRequest):
    """
    Evaluates a proposed project concept using Gemini LLM.
    Returns metrics (feasibility, innovation, impact), strengths, weaknesses, improvement suggestions, and recommended tech stack.
    """
    # Simple input verification
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Project title cannot be empty.")
    if not payload.description.strip():
        raise HTTPException(status_code=400, detail="Project description cannot be empty.")

    try:
        result = gemini_service.evaluate_idea(payload.title, payload.description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Idea evaluation service error: {str(e)}")
