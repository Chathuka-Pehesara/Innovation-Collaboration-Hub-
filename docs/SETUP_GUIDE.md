# 🚀 Developer Setup Guide

This guide walks you through setting up and running the **Innovation Collaboration Hub** locally on Windows, macOS, or Linux.

---

## 📋 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or `v22.x` ([nodejs.org](https://nodejs.org/))
- **npm**: `v10.x` or higher
- **PostgreSQL**: PostgreSQL 15+ (or cloud Supabase instance)
- **Python**: `3.10+` (optional, for local `ai-service`)
- **Docker & Docker Compose**: (optional, for containerized run)

---

## ⚙️ 2. Environment Configuration

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and configure your credentials:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# PostgreSQL Connection (Use Direct 5432 or Supabase pooler)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@your-db-host:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@your-db-host:5432/postgres?sslmode=require"

# JWT Authentication Secret
JWT_SECRET="your_secure_jwt_secret_here"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"

# Optional Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### Frontend (`frontend/.env`)
Create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 🗄️ 3. Database Sync & Prisma ORM

From the root directory, you can run convenience scripts:

```bash
# Push Prisma Schema to PostgreSQL Database
npm run db:push

# Generate Prisma Client Types
npm run db:generate

# Open Prisma Studio Web GUI
npm run db:studio
```

> **Note**: This project utilizes **Prisma v5.10.2 / v5.22.0**. Always run `npm run db:push` from the root directory or inside `backend/` to prevent global Prisma v7 CLI conflicts.

---

## 💻 4. Running the Development Servers

Open two terminal tabs from the project root:

### Terminal 1: Backend Server
```bash
npm run dev:backend
# Starts Express server on http://localhost:5000
```

### Terminal 2: Frontend Application
```bash
npm run dev:frontend
# Starts Next.js app on http://localhost:3000
```

---

## 🐳 5. Running with Docker Compose

To spin up all services (PostgreSQL, Redis, Backend, Frontend, and AI Service):

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- AI Service: `http://localhost:8000`
- Prisma Studio: `http://localhost:5555`
