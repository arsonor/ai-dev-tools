# Real-Time Collaborative Coding Interview Platform

A real-time collaborative coding platform for technical interviews with live code synchronization.

## Features

- 🔗 Shareable session links
- 👥 Multi-user real-time collaboration
- 🎨 Syntax highlighting for multiple languages
- ▶️ In-browser code execution
- 🚀 WebSocket-based real-time sync

## Tech Stack

- **Frontend**: React + Vite (JavaScript)
- **Backend**: FastAPI (Python 3.10+)
- **Package Manager**: uv for Python dependencies

## Getting Started

### Quick Start (Run Both Services)

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
