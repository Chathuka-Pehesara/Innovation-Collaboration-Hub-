# Dockerfile
# Owner: IT Team / Cybersecurity Team / Networking Team
# Description: Containerization configuration for the Express Backend API.

FROM node:18-alpine

# Install OpenSSL required by Prisma query and schema engines on Alpine Linux
RUN apk add --no-cache openssl

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (including devDependencies so we can build the TypeScript files)
RUN npm install

# Copy Prisma schema definition
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy project files
COPY . .

# Build/compile the TypeScript codebase
RUN npm run build

# Expose backend port
EXPOSE 5000

# Start command: push schema changes and run server
CMD ["sh", "-c", "npx prisma db push && npm run start"]
