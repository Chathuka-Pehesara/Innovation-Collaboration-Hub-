# 👤 Student Profile Management

The **Profile Management** module allows students, researchers, and administrators to showcase technical proficiencies, portfolio projects, availability status, and verified skill quizzes.

---

## 🌟 Key Features

### 1. Dynamic User Profiles
- **Basic Info**: Name, student ID, bio, department, and graduation year.
- **Social & Portfolios**: Direct integrations for GitHub, LinkedIn, personal website, and resume links.
- **Role Badging**: Distinct badges for `admin`, `student`, `mentor`, and department leads.

### 2. Verified Skills & Quizzes
- Skill tags categorized by discipline (e.g., Next.js, PyTorch, Penetration Testing, Docker).
- Interactive skill quizzes (`QuizModal.tsx`, `ProjectQuizModal.tsx`) allowing students to earn verified badges.

### 3. Availability & Matching
- Real-time availability toggles (`Available for Projects`, `Busy`, `Open for Mentorship`).
- Weekly bandwidth and preferred collaboration hours.

---

## 🗃️ Database Schema (`Prisma User Model`)

```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  name          String
  studentId     String?        @unique
  department    String?
  bio           String?
  avatar        String?
  githubUrl     String?
  linkedinUrl   String?
  portfolioUrl  String?
  skills        String[]       @default([])
  badges        String[]       @default([])
  xp            Int            @default(0)
  isAvailable   Boolean        @default(true)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}
```

---

## 📡 Profile API Endpoints

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/users/profile` | `GET` | Get logged-in user's profile | Yes |
| `/api/users/:id` | `GET` | Get public profile by User ID | No |
| `/api/users/profile` | `PUT` | Update profile bio, skills, and links | Yes |
| `/api/users/avatar` | `POST` | Upload and update profile avatar | Yes |
| `/api/users/quiz/submit`| `POST` | Submit skill quiz answers for badge verification | Yes |
