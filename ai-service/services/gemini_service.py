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
