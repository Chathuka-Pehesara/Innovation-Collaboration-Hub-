"""
File:        mentor.py
Owner:       AI Team
Description: Advisory chatbot communication channel routes FastAPI controller.
Depends:     ai-service/services/gemini_service.py
TODO:        Incorporate context settings prompting system roles attributes configurations.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/mentor", tags=["mentor"])
