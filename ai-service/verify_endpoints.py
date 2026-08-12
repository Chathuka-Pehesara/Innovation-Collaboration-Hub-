#!/usr/bin/env python3
"""
Quick verification script to test Skills Engine endpoints.
Run this to verify all endpoints are working correctly.
"""

import requests
import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://localhost:8000"

def test_endpoints():
    """Test all Skills Engine endpoints."""
    
    print("\n=== SKILLS ENGINE VERIFICATION ===\n")
    
    # Test 1: Validate Skill
    print("1. Testing POST /skills/validate")
    response = requests.post(f"{BASE_URL}/skills/validate", json={
        "skill_name": "python",
        "suggest_category": True
    })
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}\n")
    
    # Test 2: Get Categories
    print("2. Testing GET /skills/categories")
    response = requests.get(f"{BASE_URL}/skills/categories")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Total Categories: {data.get('total_categories')}")
    print(f"   First Category: {data['categories'][0]['category'] if data['categories'] else 'None'}\n")
    
    # Test 3: Get Category Skills
    print("3. Testing GET /skills/categories/Programming Language")
    response = requests.get(f"{BASE_URL}/skills/categories/Programming%20Language")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Skills in Category: {len(data.get('skills', []))}\n")
    
    # Test 4: Health Check
    print("4. Testing GET /health")
    response = requests.get(f"{BASE_URL}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}\n")
    
    print("=== ALL TESTS COMPLETED ===\n")

if __name__ == "__main__":
    test_endpoints()
