# Multi-stage Dockerfile for Collaborative Coding Interview Platform
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Setup Python backend and serve frontend
FROM python:3.10-slim

WORKDIR /app

# Install uv for faster Python package installation
RUN pip install uv

# Copy backend files
COPY backend/pyproject.toml backend/uv.lock ./

# Install Python dependencies
RUN uv pip install --system -e .

# Copy backend source
COPY backend/app ./app

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./static

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
