#!/usr/bin/env python3
"""
Verification script to test the AI Mentor & Description Generator endpoints.
"""

import requests
import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://localhost:8000"

def run_verification():
    print("==================================================")
    print("🚀 STARTING AI MENTOR & GENERATOR VERIFICATION 🚀")
    print("==================================================")

    # 1. Test Mentor Health Check
    print("\n1. Testing GET /mentor/health")
    try:
        response = requests.get(f"{BASE_URL}/mentor/health")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"   ❌ Failed to connect: {e}")
        print("   Make sure the FastAPI server is running on port 8000.")
        sys.exit(1)

    # 2. Test Mentor Chat
    print("\n2. Testing POST /mentor/chat")
    chat_payload = {
        "message": "What database should I choose for an student web portal: PostgreSQL or MongoDB?",
        "conversation_history": [],
        "context": {
            "project_title": "Student Collaboration Hub",
            "project_description": "A web app where university students form teams and work on projects."
        }
    }
    response = requests.post(f"{BASE_URL}/mentor/chat", json=chat_payload)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Response Mode: {data.get('mode')}")
        print(f"   Topic: {data.get('topic')}")
        reply = data.get("reply") or ""
        print(f"   AI Reply Snippet:\n   \"\"\"\n{reply[:250]}...\n   \"\"\"")
        print(f"   Suggestions: {data.get('suggestions')}")
        print(f"   Follow-up Questions: {data.get('follow_up_questions')}")
    else:
        print(f"   ❌ Error Response: {response.text}")

    # 3. Test Mentor Quick Tip
    print("\n3. Testing POST /mentor/quick-tip")
    tip_payload = {
        "topic": "technical_planning",
        "project_title": "Student Collaboration Hub",
    }
    response = requests.post(f"{BASE_URL}/mentor/quick-tip", json=tip_payload)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        tip = data.get("tip") or ""
        print(f"   Topic: {data.get('topic')}")
        print(f"   AI Tip Snippet:\n   \"\"\"\n{tip[:200]}...\n   \"\"\"")
        print(f"   Related Actions: {data.get('related_actions')}")
    else:
        print(f"   ❌ Error Response: {response.text}")

    # 4. Test Generator Health Check
    print("\n4. Testing GET /generator/health")
    response = requests.get(f"{BASE_URL}/generator/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")

    # 5. Test Description Generation
    print("\n5. Testing POST /generator/description")
    gen_payload = {
        "title": "Smart Parking App",
        "brief_concept": "An app that helps users find available parking spots in crowded university parking spaces using real-time sensors.",
        "keywords": ["React Native", "FastAPI", "IoT"],
        "target_audience": "University students and staff",
        "template": "technical"
    }
    response = requests.post(f"{BASE_URL}/generator/description", json=gen_payload)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Response Mode: {data.get('mode')}")
        print(f"   Template Used: {data.get('template_used')}")
        print(f"   Suggested Skills: {data.get('suggested_skills')}")
        print(f"   Estimated Timeline (weeks): {data.get('estimated_timeline_weeks')}")
        print(f"   Outline Problem Statement:\n   - {data.get('outline', {}).get('problem_statement')}")
    else:
        print(f"   ❌ Error Response: {response.text}")

    # 6. Test Description Refinement
    print("\n6. Testing POST /generator/refine")
    refine_payload = {
        "title": "Smart Parking App",
        "description": "It finds parking spots using iot sensor data. students use app to see if spot is empty or full. saves time and gas.",
        "focus": "clarity"
    }
    response = requests.post(f"{BASE_URL}/generator/refine", json=refine_payload)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Response Mode: {data.get('mode')}")
        print(f"   Changes Summary: {data.get('changes_summary')}")
        print(f"   Refined Description Snippet:\n   \"\"\"\n{data.get('refined_description')[:150]}...\n   \"\"\"")
    else:
        print(f"   ❌ Error Response: {response.text}")

    print("\n==================================================")
    print("🎉 VERIFICATION COMPLETED 🎉")
    print("==================================================")

if __name__ == "__main__":
    run_verification()
