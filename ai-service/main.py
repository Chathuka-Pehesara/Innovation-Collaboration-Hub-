"""
File:        main.py
Owner:       AI Team
Description: FastAPI web service application routing settings and components hooks.
Depends:     ai-service/routers/matching.py, ai-service/routers/evaluation.py
TODO:        Configure Swagger UI parameter limits and middleware hooks.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables
load_dotenv()

app = FastAPI(
    title="Innovation & Collaboration Hub - AI Service",
    description="FastAPI microservice managing Gemini model interfaces, matchmaking, and embedding logic.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from routers import evaluation, generator, matching, mentor, skills

app.include_router(evaluation.router)
app.include_router(generator.router)
app.include_router(matching.router)
app.include_router(mentor.router)
app.include_router(skills.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Microservice",
        "endpoints": {
            "evaluation": "/ai/evaluate-idea or /evaluate-idea"
        }
    }
