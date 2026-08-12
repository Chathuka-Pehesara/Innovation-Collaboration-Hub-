"""Shared prompt templates and JSON parsing helpers for AI providers."""

import json
from typing import Any, Dict, List, Optional


def parse_json_response(content: str) -> dict:
    """Parse JSON from LLM output, stripping optional markdown fences."""
    text = content.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[0].startswith("```"):
            text = "\n".join(lines[1:-1] if lines[-1].startswith("```") else lines[1:])
        text = text.strip()
    return json.loads(text)


def build_evaluation_prompt(title: str, description: str) -> str:
    return f"""
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


EVALUATION_REQUIRED_KEYS = [
    "overall_score",
    "feasibility_score",
    "feasibility_rationale",
    "innovation_score",
    "innovation_rationale",
    "impact_score",
    "impact_rationale",
    "strengths",
    "weaknesses",
    "recommendations",
    "suggested_tech_stack",
]


def validate_evaluation_response(parsed: dict) -> dict:
    for key in EVALUATION_REQUIRED_KEYS:
        if key not in parsed:
            raise KeyError(f"Missing required key in response: {key}")
    return parsed


def format_mentor_context(context: dict) -> str:
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


def format_conversation_history(history: list) -> str:
    if not history:
        return "(New conversation)"
    lines = []
    for msg in history[-10:]:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        label = "Student" if role == "user" else "Mentor"
        lines.append(f"{label}: {content}")
    return "\n".join(lines)


def build_mentor_prompt(
    message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
    context: Optional[Dict[str, Any]] = None,
) -> str:
    conversation_history = conversation_history or []
    context = context or {}
    context_block = format_mentor_context(context)
    history_block = format_conversation_history(conversation_history)

    return f"""
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


def build_description_prompt(
    title: str,
    brief_concept: str,
    keywords: List[str],
    target_audience: str,
    template: str,
) -> str:
    keywords_str = ", ".join(keywords) if keywords else "Not specified"
    return f"""
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


def build_refine_prompt(title: str, description: str, focus: str) -> str:
    return f"""
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
