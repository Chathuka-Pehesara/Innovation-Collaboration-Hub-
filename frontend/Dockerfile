# Dockerfile
# Owner: IT Team / Networking Team
# Description: Containerization configuration for Next.js Frontend App.

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm config set strict-ssl false && npm install

# Copy source files
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "run", "start"]
