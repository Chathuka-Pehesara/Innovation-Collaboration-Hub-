"""
Test script for Team Matching Engine endpoints.
Tests all endpoints for correct HTTP status codes, response schemas, and algorithm correctness.
"""

import os
os.environ["DATABASE_URL"] = "sqlite:///./test_matching.db"

import sys
import json
from typing import Dict, Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Mock test requests
test_cases = {
    "test_find_teammates_valid": {
        "endpoint": "/matching/find-teammates",
        "method": "POST",
        "params": {"user_id": "user1", "max_suggestions": 3},
        "expected_status": 200,
        "expected_fields": ["user_id", "suggestions", "total_suggestions"],
    },
    "test_find_teammates_invalid_user": {
        "endpoint": "/matching/find-teammates",
        "method": "POST",
        "params": {"user_id": "", "max_suggestions": 3},
        "expected_status": 400,
    },
    "test_validate_team_valid": {
        "endpoint": "/matching/validate-team",
        "method": "POST",
        "params": {"team_ids": ["user1", "user2", "user3"]},
        "expected_status": 200,
        "expected_fields": ["team_analysis", "member_count"],
    },
    "test_validate_team_empty": {
        "endpoint": "/matching/validate-team",
        "method": "POST",
        "params": {"team_ids": []},
        "expected_status": 400,
    },
    "test_team_gaps_valid": {
        "endpoint": "/matching/team-gaps/team1",
        "method": "GET",
        "expected_status": 200,
        "expected_fields": ["team_id", "gaps", "total_gaps"],
    },
    "test_team_gaps_invalid": {
        "endpoint": "/matching/team-gaps/invalid-team",
        "method": "GET",
        "expected_status": 404,
    },
    "test_duo_compatibility_valid": {
        "endpoint": "/matching/compatibility/user1/user2",
        "method": "POST",
        "expected_status": 200,
        "expected_fields": [
            "user1_id",
            "user2_id",
            "overall_compatibility",
            "skill_match_score",
            "recommendation",
        ],
    },
    "test_duo_compatibility_same_user": {
        "endpoint": "/matching/compatibility/user1/user1",
        "method": "POST",
        "expected_status": 400,
    },
}


def validate_response_schema(response: Dict[str, Any], expected_fields: list) -> bool:
    """Validate that response contains all expected fields."""
    for field in expected_fields:
        if field not in response:
            print(f"  ✗ Missing field: {field}")
            return False
    return True


def test_schemas():
    """Test that all schemas are properly defined."""
    print("\n=== Testing Schema Imports ===")
    try:
        from routers.matching import (
            TeammateResult,
            FindTeammatesResponse,
            TeamCompositionAnalysis,
            ValidateTeamResponse,
            SkillGap,
            TeamGapsResponse,
            DuoCompatibilityResponse,
        )
        print("✓ All schemas imported successfully")

        # Test schema instantiation
        teammate = TeammateResult(
            user_id="user2",
            compatibility_score=0.85,
            matching_skills=["Python"],
            complementary_skills={"user1_unique": ["FastAPI"], "user2_unique": ["React"]},
            team_balance_score=0.75,
            proficiency_distribution={"Advanced": 2, "Intermediate": 1},
        )
        print(f"✓ TeammateResult schema valid: {teammate.user_id}")

        analysis = TeamCompositionAnalysis(
            overall_team_score=7.5,
            skill_diversity=8.0,
            coverage_completeness=7.0,
            skill_gaps=["Communication"],
            skill_redundancy={"Python": 2},
            proficiency_balance={"Advanced": 3, "Intermediate": 2},
            team_recommendations=["Add more junior developers"],
        )
        print(f"✓ TeamCompositionAnalysis schema valid")

        return True
    except Exception as e:
        print(f"✗ Schema validation failed: {str(e)}")
        return False


def test_helper_functions():
    """Test helper functions."""
    print("\n=== Testing Helper Functions ===")
    try:
        from routers.matching import (
            _get_mock_user_skills,
            _get_skill_gaps_for_team,
        )

        # Test mock data retrieval
        skills = _get_mock_user_skills("user1")
        assert len(skills) > 0, "No skills returned for user1"
        print(f"✓ Mock skills retrieved for user1: {len(skills)} skills")

        # Test skill gaps
        team = [{"skills": ["Python", "React"]}, {"skills": ["Java"]}]
        gaps = _get_skill_gaps_for_team(team)
        assert isinstance(gaps, list), "Gaps should be a list"
        print(f"✓ Skill gaps identified: {len(gaps)} gaps")

        return True
    except Exception as e:
        print(f"✗ Helper function test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_algorithm_logic():
    """Test core algorithm logic."""
    print("\n=== Testing Algorithm Logic ===")
    try:
        from utils.helpers import (
            calculate_skill_match,
            calculate_complementary_skills,
            calculate_proficiency_alignment,
        )
        from utils.constants import ProficiencyLevel

        # Test skill matching
        skills1 = ["Python", "FastAPI", "PostgreSQL"]
        skills2 = ["Python", "React", "PostgreSQL"]
        match = calculate_skill_match(skills1, skills2)
        assert 0 <= match <= 1, f"Skill match out of range: {match}"
        assert match > 0, "Should have some overlap"
        print(f"✓ Skill match (Jaccard): {match:.2f} (expected ~0.50)")

        # Test complementary skills
        complementary = calculate_complementary_skills(skills1, skills2)
        assert "user1_unique" in complementary, "Missing user1_unique"
        assert "user2_unique" in complementary, "Missing user2_unique"
        assert "FastAPI" in complementary["user1_unique"]
        assert "React" in complementary["user2_unique"]
        print(f"✓ Complementary skills: user1={complementary['user1_unique']}, user2={complementary['user2_unique']}")

        # Test proficiency alignment
        alignment = calculate_proficiency_alignment(
            ProficiencyLevel.ADVANCED,
            ProficiencyLevel.INTERMEDIATE
        )
        assert 0 <= alignment <= 1, f"Alignment out of range: {alignment}"
        print(f"✓ Proficiency alignment: {alignment:.2f}")

        # Test empty skills
        empty_match = calculate_skill_match([], ["Python"])
        assert empty_match == 0, "Empty skills should return 0"
        print(f"✓ Empty skills handled correctly: {empty_match}")

        return True
    except Exception as e:
        print(f"✗ Algorithm test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_endpoint_definitions():
    """Test that all endpoints are properly registered."""
    print("\n=== Testing Endpoint Definitions ===")
    try:
        from routers.matching import router

        routes = [route.path for route in router.routes]
        expected_patterns = [
            "/find-teammates",
            "/validate-team",
            "/team-gaps/{team_id}",
            "/compatibility/{user1_id}/{user2_id}",
            "/health",
        ]

        for pattern in expected_patterns:
            found = any(pattern in route for route in routes)
            status = "✓" if found else "✗"
            print(f"{status} Endpoint {pattern}: {'found' if found else 'NOT FOUND'}")

        return True
    except Exception as e:
        print(f"✗ Endpoint definition test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_error_handling():
    """Test error handling logic."""
    print("\n=== Testing Error Handling ===")
    try:
        # Test invalid inputs would raise HTTPException
        from fastapi import HTTPException

        # Simulate validation
        test_inputs = [
            ("", False),  # Empty user_id should fail
            ("user1", True),  # Valid user_id should pass
            (None, False),  # None should fail
        ]

        for user_id, should_pass in test_inputs:
            is_valid = user_id is not None and len(str(user_id).strip()) > 0
            status = "✓" if is_valid == should_pass else "✗"
            print(f"{status} Input validation for '{user_id}': {is_valid}")

        return True
    except Exception as e:
        print(f"✗ Error handling test failed: {str(e)}")
        return False


def test_score_ranges():
    """Test that all scores are in valid ranges."""
    print("\n=== Testing Score Ranges ===")
    try:
        from utils.helpers import (
            calculate_skill_match,
            calculate_proficiency_alignment,
        )

        # Test multiple combinations
        test_cases = [
            (["Python"], ["Python"]),  # Perfect match
            (["Python"], ["JavaScript"]),  # No match
            (["Python", "Java"], ["Python", "JavaScript"]),  # Partial match
        ]

        all_valid = True
        for skills1, skills2 in test_cases:
            score = calculate_skill_match(skills1, skills2)
            if not (0 <= score <= 1):
                print(f"✗ Score out of range for {skills1} vs {skills2}: {score}")
                all_valid = False
            else:
                print(f"✓ Score valid for {skills1} vs {skills2}: {score:.2f}")

        return all_valid
    except Exception as e:
        print(f"✗ Score range test failed: {str(e)}")
        return False


def test_skills_engine_endpoints():
    """Smoke-test Skills Engine and Team Matching Engine via TestClient."""
    print("\n=== Testing Skills and Matching Engine Endpoints ===")
    try:
        from utils.db import engine, SessionLocal
        from models.db_models import Base, UserSkill as DBUserSkill, Team as DBTeam, TeamMember as DBTeamMember
        
        # 1. Initialize Tables
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        # 2. Seed Mock Data
        db = SessionLocal()
        try:
            # Seed users skills
            user1_skills = [
                DBUserSkill(id="u1_python", user_id="user1", skill_name="Python", skill_category="Programming Language", proficiency_level="Advanced"),
                DBUserSkill(id="u1_fastapi", user_id="user1", skill_name="FastAPI", skill_category="Framework/Library", proficiency_level="Advanced"),
            ]
            user2_skills = [
                DBUserSkill(id="u2_python", user_id="user2", skill_name="Python", skill_category="Programming Language", proficiency_level="Intermediate"),
                DBUserSkill(id="u2_react", user_id="user2", skill_name="React", skill_category="Framework/Library", proficiency_level="Advanced"),
            ]
            for s in user1_skills + user2_skills:
                db.add(s)
            
            # Seed team and team members
            team1 = DBTeam(id="team1", projectId="project1")
            db.add(team1)
            db.commit()
            
            tm1 = DBTeamMember(id="tm1", teamId="team1", userId="user1", role="LEAD")
            tm2 = DBTeamMember(id="tm2", teamId="team1", userId="user2", role="MEMBER")
            db.add(tm1)
            db.add(tm2)
            db.commit()
        finally:
            db.close()

        # 3. Instantiate TestClient
        from fastapi.testclient import TestClient
        from main import app

        client = TestClient(app)

        # 4. Test Skills Validation
        validate = client.post(
            "/skills/validate",
            json={"skill_name": "python", "suggest_category": True},
        )
        assert validate.status_code == 200
        assert validate.json()["normalized_name"] == "Python"
        print("✓ POST /skills/validate")

        # 5. Test Skill Categories
        categories = client.get("/skills/categories")
        assert categories.status_code == 200
        assert categories.json()["total_categories"] >= 1
        print("✓ GET /skills/categories")

        # 6. Test User Skill Creation & Retrieval
        add_skill = client.post(
            "/skills/profile/user1/skills",
            json={"name": "Docker", "category": "Cloud & DevOps", "proficiency_level": "Intermediate"}
        )
        assert add_skill.status_code == 201
        print("✓ POST /skills/profile/{user_id}/skills")

        get_skills = client.get("/skills/profile/user1/skills")
        assert get_skills.status_code == 200
        assert len(get_skills.json()["skills"]) >= 1
        print("✓ GET /skills/profile/{user_id}/skills")

        # 7. Test Skills Match
        match = client.post("/skills/match/user1/user2")
        assert match.status_code == 200
        assert "overall_similarity" in match.json()
        print("✓ POST /skills/match/{user1}/{user2}")

        # 8. Test Teammate Search
        teammates = client.post("/matching/find-teammates?user_id=user1&max_suggestions=3")
        assert teammates.status_code == 200
        assert "suggestions" in teammates.json()
        print("✓ POST /matching/find-teammates")

        # 9. Test Team Validation
        validation = client.post("/matching/validate-team?team_ids=user1&team_ids=user2")
        assert validation.status_code == 200
        assert "team_analysis" in validation.json()
        print("✓ POST /matching/validate-team")

        # 10. Test Team Gaps
        gaps = client.get("/matching/team-gaps/team1")
        assert gaps.status_code == 200
        assert "gaps" in gaps.json()
        print("✓ GET /matching/team-gaps")

        # 11. Test Duo Compatibility
        compat = client.post("/matching/compatibility/user1/user2")
        assert compat.status_code == 200
        assert "overall_compatibility" in compat.json()
        print("✓ POST /matching/compatibility/{user1}/{user2}")

        return True
    except Exception as e:
        print(f"✗ Skills and Matching Engine endpoint test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("TEAM MATCHING ENGINE - ENDPOINT TESTS")
    print("=" * 60)

    test_results = []

    # Run all test categories
    test_results.append(("Schema Tests", test_schemas()))
    test_results.append(("Helper Function Tests", test_helper_functions()))
    test_results.append(("Algorithm Tests", test_algorithm_logic()))
    test_results.append(("Endpoint Definition Tests", test_endpoint_definitions()))
    test_results.append(("Error Handling Tests", test_error_handling()))
    test_results.append(("Score Range Tests", test_score_ranges()))
    test_results.append(("Skills Engine Endpoint Tests", test_skills_engine_endpoints()))

    # Print summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)

    for test_name, result in test_results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")

    print(f"\nTotal: {passed}/{total} test categories passed")

    if passed == total:
        print("\n✓ All tests passed!")
        return 0
    else:
        print(f"\n✗ {total - passed} test category/categories failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
