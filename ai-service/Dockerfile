# Dockerfile
# Owner: AI Team / Networking Team
# Description: Containerization configurations for building the Python FastAPI AI Microservice.

FROM python:3.10-slim

WORKDIR /app


# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy microservice project files
COPY . .

EXPOSE 8000

# Start FastAPI server binding to port 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
