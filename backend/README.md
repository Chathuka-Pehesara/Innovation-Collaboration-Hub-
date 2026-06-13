# Backend Service - Express + Prisma

This is the Express API driving the core logic, databases, web sockets, and queues of the **Innovation & Collaboration Hub**.

## Ownership & Responsibility
*   **Owners**: IT Team + Cybersecurity Team
*   **Routes**: IT Team
*   **Middleware**: Cybersecurity Team
*   **Security Services**: Cybersecurity Team
*   **Web Sockets**: IT + Networking (Shared)

## Setup Instructions
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables and fill target passwords:
   ```bash
   cp .env.example .env
   ```
3. Run Database Migrations (requires active Postgres server):
   ```bash
   npx prisma migrate dev
   ```
4. Seed mock parameters:
   ```bash
   npx prisma db seed
   ```
5. Run the dev service:
   ```bash
   npm run dev
   ```
