# Real-Time Collaborative Coding Interview Platform

A real-time collaborative coding platform for technical interviews with live code synchronization.

## Features

- 🔗 Shareable session links
- 👥 Multi-user real-time collaboration
- 🎨 Syntax highlighting for multiple languages
- ▶️ In-browser code execution (JavaScript & Python via WebAssembly)
- 🐍 Python execution powered by Pyodide (no server-side execution)
- 🚀 WebSocket-based real-time sync

## Tech Stack

- **Frontend**: React + Vite (JavaScript)
- **Backend**: FastAPI (Python 3.10+)
- **Package Manager**: uv for Python dependencies

## Getting Started

### Quick Start with Docker (Recommended)

Run the entire application in a container:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:8000`

### Quick Start (Development Mode)

Run both frontend and backend together with a single command:

```bash
cd frontend
npm install
npm run dev:all
```

This will start:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:8000`

### Individual Setup

**Backend only:**
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

**Frontend only:**
```bash
cd frontend
npm install
npm run dev
```

## Usage

1. Run both services with `npm run dev:all` (from frontend directory)
2. Open your browser and go to `http://localhost:5173`
3. Create a new session or join an existing one
4. Share the session link with others to collaborate in real-time

## Deployment

### Render (Recommended for Production)

Deploy to Render with WebSocket support and automatic HTTPS:

**Option 1: Blueprint (uses render.yaml):**
1. Push your code to GitHub
2. Go to https://render.com and sign up/login
3. Click "New" → "Blueprint"
4. Connect your repository - Render will auto-detect `render.yaml`

**Option 2: Manual Setup:**
1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select "Docker" as environment
5. Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Docker Deployment

Build and run with Docker:
```bash
docker-compose up --build
```

Or using Docker directly:
```bash
docker build -t collaborative-coding .
docker run -p 8000:8000 collaborative-coding
```

## Testing

Run the integration tests to verify client-server interaction:

```bash
cd backend
uv sync --extra test  # Install test dependencies
uv run pytest
```

See [TESTING.md](TESTING.md) for detailed testing documentation.

## Documentation

- [SETUP.md](SETUP.md) - Detailed setup instructions
- [TESTING.md](TESTING.md) - Testing guide and test documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide (Render)
