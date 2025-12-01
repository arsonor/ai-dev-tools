# Setup Guide

Follow these steps to get the collaborative coding platform running on your machine.

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn
- uv (Python package manager) - Install with: `pip install uv`

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment using uv:
   ```bash
   uv venv
   ```

3. Activate the virtual environment:
   - **Windows**: `.venv\Scripts\activate`
   - **Mac/Linux**: `source .venv/bin/activate`

4. Install dependencies:
   ```bash
   uv pip install -r requirements.txt
   ```

   Or if using pyproject.toml:
   ```bash
   uv pip install -e .
   ```

5. Start the backend server:
   ```bash
   python main.py
   ```

   The backend will start on `http://localhost:8000`

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

- **Port 8000 already in use**: Change the port in `backend/main.py` (line with `uvicorn.run`)
- **WebSocket connection failed**: Ensure the backend is running and CORS is properly configured

### Frontend Issues

- **Port 5173 already in use**: The frontend will automatically try the next available port
- **Monaco Editor not loading**: Check your internet connection (Monaco loads some resources from CDN)
- **WebSocket not connecting**: Verify the backend URL in the frontend code matches your backend address

## Development Tips

- The backend uses in-memory storage, so sessions will be lost when the server restarts
- For production, consider adding persistent storage (database)
- The code execution currently only supports JavaScript safely; Python uses code analysis
- To add more languages, implement execution handlers in `CodeExecutor.jsx`
