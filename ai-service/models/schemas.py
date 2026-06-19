"""
File:        schemas.py
Owner:       AI Team
Description: Pydantic validator schemas defining endpoint request constraints rules.
Depends:     None
TODO:        Define profiles, evaluations parameters, and chats query objects definitions.
"""

from pydantic import BaseModel, Field
from typing import List, Optional

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
