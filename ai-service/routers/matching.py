"""
File:        matching.py
Owner:       AI Team
Description: FastAPI endpoints coordinating teammate similarity matching algorithms.
Depends:     ai-service/services/similarity_service.py
TODO:        Implement /match parameters routing retrieving candidate arrays configurations.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/matching", tags=["matching"])
