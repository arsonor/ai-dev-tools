# Setup Guide

Follow these steps to get the collaborative coding platform running on your machine.

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- npm
- uv (Python package manager) - Install with: `pip install uv`

## Quick Start

If you want to run both frontend and backend together:

1. Install backend dependencies:
   ```bash
   cd backend
   uv sync
   cd ..
   ```

2. Install frontend dependencies and run both services:
   ```bash
   cd frontend
   npm install
   npm run dev:all
   ```

   This will start both the frontend (port 5173) and backend (port 8000) concurrently.

3. Open your browser and go to `http://localhost:5173`

---

For individual setup and more control, follow the detailed steps below:

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies using uv:
   ```bash
   uv sync
   ```

   This will create a virtual environment and install all dependencies from `pyproject.toml`.

3. Start the backend server:
   ```bash
   uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

   Or with auto-reload for development:
   ```bash
   uv run uvicorn app.main:app --reload
   ```

   The backend will start on `http://localhost:8000`

### Running Tests

To run the integration tests:
```bash
uv sync --extra test  # Install test dependencies
uv run pytest
```

## Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

## Available Commands

### Frontend Commands (from frontend/ directory)

- `npm run dev` - Run frontend only
- `npm run dev:backend` - Run backend only (from frontend directory)
- `npm run dev:all` - Run both frontend and backend concurrently
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend Commands (from backend/ directory)

- `uv sync` - Install dependencies
- `uv run uvicorn app.main:app --reload` - Run backend with auto-reload
- `uv run pytest` - Run tests

## Usage

1. Open your browser and go to `http://localhost:5173`
2. Click "Create New Session" to start a new coding session
3. Share the session URL with others to collaborate in real-time
4. Alternatively, enter a session ID to join an existing session

## Features

- **Real-time Collaboration**: All users see code changes instantly
- **Syntax Highlighting**: Support for multiple programming languages
- **Code Execution**: Run JavaScript code directly in the browser
- **Session Management**: Create and join sessions with shareable links
- **Participant Tracking**: See how many people are in the session

## Troubleshooting

### Backend Issues

- **Port 8000 already in use**: Change the port using `--port` flag: `uv run uvicorn app.main:app --port 8001`
- **WebSocket connection failed**: Ensure the backend is running and CORS is properly configured
- **Import errors**: Run `uv sync` to ensure all dependencies are installed

### Frontend Issues

- **Port 5173 already in use**: The frontend will automatically try the next available port
- **Monaco Editor not loading**: Check your internet connection (Monaco loads some resources from CDN)
- **WebSocket not connecting**: Verify the backend URL in the frontend code matches your backend address

## Development Tips

- The backend uses in-memory storage, so sessions will be lost when the server restarts
- For production, consider adding persistent storage (database)
- The code execution currently only supports JavaScript safely; Python uses code analysis
- To add more languages, implement execution handlers in `CodeExecutor.jsx`
