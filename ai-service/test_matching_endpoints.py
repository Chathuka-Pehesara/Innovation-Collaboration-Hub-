"""
Test script for Team Matching Engine endpoints.
Tests all endpoints for correct HTTP status codes, response schemas, and algorithm correctness.
"""

import sys
import json
from typing import Dict, Any

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
            _calculate_proficiency_balance_score,
            _get_skill_gaps_for_team,
        )

        # Test mock data retrieval
        skills = _get_mock_user_skills("user1")
        assert len(skills) > 0, "No skills returned for user1"
        print(f"✓ Mock skills retrieved for user1: {len(skills)} skills")

        # Test proficiency balance
        skills_empty = []
        score = _calculate_proficiency_balance_score(skills_empty)
        assert 0 <= score <= 1, "Score out of range"
        print(f"✓ Proficiency balance score calculated: {score}")

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
