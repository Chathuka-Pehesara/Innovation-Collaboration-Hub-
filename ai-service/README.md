# AI Service - FastAPI Microservice

This service is a FastAPI application for AI-powered features — provider-backed LLM calls (mock by default, optional Ollama or Gemini), matchmaking models, embedding logic, and skills management for the **Innovation & Collaboration Hub**.

## Ownership & Responsibility

- **Owner**: AI Team
- **Tasks**: 
  - Cosine similarities calculations
  - NLP skills extraction
  - Automated descriptions generator
  - Floating chatbot mentor interfaces
  - Skills validation and categorization
  - Team matching based on skills

## Architecture

The service is organized into modular components:

### **Skills Engine** (NEW)
A comprehensive skill management system for validating, categorizing, and matching user skills.

**Key Endpoints:**
- `POST /skills/validate` - Validate and normalize skill names
- `GET /skills/categories` - List all skill categories
- `POST /profile/{user_id}/skills` - Add user skills
- `GET /profile/{user_id}/skills` - Retrieve user skills
- `DELETE /profile/{user_id}/skills/{skill_name}` - Remove skill
- `POST /skills/match/{user1_id}/{user2_id}` - Calculate skill match for team matching
- `GET /profile/{user_id}/recommendations` - Get skill recommendations

**Key Components:**
- `routers/skills.py` - API endpoints
- `models/schemas.py` - Pydantic validation schemas
- `utils/constants.py` - Skill taxonomy, categories, proficiency levels
- `utils/helpers.py` - Skill utilities (normalization, matching, extraction)
- `utils/db.py` - Database connection and session management

### **Team Matching Engine**
```
routers/matching.py + utils/helpers.py (Jaccard skill match, complementary skills, proficiency alignment)
```
Implemented MVP endpoints use the Skills Engine helpers directly. See `MATCHING_API_DOCUMENTATION.md`.

`services/similarity_service.py` and `services/embedding_service.py` are **standalone utilities** for free-text similarity and batch ranking — not part of the current matching algorithm. Matching scores normalized skill names only; embeddings are reserved for future semantic features (e.g. project-description similarity).

### **Idea Evaluation**
```
routers/evaluation.py + services/provider_factory.py
```

### **AI Mentor & Description Generator**
```
routers/mentor.py + routers/generator.py + services/providers/
```

### **AI Providers**
LLM features use a pluggable provider layer (`services/providers/`). **Mock** is the default and requires no external API keys.

| Provider | `AI_PROVIDER` | Requirements |
|----------|---------------|--------------|
| Mock (default) | `mock` | None |
| Ollama (local) | `ollama` | Running Ollama server |
| Gemini (optional) | `gemini` | `GEMINI_API_KEY` + `pip install -r requirements-gemini.txt` |

Startup and runtime fallback: if the requested provider is misconfigured or unavailable, the service falls back to `MockProvider` automatically.

## Setup Instructions

### 1. Initialize Virtual Environment

```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
```

**Environment Variables:**
```
# AI provider (mock | ollama | gemini)
AI_PROVIDER=mock

# Ollama — when AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Gemini — optional; when AI_PROVIDER=gemini (also: pip install -r requirements-gemini.txt)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/innovation_hub?schema=public

# API Configuration
BACKEND_URL=http://localhost:5000

# Application Configuration
ENV=development                    # development or production
PORT=8000                         # Server port
LOG_LEVEL=INFO                    # INFO, DEBUG, WARNING, ERROR
LOG_FILE=false                    # Enable file logging
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000

# Database
SQL_ECHO=false                    # Echo SQL queries for debugging
```

### 4. Start the FastAPI Server

**Development Mode (with auto-reload):**
```bash
uvicorn main:app --reload --port 8000
```

**Production Mode:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 5. Access Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Skill Validation Examples

### Example 1: Validate a Skill

```bash
curl -X POST http://localhost:8000/skills/validate \
  -H "Content-Type: application/json" \
  -d '{
    "skill_name": "python",
    "suggest_category": true
  }'
```

**Response:**
```json
{
  "original_name": "python",
  "normalized_name": "Python",
  "category": "Programming Language",
  "is_predefined": true,
  "message": "Skill validated successfully"
}
```

### Example 2: List Skill Categories

```bash
curl http://localhost:8000/skills/categories
```

**Response:**
```json
{
  "categories": [
    {
      "category": "Programming Language",
      "description": "Programming and scripting languages",
      "skills": ["Python", "Java", "JavaScript", "TypeScript", ...],
      "total_count": 10
    },
    ...
  ],
  "total_categories": 10
}
```

### Example 3: Add User Skill

```bash
curl -X POST http://localhost:8000/skills/profile/user123/skills \
  -H "Content-Type: application/json" \
  -d '{
    "name": "python",
    "category": "Programming Language",
    "proficiency_level": "Advanced"
  }'
```

**Response (201):**
```json
{
  "message": "Skill 'Python' added successfully",
  "skill": {
    "id": "user123_python",
    "name": "Python",
    "category": "Programming Language",
    "proficiency_level": "Advanced",
    "endorsements_count": 0,
    "created_at": "2026-06-24T18:32:00",
    "updated_at": "2026-06-24T18:32:00"
  }
}
```

### Example 4: Get User Skills

```bash
curl "http://localhost:8000/skills/profile/user123/skills?category=Programming%20Language"
```

**Response:**
```json
{
  "user_id": "user123",
  "skills": [
    {
      "id": "user123_python",
      "name": "Python",
      "category": "Programming Language",
      "proficiency_level": "Advanced",
      "endorsements_count": 5,
      "created_at": "2026-06-24T18:32:00",
      "updated_at": "2026-06-24T18:32:00"
    }
  ],
  "total_count": 1
}
```

### Example 5: Calculate Skill Match (for Team Matching)

```bash
curl -X POST http://localhost:8000/skills/match/user123/user456
```

**Response:**
```json
{
  "user1_id": "user123",
  "user2_id": "user456",
  "overall_similarity": 0.5,
  "matching_skills": [
    {
      "skill_name": "Python",
      "user1_proficiency": "Advanced",
      "user2_proficiency": "Intermediate",
      "proficiency_alignment": 0.75
    }
  ],
  "complementary_skills": {
    "user1_unique": ["Machine Learning"],
    "user2_unique": ["React"]
  }
}
```

### Example 6: Get Skill Recommendations

```bash
curl "http://localhost:8000/skills/profile/user123/recommendations?limit=5"
```

**Response:**
```json
{
  "user_id": "user123",
  "recommendations": [
    {
      "skill_name": "Django",
      "category": "Framework/Library",
      "reason": "Complementary web framework for Python developers",
      "complementary_to": ["Python"],
      "confidence_score": 0.9
    }
  ],
  "based_on_count": 2
}
```

## Skill Categories

The platform supports the following skill categories:

| Category | Examples |
|----------|----------|
| **Programming Language** | Python, Java, JavaScript, C++, Go, Rust |
| **Framework/Library** | React, Django, FastAPI, Spring Boot, Angular |
| **Tools & Platforms** | Git, Docker, PostgreSQL, Redis, Figma |
| **Cloud & DevOps** | AWS, Azure, GCP, Kubernetes, CI/CD |
| **Data Science** | Machine Learning, Deep Learning, TensorFlow, Pandas |
| **Security** | Cybersecurity, Network Security, Encryption, OAuth |
| **Soft Skills** | Communication, Leadership, Project Management, Teamwork |
| **Domain Knowledge** | Custom domain-specific expertise |
| **Technical** | General technical competencies |
| **Other** | Uncategorized skills |

## Proficiency Levels

All user skills include a proficiency level:

- **Beginner** - Basic understanding, learning phase
- **Intermediate** - Comfortable with practical application
- **Advanced** - Deep expertise, can mentor others
- **Expert** - Master level, published work or extensive experience

## Database Integration

The Skills Engine expects the backend team to provide the following database tables:

```sql
-- User Skills (managed by backend ORM)
CREATE TABLE users_skills (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY REFERENCES users(id),
  skill_name VARCHAR(255) NOT NULL,
  skill_category VARCHAR(100),
  proficiency_level VARCHAR(50),
  endorsements_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

-- Optional: Skill Taxonomy
CREATE TABLE skill_categories (
  id UUID PRIMARY KEY,
  category_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(255)
);

-- Optional: Predefined Skill Taxonomy
CREATE TABLE skill_taxonomy (
  id UUID PRIMARY KEY,
  skill_name VARCHAR(255) UNIQUE NOT NULL,
  category_id UUID FOREIGN KEY REFERENCES skill_categories(id),
  description TEXT,
  tags JSONB,
  popularity_score INT
);
```

## API Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Error message describing the issue",
  "error_code": "INVALID_SKILL_NAME",
  "timestamp": "2026-06-24T18:32:00"
}
```

**Status Codes:**
- `200` - Successful GET/POST
- `201` - Resource created
- `204` - Resource deleted (no content)
- `400` - Invalid input
- `404` - Not found
- `422` - Validation error
- `500` - Server error

## Project Structure

```
ai-service/
├── main.py                          # FastAPI app initialization
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment template
├── Dockerfile                       # Container configuration
├── docker-compose.yml               # (in parent)
│
├── models/
│   └── schemas.py                   # Pydantic schemas (with Skills Engine schemas)
│
├── routers/
│   ├── skills.py                    # Skills Engine endpoints ✅
│   ├── matching.py                  # Team matching endpoints
│   ├── evaluation.py                # Idea evaluation endpoints
│   ├── mentor.py                    # Mentor chatbot endpoints
│   └── generator.py                 # Description generator endpoints
│
├── services/
│   ├── provider_factory.py          # AI provider selection & fallback
│   ├── providers/                     # mock, ollama, optional gemini
│   ├── similarity_service.py        # Standalone similarity helpers (not used by matching MVP)
│   └── embedding_service.py         # Standalone text embeddings (not used by matching MVP)
│
└── utils/
    ├── constants.py                 # Skill taxonomy & enums ✅
    ├── db.py                        # Database connection & pooling ✅
    └── helpers.py                   # Skill utilities ✅
```

## Development Workflow

### Add a New Skill Endpoint

1. Define Pydantic schema in `models/schemas.py`
2. Create endpoint in `routers/skills.py`
3. Add helper function in `utils/helpers.py` if needed
4. Test with Swagger UI at `/docs`
5. Update this README with examples

### Update Skill Taxonomy

Edit `utils/constants.py`:
- Add to `PREDEFINED_SKILLS` dictionary
- Provide category mapping
- Update `SKILL_CATEGORY_DESCRIPTIONS` if new category

### Database Connection Issues

If you encounter database connection errors:

1. Check `DATABASE_URL` in `.env` file
2. Verify PostgreSQL is running: `psql --version`
3. Test connection: `psql -U postgres -d innovation_hub -c "SELECT 1"`
4. Check connection pooling: Enable `SQL_ECHO=true` for detailed logs

## Performance Tips

1. **Skill Normalization** - Results can be cached for repeated lookups
2. **Batch Operations** - Use bulk insert/update for multiple skills
3. **Database Indexes** - Create indexes on:
   - `users_skills.user_id` (frequent lookups)
   - `users_skills.skill_name` (validation checks)
4. **Connection Pooling** - Configured with 10 persistent connections

## Monitoring & Logs

View application logs:
```bash
tail -f app.log
```

Check service health:
```bash
curl http://localhost:8000/health
curl http://localhost:8000/skills/health
curl http://localhost:8000/mentor/health
curl http://localhost:8000/generator/health
curl http://localhost:8000/ideas/health
```

AI-backed routes include provider-agnostic status fields:

| Field | Meaning |
|-------|---------|
| `requested_provider` | Value of `AI_PROVIDER` (`mock`, `ollama`, or `gemini`) |
| `active_provider` | Provider currently handling LLM calls |
| `provider_configured` | Live LLM backend is configured and reachable |
| `provider_available` | Requested provider is active (no startup fallback to mock) |
| `fallback_applied` | `true` when startup fell back to mock due to misconfiguration |

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t innovation-hub-ai:1.0.0 .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@db:5432/hub" \
  -e AI_PROVIDER="mock" \
  -e LOG_LEVEL="WARNING" \
  innovation-hub-ai:1.0.0
```

### Environment-Specific Configuration

**Development:**
```
ENV=development
LOG_LEVEL=DEBUG
ALLOWED_ORIGINS=*
```

**Production:**
```
ENV=production
LOG_LEVEL=WARNING
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Team Integration

### For Team Matching Service
- Use `POST /skills/match/{user1_id}/{user2_id}` to assess team compatibility
- Or call `calculate_skill_match()` directly from `utils.helpers`

### For Backend Team
- Skills Engine expects `users_skills` table with standard schema
- Implement JWT token validation
- Provide user lookup endpoints

### For Frontend Team
- Use `/docs` endpoint for interactive API exploration
- Skills endpoint paths follow REST conventions
- All responses include proper error codes and messages

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: No module named 'fastapi'` | Run `pip install -r requirements.txt` |
| Database connection timeout | Check DATABASE_URL, verify PostgreSQL is running |
| CORS errors from frontend | Add your frontend origin to `ALLOWED_ORIGINS` |
| Skills validation failing | Check skill name length (2-100 chars) and valid characters |
| Recommendations not generated | Ensure user has skills in profile |

## Contributing

1. Create a feature branch: `git checkout -b feature/skill-xyz`
2. Make changes to appropriate files
3. Test with Swagger UI at `/docs`
4. Update documentation
5. Commit with clear messages
6. Create pull request

## License

This project is part of the Innovation & Collaboration Hub developed by OPMS team.

---

**Last Updated:** 2026-06-24  
**Version:** 1.0.0  
**Maintainer:** AI Team
