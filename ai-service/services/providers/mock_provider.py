"""Deterministic mock AI provider for development and fallback."""

import logging
from typing import Any, Dict, List, Optional

from services.providers.base import BaseAIProvider

logger = logging.getLogger(__name__)


class MockProvider(BaseAIProvider):
    """Returns heuristic mock responses without calling an external LLM."""

    @property
    def provider_name(self) -> str:
        return "mock"

    @property
    def is_configured(self) -> bool:
        return False

    def evaluate_idea(self, title: str, description: str) -> dict:
        logger.debug("MockProvider.evaluate_idea for '%s'", title[:50])
        return self._generate_mock_evaluation(title, description)

    def mentor_chat(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> dict:
        conversation_history = conversation_history or []
        context = context or {}
        return self._generate_mock_mentor_response(message, conversation_history, context)

    def generate_project_description(
        self,
        title: str,
        brief_concept: str = "",
        keywords: Optional[List[str]] = None,
        target_audience: str = "",
        template: str = "standard",
    ) -> dict:
        keywords = keywords or []
        return self._generate_mock_description(
            title, brief_concept, keywords, target_audience, template
        )

    def refine_description(self, title: str, description: str, focus: str = "clarity") -> dict:
        return {
            "title": title,
            "original_description": description,
            "refined_description": self._mock_refine_text(description, focus),
            "changes_summary": [f"Improved {focus} and structure (mock mode)"],
            "focus": focus,
            "mode": "mock",
        }

    def _generate_mock_evaluation(self, title: str, description: str) -> dict:
        words_count = len(description.split())
        feasibility = min(95, max(40, 50 + (words_count % 35)))
        innovation = min(95, max(40, 60 + (len(title) % 30)))
        impact = min(95, max(40, 55 + ((feasibility + innovation) // 4)))
        overall = (feasibility + innovation + impact) // 3

        return {
            "overall_score": overall,
            "feasibility_score": feasibility,
            "feasibility_rationale": (
                f"The project '{title}' seems operationally feasible with a description "
                f"word count of {words_count} words. Further analysis is recommended to detail "
                f"the software architecture requirements."
            ),
            "innovation_score": innovation,
            "innovation_rationale": (
                "The idea shows good potential. Adding specialized features or addressing "
                "a specific underserved niche will help elevate its competitive edge."
            ),
            "impact_score": impact,
            "impact_rationale": (
                "High relevance for the intended user group. Potential impact is significant "
                "if key features are correctly deployed and integrated into collaboration spaces."
            ),
            "strengths": [
                f"Addresses a clear problem statement regarding '{title}'",
                "Straightforward concepts make rapid prototype development easier",
                "High potential for user engagement in collaboration environments",
            ],
            "weaknesses": [
                "Detailed technical blueprints and database schemas are currently missing",
                "Requires careful user data privacy controls",
                "Scalability constraints if user transaction volume scales rapidly",
            ],
            "recommendations": [
                "Draft complete user journey mappings and state flows",
                "Implement robust automated unit tests and integration hooks early in development",
                "Create a minimum viable product (MVP) focusing on the core problem statement",
            ],
            "suggested_tech_stack": ["React / Next.js", "Python FastAPI", "PostgreSQL", "Tailwind CSS"],
            "mode": "mock",
        }

    def _generate_mock_mentor_response(
        self, message: str, history: list, context: dict
    ) -> dict:
        msg_lower = message.lower()
        topic = "general"
        if any(w in msg_lower for w in ["team", "teammate", "member", "collaborate"]):
            topic = "team_building"
        elif any(w in msg_lower for w in ["idea", "concept", "innovation", "refine"]):
            topic = "idea_refinement"
        elif any(w in msg_lower for w in ["tech", "stack", "architecture", "build"]):
            topic = "technical_planning"

        project = context.get("project_title", "your project")
        reply = (
            f"Thanks for sharing that about {project}. "
            f"Based on your question, I'd suggest breaking the problem into smaller milestones "
            f"and validating assumptions with potential users early. "
            f"Student projects succeed when scope is realistic and the team has complementary skills."
        )

        return {
            "reply": reply,
            "suggestions": [
                "Define a clear MVP with 3-5 core features",
                "Document roles and weekly check-ins for your team",
                "Run a quick survey with 5-10 peers about the problem",
            ],
            "follow_up_questions": [
                "What is the single most important outcome for your first milestone?",
                "Who on your team owns which part of the work?",
            ],
            "topic": topic,
            "mode": "mock",
        }

    def _generate_mock_description(
        self,
        title: str,
        brief: str,
        keywords: list,
        audience: str,
        template: str,
    ) -> dict:
        concept = brief or f"An innovative solution addressing challenges related to {title.lower()}"
        kw = ", ".join(keywords) if keywords else "collaboration, innovation, technology"
        description = (
            f"{title} is a student-led initiative designed to {concept.strip().rstrip('.')}. "
            f"This project targets {audience or 'university students'} and leverages {kw} "
            f"to deliver measurable impact through structured development and team collaboration. "
            f"The team will follow an agile approach with defined milestones, regular demos, "
            f"and integration with the Innovation & Collaboration Hub platform."
        )
        return {
            "title": title,
            "description": description,
            "outline": {
                "problem_statement": f"Students and teams lack structured tools for {title.lower()}.",
                "proposed_solution": concept,
                "key_features": [
                    "User-centric core functionality",
                    "Team collaboration workspace",
                    "Progress tracking and milestones",
                ],
                "expected_outcomes": [
                    "Working MVP deployed to cloud",
                    "Documented team collaboration process",
                ],
            },
            "suggested_skills": ["Python", "React", "Project Management"],
            "estimated_timeline_weeks": 12,
            "template_used": template,
            "mode": "mock",
        }

    def _mock_refine_text(self, description: str, focus: str) -> str:
        refined = description.strip()
        if focus == "concise" and len(refined) > 200:
            refined = refined[:200].rsplit(" ", 1)[0] + "..."
        elif focus == "technical":
            refined += (
                " The implementation will use modular architecture with RESTful APIs "
                "and automated testing."
            )
        elif focus == "pitch":
            refined = f"Transform your workflow: {refined}"
        else:
            refined = refined.replace("  ", " ")
        return refined
