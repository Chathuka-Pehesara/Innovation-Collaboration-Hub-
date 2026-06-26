"""
AI Mentor chatbot endpoints for idea refinement and team management guidance.
Integrates with Gemini for conversational mentoring with optional project context.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from services.gemini_service import GeminiService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/mentor", tags=["mentor"])

gemini_service = GeminiService()


# ============================================================================
# SCHEMAS
# ============================================================================

class ChatMessage(BaseModel):
    """Single message in conversation history."""
    role: Literal["user", "assistant"] = Field(..., description="Message sender role")
    content: str = Field(..., min_length=1, max_length=4000, description="Message text")


class MentorContext(BaseModel):
    """Optional project context to personalize mentor responses."""
    project_title: Optional[str] = Field(None, max_length=200)
    project_description: Optional[str] = Field(None, max_length=5000)
    user_skills: Optional[List[str]] = Field(None, max_length=30)
    team_stage: Optional[str] = Field(
        None,
        description="e.g. solo, forming, active, completing",
        max_length=50,
    )
    project_type: Optional[str] = Field(
        None,
        description="e.g. web_app, mobile, ai_ml, hardware",
        max_length=50,
    )


class MentorChatRequest(BaseModel):
    """Request body for mentor chat."""
    message: str = Field(..., min_length=1, max_length=2000, description="Student's message")
    conversation_history: Optional[List[ChatMessage]] = Field(
        default_factory=list,
        max_length=20,
        description="Prior turns for multi-turn conversation",
    )
    context: Optional[MentorContext] = Field(None, description="Optional project context")


class MentorChatResponse(BaseModel):
    """Mentor chat response."""
    reply: str = Field(..., description="Mentor's response")
    suggestions: List[str] = Field(default_factory=list, description="Actionable next steps")
    follow_up_questions: List[str] = Field(default_factory=list, description="Questions to explore")
    topic: str = Field(..., description="Detected conversation topic")
    mode: str = Field(..., description="live or mock")
    generated_at: str = Field(..., description="ISO timestamp")


class QuickTipRequest(BaseModel):
    """Request for a quick mentoring tip on a specific topic."""
    topic: Literal[
        "idea_refinement",
        "team_building",
        "technical_planning",
        "presentation",
        "general",
    ] = Field("general", description="Area needing guidance")
    project_title: Optional[str] = Field(None, max_length=200)


class QuickTipResponse(BaseModel):
    """Quick tip response."""
    topic: str
    tip: str
    related_actions: List[str]
    mode: str


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/chat", response_model=MentorChatResponse, status_code=200)
async def mentor_chat(request: MentorChatRequest) -> MentorChatResponse:
    """
    Chat with the AI mentor for idea refinement, team advice, and project planning.
    Supports multi-turn conversations via conversation_history.
    """
    if not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty",
        )

    try:
        history = [
            {"role": msg.role, "content": msg.content}
            for msg in (request.conversation_history or [])
        ]
        context = request.context.model_dump(exclude_none=True) if request.context else {}

        logger.info(
            f"Mentor chat: message_len={len(request.message)}, "
            f"history_turns={len(history)}, has_context={bool(context)}"
        )

        result = gemini_service.mentor_chat(
            message=request.message.strip(),
            conversation_history=history,
            context=context,
        )

        mode = result.get("mode", "live" if gemini_service.is_configured else "mock")

        return MentorChatResponse(
            reply=result.get("reply", "I'm here to help with your project. Could you tell me more?"),
            suggestions=result.get("suggestions", [])[:5],
            follow_up_questions=result.get("follow_up_questions", [])[:3],
            topic=result.get("topic", "general"),
            mode=mode,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Mentor chat error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing mentor chat request",
        )


@router.post("/quick-tip", response_model=QuickTipResponse, status_code=200)
async def get_quick_tip(request: QuickTipRequest) -> QuickTipResponse:
    """Get a single focused mentoring tip without full conversation."""
    topic_prompts = {
        "idea_refinement": "Give one concise tip for refining a student project idea.",
        "team_building": "Give one concise tip for finding and working with teammates.",
        "technical_planning": "Give one concise tip for planning the technical architecture of a student project.",
        "presentation": "Give one concise tip for presenting a student project to faculty or peers.",
        "general": "Give one concise tip for succeeding on an innovation collaboration project.",
    }

    project_note = f" Project: {request.project_title}." if request.project_title else ""
    message = topic_prompts.get(request.topic, topic_prompts["general"]) + project_note

    try:
        result = gemini_service.mentor_chat(
            message=message,
            conversation_history=[],
            context={"project_title": request.project_title} if request.project_title else {},
        )
        mode = result.get("mode", "live" if gemini_service.is_configured else "mock")

        return QuickTipResponse(
            topic=request.topic,
            tip=result.get("reply", "Start with a clear problem statement and validate it with real users."),
            related_actions=result.get("suggestions", [])[:3],
            mode=mode,
        )
    except Exception as e:
        logger.error(f"Quick tip error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating quick tip",
        )


@router.get("/health", status_code=200)
async def mentor_health() -> Dict[str, Any]:
    """Health check for AI mentor service."""
    return {
        "status": "healthy",
        "service": "AI Mentor Chatbot",
        "gemini_configured": gemini_service.is_configured,
        "endpoints": ["/mentor/chat", "/mentor/quick-tip"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
