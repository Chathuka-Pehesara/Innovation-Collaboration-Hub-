# Innovation & Collaboration Hub

## Project Overview
The **Innovation & Collaboration Hub** is a multi-service web platform designed to facilitate student collaboration, project ideation, team matching, and academic growth. The application integrates modern frontend experiences, a reliable backend infrastructure, and advanced AI utilities to evaluate ideas, parse student skills, suggest teammates, and provide real-time chatbot mentorship.

---

## Team Structure & Ownership
The project is built and maintained by 4 specialized teams:
*   **IT Team**: Responsible for the user experience, application layout, pages routing, and core data handlers.
*   **Cybersecurity Team**: Responsible for user safety, identity verification, rate-limiting policies, secure media uploads, and data sanitization.
*   **AI Team**: Responsible for the mathematical matchmaking ranking model, LLM prompting/integration (via Gemini), and skill vector embeddings.
*   **Networking Team**: Responsible for multi-container Docker Orchestration, infrastructure reliability, CI/CD automated validations, and real-time networking channels.

### Ownership Map
| Service / Path | Responsible Team |
| :--- | :--- |
| `/frontend` | **IT Team** |
| `/backend/routes` | **IT Team** |
| `/backend/middleware` | **Cybersecurity Team** |
| `/backend/services/authService.ts` | **Cybersecurity Team** |
| `/backend/services/uploadService.ts` | **Cybersecurity Team** |
| `/backend/socket` | **IT + Networking Team (shared)** |
| `/ai-service` | **AI Team** |
| `/docker-compose.yml` | **Networking Team** |
| `/.github/workflows` | **Networking Team** |

---

## Folder Structure
```text
innovation-hub/
├── README.md
├── .gitignore
├── docker-compose.yml
├── frontend/                  # Next.js 14 Frontend Application
├── backend/                   # Node.js + Express + Prisma Backend
├── ai-service/                # Python FastAPI AI Microservice
└── .github/                   # Workflows & Templates
```

---

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)
*   Python (3.10+)
*   Docker & Docker Compose (for containerized setup)

### Setup Steps per Service

#### 1. Running with Docker Compose (Recommended for Networking)
From the project root:
```bash
docker-compose up --build
```

#### 2. Local Frontend Setup (IT Team)
```bash
cd frontend
npm install
npm run dev
```

#### 3. Local Backend Setup (IT + Cybersecurity)
```bash
cd backend
npm install
npx prisma db seed
npm run dev
```

#### 4. Local AI Service Setup (AI Team)
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Environment Variables

### Frontend (`/frontend/.env.example`)
| Name | Default Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | Target URL for Backend REST API |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:5000` | Target URL for real-time WebSocket connection |

### Backend (`/backend/.env.example`)
| Name | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | Connection string for PostgreSQL database |
| `JWT_SECRET` | `super_secret_jwt...` | Secret key for signing authorization JSON Web Tokens |
| `REDIS_URL` | `redis://localhost:6379` | Connection string for cache & jobs broker |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Cloudinary asset management account name |
| `SMTP_HOST` | `smtp.mailtrap.io` | SMTP server host for sending verification emails |
| `AI_SERVICE_URL` | `http://localhost:8000` | REST endpoint for the AI FastAPI Microservice |

### AI Service (`/ai-service/.env.example`)
| Name | Default Value | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `your_gemini_key` | API authorization token for Gemini models |
| `DATABASE_URL` | `postgresql://...` | Connection string to backend SQL engine |
| `BACKEND_URL` | `http://localhost:5000` | Callback URL endpoint referencing Node service |

---

## Branch Naming Convention
To ensure consistent version control across teams, use the following patterns:
*   `feature/[team]-[feature-name]`
*   `fix/[team]-[bug-name]`

*   **Example Features**:
    *   `feature/ai-team-matching-algorithm`
    *   `feature/it-user-profile-layout`
    *   `feature/cyber-jwt-verification`
    *   `feature/net-docker-setup`
*   **Example Fixes**:
    *   `fix/cyber-rate-limiter-bypass`
    *   `fix/it-navbar-responsive-crash`

---

## Commit Message Format
Commit messages must identify the contributing team, type of modification, and a clear summary description:
```text
[TEAM] type: short description
```
*   **Allowed Teams**: `[IT]`, `[CYBER]`, `[AI]`, `[NET]`
*   **Allowed Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

*   **Example Commits**:
    *   `[AI] feat: add cosine similarity matching`
    *   `[CYBER] fix: enforce stronger password entropy validation`
    *   `[IT] docs: update component documentation headers`
    *   `[NET] chore: include redis image inside compose configuration`

---

## How to Raise a Pull Request
1. Branch out from `main` using the Branch Naming Convention.
2. Complete your development keeping to your assigned service boundaries.
3. Run local linters, compilation tests, and verify code quality.
4. Push your branch to GitHub and create a Pull Request.
5. Populate the Pull Request using the template defined in [PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md).
6. Request reviews from relevant team leads.
7. Merge only after all pipeline checks pass and approvals are granted.

---

## Tech Stack Summary Table
| Service | Technologies | Owner |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand | IT Team |
| **Backend** | Node.js, Express, TypeScript, Prisma (PostgreSQL), Redis (Bull), Socket.io | IT + Cybersecurity |
| **AI Microservice** | FastAPI, Python, Google Gemini SDK, Sentence-Transformers, Scikit-learn | AI Team |
| **Infrastructure** | Docker, Docker Compose, GitHub Actions CI/CD | Networking Team |

---

## Contact / Team Leads
*   **IT Team Lead**: [Sewwandi / Email]
*   **Cybersecurity Team Lead**: [Vikum / vikumdulaksha@gmail.com]
*   **AI Team Lead**: [Chathuka / Chathuka02Pehesara@gmail.com]
*   **Networking Team Lead**: [Dumindu / Email]
