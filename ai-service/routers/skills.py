"""
File:        skills.py
Owner:       AI Team
Description: NLP routing parsing skills terms from student biographical logs.
Depends:     ai-service/services/embedding_service.py
TODO:        Set skills retrieval controllers parameters reading workspace tables configurations.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/skills", tags=["skills"])
