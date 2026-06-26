"""
File:        gemini_service.py
Owner:       AI Team
Description: LLM connectivity service wrapper managing prompt instructions configurations.
Depends:     None
TODO:        Implement query recovery rules handles handling network timeouts.
"""

import os
import json
import time
import logging
from typing import List, Optional, Dict, Any
import google.generativeai as genai

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GeminiService")

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-1.5-flash"
        self.is_configured = False
        
        if self.api_key and self.api_key != "your_gemini_key" and self.api_key != "your_gemini_api_key_here":
            try:
                genai.configure(api_key=self.api_key)
                self.is_configured = True
                logger.info("Gemini API configured successfully.")
            except Exception as e:
                logger.error(f"Error configuring Gemini API: {str(e)}")
        else:
            logger.warning("GEMINI_API_KEY not found or using default. Running in Mock fallback mode.")

    def evaluate_idea(self, title: str, description: str) -> dict:
        """
        Evaluates an idea by prompting the Gemini LLM.
        Includes retry mechanism for network timeouts and mock fallback in case of errors/no key.
        """
        # If not configured, immediately use mock evaluation
        if not self.is_configured:
            logger.info("Gemini is not configured. Returning mock evaluation.")
            return self._generate_mock_evaluation(title, description)

        prompt = f"""
        You are an expert startup advisor, innovation consultant, and academic project evaluator.
        Please evaluate the following project proposal:
        
        Title: {title}
        Description: {description}
        
        Provide a structured, detailed evaluation of the project proposal. The evaluation must cover the following aspects:
        1. Feasibility: Technical and practical feasibility.
        2. Innovation: How novel and unique the idea is.
        3. Potential Impact: The positive effect or value the idea can create for its target audience.
        4. Strengths: Key advantages and positive aspects of the idea (provide at least 3).
        5. Weaknesses or Risks: Potential hurdles, limitations, or risks (provide at least 3).
        6. Recommendations: Actionable suggestions to improve the idea and execution.
        7. Suggested Tech Stack: A list of recommended technologies, frameworks, and tools to build this project.
        
        You MUST respond ONLY with a valid JSON object matching the JSON schema below. Do not wrap the response in markdown blocks or include any other text besides the JSON.
        
        JSON Schema:
        {{
          "overall_score": 75,
          "feasibility_score": 80,
          "feasibility_rationale": "Explanation of the feasibility score...",
          "innovation_score": 70,
          "innovation_rationale": "Explanation of the innovation score...",
          "impact_score": 75,
          "impact_rationale": "Explanation of the impact score...",
          "strengths": ["Strength 1", "Strength 2", "Strength 3"],
          "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
          "recommendations": ["Recommendation 1", "Recommendation 2"],
          "suggested_tech_stack": ["React", "Node.js", "PostgreSQL"]
        }}
        """

        max_retries = 3
        retry_delay = 2

        for attempt in range(max_retries):
            try:
                logger.info(f"Attempting Gemini content generation (Attempt {attempt + 1}/{max_retries})...")
                model = genai.GenerativeModel(self.model_name)
                
                # Use response_mime_type configuration to guarantee structured JSON output from Gemini
                response = model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                
                content = response.text.strip()
                
                # Parse JSON output
                # Strip markdown code blocks if the model wrapped them anyway
                if content.startswith("```"):
                    lines = content.split("\n")
                    if lines[0].startswith("```json"):
                        content = "\n".join(lines[1:-1])
                    elif lines[0].startswith("```"):
                        content = "\n".join(lines[1:-1])
                    content = content.strip()
                
                parsed_json = json.loads(content)
                
                # Validate minimal keys
                required_keys = ["overall_score", "feasibility_score", "feasibility_rationale", 
                                 "innovation_score", "innovation_rationale", "impact_score", 
                                 "impact_rationale", "strengths", "weaknesses", "recommendations", 
                                 "suggested_tech_stack"]
                for key in required_keys:
                    if key not in parsed_json:
                        raise KeyError(f"Missing required key in response: {key}")
                
                return parsed_json

            except Exception as e:
                logger.warning(f"Error during attempt {attempt + 1}: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay * (attempt + 1))
                else:
                    logger.error("All retries exhausted. Falling back to mock evaluation.")

        # Fallback to mock evaluation if API fails
        return self._generate_mock_evaluation(title, description)

    def _generate_mock_evaluation(self, title: str, description: str) -> dict:
        """
        Generates a robust mockup evaluation result for testing/fallback purposes.
        """
        words_count = len(description.split())
        
        # Calculate some pseudo-scores based on title and description characteristics
        feasibility = min(95, max(40, 50 + (words_count % 35)))
        innovation = min(95, max(40, 60 + (len(title) % 30)))
        impact = min(95, max(40, 55 + ((feasibility + innovation) // 4)))
        overall = (feasibility + innovation + impact) // 3

        return {
            "overall_score": overall,
            "feasibility_score": feasibility,
            "feasibility_rationale": f"The project '{title}' seems operationally feasible with a description word count of {words_count} words. Further analysis is recommended to detail the software architecture requirements.",
            "innovation_score": innovation,
            "innovation_rationale": "The idea shows good potential. Adding specialized features or addressing a specific underserved niche will help elevate its competitive edge.",
            "impact_score": impact,
            "impact_rationale": "High relevance for the intended user group. Potential impact is significant if key features are correctly deployed and integrated into collaboration spaces.",
            "strengths": [
                f"Addresses a clear problem statement regarding '{title}'",
                "Straightforward concepts make rapid prototype development easier",
                "High potential for user engagement in collaboration environments"
            ],
            "weaknesses": [
                "Detailed technical blueprints and database schemas are currently missing",
                "Requires careful user data privacy controls",
                "Scalability constraints if user transaction volume scales rapidly"
            ],
            "recommendations": [
                "Draft complete user journey mappings and state flows",
                "Implement robust automated unit tests and integration hooks early in development",
                "Create a minimum viable product (MVP) focusing on the core problem statement"
            ],
            "suggested_tech_stack": ["React / Next.js", "Python FastAPI", "PostgreSQL", "Tailwind CSS"]
        }

    def mentor_chat(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> dict:
        """
        AI mentor conversational response for idea refinement and team guidance.
        Supports multi-turn history and optional project context.
        """
        conversation_history = conversation_history or []
        context = context or {}

        if not self.is_configured:
            logger.info("Gemini is not configured. Returning mock mentor response.")
            return self._generate_mock_mentor_response(message, conversation_history, context)

        context_block = self._format_mentor_context(context)
        history_block = self._format_conversation_history(conversation_history)

        prompt = f"""
        You are an experienced innovation mentor for university students building technology projects.
        Your role is to guide students through idea refinement, team collaboration, project planning,
        and academic-to-industry project execution. Be encouraging, practical, and concise.

        {context_block}

        Conversation so far:
        {history_block}

        Student's latest message: {message}

        Respond ONLY with valid JSON matching this schema (no markdown, no extra text):
        {{
          "reply": "Your helpful mentor response (2-4 paragraphs max)",
          "suggestions": ["Actionable suggestion 1", "Actionable suggestion 2"],
          "follow_up_questions": ["Question to deepen thinking 1", "Question 2"],
          "topic": "idea_refinement|team_building|technical_planning|general"
        }}
        """

        result = self._generate_json(prompt)
        if result:
            result.setdefault("mode", "live")
            return result
        return self._generate_mock_mentor_response(message, conversation_history, context)

    def generate_project_description(
        self,
        title: str,
        brief_concept: str = "",
        keywords: Optional[List[str]] = None,
        target_audience: str = "",
        template: str = "standard",
    ) -> dict:
        """
        Generate a structured project description from a title and brief concept.
        """
        keywords = keywords or []
        keywords_str = ", ".join(keywords) if keywords else "Not specified"

        if not self.is_configured:
            logger.info("Gemini is not configured. Returning mock description.")
            return self._generate_mock_description(title, brief_concept, keywords, target_audience, template)

        prompt = f"""
        You are a technical writing assistant for student innovation projects.
        Generate a professional project description suitable for a collaboration hub platform.

        Title: {title}
        Brief concept: {brief_concept or "Not provided — infer from title"}
        Keywords: {keywords_str}
        Target audience: {target_audience or "University students and faculty"}
        Template style: {template} (standard=balanced, technical=architecture-focused, pitch=investor-style)

        Respond ONLY with valid JSON matching this schema (no markdown, no extra text):
        {{
          "title": "{title}",
          "description": "Full project description (150-300 words)",
          "outline": {{
            "problem_statement": "Clear problem being solved",
            "proposed_solution": "How the project addresses it",
            "key_features": ["Feature 1", "Feature 2", "Feature 3"],
            "expected_outcomes": ["Outcome 1", "Outcome 2"]
          }},
          "suggested_skills": ["Skill1", "Skill2", "Skill3"],
          "estimated_timeline_weeks": 12,
          "template_used": "{template}"
        }}
        """

        result = self._generate_json(prompt)
        if result:
            result.setdefault("title", title)
            result.setdefault("template_used", template)
            result.setdefault("mode", "live")
            return result
        return self._generate_mock_description(title, brief_concept, keywords, target_audience, template)

    def refine_description(self, title: str, description: str, focus: str = "clarity") -> dict:
        """Improve an existing project description."""
        if not self.is_configured:
            return {
                "title": title,
                "original_description": description,
                "refined_description": self._mock_refine_text(description, focus),
                "changes_summary": [f"Improved {focus} and structure (mock mode)"],
                "focus": focus,
            }

        prompt = f"""
        Refine this student project description. Focus on: {focus}
        (clarity=clearer language, technical=more technical depth, concise=shorter, pitch=more compelling)

        Title: {title}
        Current description: {description}

        Respond ONLY with valid JSON:
        {{
          "title": "{title}",
          "original_description": "...",
          "refined_description": "Improved full description",
          "changes_summary": ["Change 1", "Change 2"],
          "focus": "{focus}"
        }}
        """

        result = self._generate_json(prompt)
        if result:
            result.setdefault("title", title)
            result.setdefault("original_description", description)
            result.setdefault("focus", focus)
            result.setdefault("mode", "live")
            return result

        return {
            "title": title,
            "original_description": description,
            "refined_description": self._mock_refine_text(description, focus),
            "changes_summary": [f"Improved {focus} (fallback)"],
            "focus": focus,
            "mode": "mock",
        }

    def _generate_json(self, prompt: str, max_retries: int = 3) -> Optional[dict]:
        """Shared Gemini JSON generation with retry logic."""
        retry_delay = 2
        for attempt in range(max_retries):
            try:
                logger.info(f"Gemini JSON generation (attempt {attempt + 1}/{max_retries})...")
                model = genai.GenerativeModel(self.model_name)
                response = model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"},
                )
                content = response.text.strip()
                if content.startswith("```"):
                    lines = content.split("\n")
                    content = "\n".join(lines[1:-1] if lines[-1].startswith("```") else lines[1:])
                    content = content.strip()
                return json.loads(content)
            except Exception as e:
                logger.warning(f"JSON generation attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay * (attempt + 1))
        return None

    def _format_mentor_context(self, context: dict) -> str:
        """Build context block for mentor prompts."""
        if not context:
            return "No additional project context provided."
        parts = []
        if context.get("project_title"):
            parts.append(f"Project title: {context['project_title']}")
        if context.get("project_description"):
            parts.append(f"Project description: {context['project_description']}")
        if context.get("user_skills"):
            skills = context["user_skills"]
            if isinstance(skills, list):
                parts.append(f"Student skills: {', '.join(skills)}")
        if context.get("team_stage"):
            parts.append(f"Team stage: {context['team_stage']}")
        if context.get("project_type"):
            parts.append(f"Project type: {context['project_type']}")
        return "\n".join(parts) if parts else "No additional project context provided."

    def _format_conversation_history(self, history: list) -> str:
        """Format prior messages for mentor prompt."""
        if not history:
            return "(New conversation)"
        lines = []
        for msg in history[-10:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            label = "Student" if role == "user" else "Mentor"
            lines.append(f"{label}: {content}")
        return "\n".join(lines)

    def _generate_mock_mentor_response(
        self, message: str, history: list, context: dict
    ) -> dict:
        """Fallback mentor response when Gemini is unavailable."""
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
        """Fallback project description generator."""
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
        """Simple mock refinement."""
        refined = description.strip()
        if focus == "concise" and len(refined) > 200:
            refined = refined[:200].rsplit(" ", 1)[0] + "..."
        elif focus == "technical":
            refined += " The implementation will use modular architecture with RESTful APIs and automated testing."
        elif focus == "pitch":
            refined = f"Transform your workflow: {refined}"
        else:
            refined = refined.replace("  ", " ")
        return refined
