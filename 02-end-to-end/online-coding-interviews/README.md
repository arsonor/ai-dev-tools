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

### Backend Setup

```bash
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
python main.py
```

Backend runs on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Usage

1. Start the backend server
2. Start the frontend development server
3. Open the frontend URL in your browser
4. Create a new session or join an existing one
5. Share the session link with others to collaborate in real-time
