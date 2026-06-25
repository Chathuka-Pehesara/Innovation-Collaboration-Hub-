# Team Matching Engine API Documentation

## Overview

The Team Matching Engine provides endpoints for intelligent team formation, validation, and compatibility analysis. It uses a multi-factor algorithm combining skill overlap, complementary expertise, and proficiency balance.

## Core Algorithm

### Multi-Factor Compatibility Scoring

The matching engine uses a weighted scoring system:

```
Compatibility Score = (0.35 × Skill Match) + (0.35 × Complementary Score) + (0.30 × Balance Score)
```

Where:
- **Skill Match** (0-1): Jaccard similarity of skill sets
  - `Similarity = |Skills1 ∩ Skills2| / |Skills1 ∪ Skills2|`
- **Complementary Score** (0-1): Ratio of unique skills each brings
  - `Complementary = (|Unique1| + |Unique2|) / (|Skills1| + |Skills2|)`
- **Balance Score** (0-1): Proficiency level distribution alignment
  - Teams benefit from mix of junior and senior developers
  - Measured via proficiency level difference averaging

### Proficiency Alignment Scoring

For two users' proficiency levels:
```
Alignment = 1.0 - (distance × 0.25)
```

Where distance is the proficiency level distance:
- Same level: alignment = 1.0 (perfect)
- One level apart: alignment = 0.75
- Two levels apart: alignment = 0.5
- Three levels apart: alignment = 0.25

## Endpoints

### 1. Find Teammates

**POST** `/matching/find-teammates`

Find complementary teammates for a user based on skill compatibility.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `user_id` | string | required | User requesting teammates |
| `max_suggestions` | integer | 5 | Max number of suggestions (1-20) |

#### Request Example

```bash
curl -X POST "http://localhost:8000/matching/find-teammates?user_id=user1&max_suggestions=3"
```

#### Response Schema

```json
{
  "user_id": "user1",
  "suggestions": [
    {
      "user_id": "user4",
      "compatibility_score": 0.82,
      "matching_skills": ["Python"],
      "complementary_skills": {
        "user1_unique": ["FastAPI", "PostgreSQL"],
        "user2_unique": ["Data Science", "TensorFlow"]
      },
      "team_balance_score": 0.78,
      "proficiency_distribution": {
        "Expert": 2,
        "Advanced": 2,
        "Intermediate": 1
      }
    }
  ],
  "total_suggestions": 1
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | string | Suggested teammate's ID |
| `compatibility_score` | float(0-1) | Overall compatibility score |
| `matching_skills` | array | Skills both users share |
| `complementary_skills` | object | Unique skills each brings |
| `team_balance_score` | float(0-1) | Proficiency balance metric |
| `proficiency_distribution` | object | Count by proficiency level |

#### Error Responses

- **400**: Invalid user_id (empty or null)
- **404**: User not found or has no skills
- **500**: Internal server error

---

### 2. Validate Team

**POST** `/matching/validate-team`

Score and analyze existing team composition.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `team_ids` | array[string] | List of user IDs forming the team |

#### Request Example

```bash
curl -X POST "http://localhost:8000/matching/validate-team?team_ids=user1&team_ids=user2&team_ids=user3"
```

#### Response Schema

```json
{
  "team_analysis": {
    "overall_team_score": 7.5,
    "skill_diversity": 8.2,
    "coverage_completeness": 7.0,
    "skill_gaps": ["Communication", "Leadership"],
    "skill_redundancy": {
      "Python": 2,
      "PostgreSQL": 2
    },
    "proficiency_balance": {
      "Expert": 1,
      "Advanced": 4,
      "Intermediate": 3,
      "Beginner": 1
    },
    "team_recommendations": [
      "Consider adding a team lead",
      "Balance backend and frontend expertise"
    ]
  },
  "member_count": 3
}
```

#### Scoring Details

- **Overall Team Score** (1-10): Composite score combining diversity and coverage
  - Penalizes for missing critical skills
  - Considers proficiency level distribution

- **Skill Diversity** (1-10): Ratio of unique skills to total team skills
  - Higher = broader expertise
  - 1.0 = all specialists in same area
  - 10.0 = perfect diversity

- **Coverage Completeness** (1-10): Percentage of skill categories covered
  - Based on 10 skill categories (Programming, Frameworks, Cloud, Data Science, etc.)
  - 1.0 = one category only
  - 10.0 = all categories represented

#### Error Responses

- **400**: Empty team or invalid team_ids
- **404**: No valid users found with skills
- **500**: Internal server error

---

### 3. Team Gaps

**GET** `/matching/team-gaps/{team_id}`

Identify missing expertise and learning resources for a team.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `team_id` | string | Team identifier |

#### Request Example

```bash
curl -X GET "http://localhost:8000/matching/team-gaps/team1"
```

#### Response Schema

```json
{
  "team_id": "team1",
  "gaps": [
    {
      "skill_name": "Communication",
      "category": "Soft Skills",
      "recommended_proficiency": "Intermediate",
      "priority": "high",
      "learning_resources": [
        "Coursera: Communication Fundamentals",
        "Udemy: Communication Mastery",
        "LinkedIn Learning: Communication for Teams"
      ]
    }
  ],
  "total_gaps": 2
}
```

#### Gap Priority Levels

- **high**: Critical for team success (blocking)
- **medium**: Important but not immediately blocking
- **low**: Nice-to-have enhancements

#### Error Responses

- **400**: Invalid team_id
- **404**: Team not found
- **500**: Internal server error

---

### 4. Duo Compatibility

**POST** `/matching/compatibility/{user1_id}/{user2_id}`

Detailed two-person compatibility analysis with skill breakdown.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `user1_id` | string | First user ID |
| `user2_id` | string | Second user ID |

#### Request Example

```bash
curl -X POST "http://localhost:8000/matching/compatibility/user1/user2"
```

#### Response Schema

```json
{
  "user1_id": "user1",
  "user2_id": "user2",
  "overall_compatibility": 0.78,
  "skill_match_score": 0.65,
  "complementary_score": 0.72,
  "category_breakdown": [
    {
      "skill_category": "Programming Language",
      "matching_skills_count": 1,
      "user1_unique": ["FastAPI"],
      "user2_unique": ["React"],
      "compatibility_in_category": 0.67
    }
  ],
  "communication_style_match": "Collaborative",
  "timezone_compatibility": "Partial overlap (1-2 hours difference)",
  "recommendation": "Good match",
  "rationale": "Strong skill overlap with good complementary expertise"
}
```

#### Recommendations

| Recommendation | Criteria |
|---|---|
| **Good match** | compatibility ≥ 0.75 AND complementary ≥ 0.5 |
| **Moderate** | compatibility ≥ 0.5 |
| **Build skills first** | compatibility < 0.5 |

#### Error Responses

- **400**: Invalid user IDs or same user compared to itself
- **404**: One or both users not found
- **500**: Internal server error

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request (validation error) |
| 404 | Resource not found |
| 422 | Unprocessable entity (schema error) |
| 500 | Server error |

## Integration with Skills Engine

The matching engine integrates with the Skills Engine for:

1. **Skill Normalization**: Uses `normalize_skill_name()` for consistent comparison
2. **Skill Matching**: Uses `calculate_skill_match()` for Jaccard similarity
3. **Complementary Analysis**: Uses `calculate_complementary_skills()`
4. **Proficiency Alignment**: Uses `calculate_proficiency_alignment()`

### Example Integration

```python
from utils.helpers import calculate_skill_match, calculate_complementary_skills

skills1 = ["Python", "FastAPI", "PostgreSQL"]
skills2 = ["Python", "React", "TypeScript"]

# Get Jaccard similarity
similarity = calculate_skill_match(skills1, skills2)  # Returns 0.33

# Find complementary skills
complementary = calculate_complementary_skills(skills1, skills2)
# Returns: {
#   "user1_unique": ["FastAPI", "PostgreSQL"],
#   "user2_unique": ["React", "TypeScript"]
# }
```

## Database Integration Notes

All endpoints include `# TODO: Query from database` comments for integration points:

1. **`_get_mock_user_skills(user_id)`**: Replace with `users_skills` table query
2. **`validate_team()`**: Query from `users_skills` and join with `users` table
3. **`get_team_gaps()`**: Query from `teams` table to get member list
4. **`get_duo_compatibility()`**: Query skills for both users from database

Expected schema:
```sql
-- Tables needed
- users (id, name, email, etc.)
- users_skills (user_id, skill_name, proficiency_level)
- teams (id, name, created_at)
- teams_members (team_id, user_id)
```

## Logging

All endpoints log:
- Algorithm decisions and scores
- User/team lookups
- Error cases with context
- Performance metrics (via middleware)

Example log output:
```
INFO - Found 3 teammate suggestions for user user1
INFO - Calculated compatibility for user1 and user2: 0.78
INFO - Identified 2 skill gaps for team team1
```

## Examples

### Example 1: Finding Teammates

```bash
# Find best matches for Python backend developer
curl -X POST "http://localhost:8000/matching/find-teammates?user_id=user1&max_suggestions=5"

# Response shows:
# - Data Science expert (0.82 compatibility) - complementary in ML/Data
# - Frontend developer (0.75 compatibility) - complements backend skills
# - DevOps engineer (0.70 compatibility) - complements infrastructure needs
```

### Example 2: Validating Team Composition

```bash
# Score a proposed team
curl -X POST "http://localhost:8000/matching/validate-team?team_ids=user1&team_ids=user2&team_ids=user3"

# Response indicates:
# - Overall Score: 7.5/10
# - Gaps: Leadership (high priority), Communication (high priority)
# - Redundancy: Python (2 users), PostgreSQL (2 users)
# - Recommendation: Balanced team, but add a team lead
```

### Example 3: Deep Duo Analysis

```bash
# Analyze specific pair before teaming
curl -X POST "http://localhost:8000/matching/compatibility/user1/user2"

# Response shows:
# - Overall: 0.78 (Good Match)
# - Communication style: Collaborative - aligns well
# - Timezone: Partial overlap (4 hours) - needs async planning
# - Skill breakdown by category with recommendations
```

## Performance Considerations

- Algorithm is O(n) in number of skills
- Caching is applied to embedding scores
- Database queries should have user_id index
- Maximum suggestions: 20
- Maximum team size: 20

## Future Enhancements

- Embedding-based semantic skill matching
- Historical team performance metrics
- Timezone-aware availability scheduling
- Communication style questionnaire integration
- Learning resource recommendations per gap
