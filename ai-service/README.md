# AI Service - FastAPI Microservice

This service is a FastAPI application managing Gemini model interfaces, matchmaking models, and embedding logic for the **Innovation & Collaboration Hub**.

## Ownership & Responsibility
*   **Owner**: AI Team
*   **Tasks**: Cosine similarities calculations, NLP skills extractions, automated descriptions generator, floating chatbot mentor interfaces.

## Setup Instructions
1. Initialize virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
