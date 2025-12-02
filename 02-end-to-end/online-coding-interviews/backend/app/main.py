from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Dict, List, Set
import json
import uuid
from datetime import datetime
from pathlib import Path
import os

app = FastAPI(title="Collaborative Coding Interview Platform")

# CORS configuration
# Allow local development and production origins
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "https://*.fly.dev",  # Fly.io production
]

# In production, also allow the same origin (when frontend is served from backend)
if os.getenv("FLY_APP_NAME"):
    # Running on Fly.io
    allowed_origins.append("*")  # Allow same origin in production

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if not os.getenv("FLY_APP_NAME") else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
sessions: Dict[str, dict] = {}
# WebSocket connections: session_id -> set of WebSocket connections
connections: Dict[str, Set[WebSocket]] = {}


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast(self, message: dict, session_id: str, exclude: WebSocket = None):
        if session_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[session_id]:
                if connection != exclude:
                    try:
                        await connection.send_json(message)
                    except:
                        disconnected.add(connection)

            # Clean up disconnected clients
            for connection in disconnected:
                self.disconnect(connection, session_id)


manager = ConnectionManager()


@app.get("/")
async def root():
    return {"message": "Collaborative Coding Interview Platform API"}


@app.post("/sessions")
async def create_session():
    """Create a new coding session"""
    session_id = str(uuid.uuid4())[:8]  # Short session ID
    sessions[session_id] = {
        "id": session_id,
        "code": "# Write your code here\n",
        "language": "python",
        "created_at": datetime.now().isoformat(),
        "participants": 0
    }
    return {"session_id": session_id, "session": sessions[session_id]}


@app.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session details"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = sessions[session_id].copy()
    session["participants"] = len(manager.active_connections.get(session_id, set()))
    return session


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time collaboration"""

    # Check if session exists
    if session_id not in sessions:
        await websocket.close(code=4004, reason="Session not found")
        return

    await manager.connect(websocket, session_id)

    try:
        # Send current session state to the new client
        await websocket.send_json({
            "type": "init",
            "code": sessions[session_id]["code"],
            "language": sessions[session_id]["language"]
        })

        # Broadcast participant count update
        participant_count = len(manager.active_connections[session_id])
        await manager.broadcast({
            "type": "participants",
            "count": participant_count
        }, session_id)

        # Handle incoming messages
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")

            if message_type == "code_change":
                # Update session code (last-write-wins)
                sessions[session_id]["code"] = data.get("code", "")

                # Broadcast to all other clients
                await manager.broadcast({
                    "type": "code_change",
                    "code": data.get("code", "")
                }, session_id, exclude=websocket)

            elif message_type == "language_change":
                # Update programming language
                sessions[session_id]["language"] = data.get("language", "python")

                # Broadcast to all other clients
                await manager.broadcast({
                    "type": "language_change",
                    "language": data.get("language", "python")
                }, session_id, exclude=websocket)

            elif message_type == "cursor_position":
                # Broadcast cursor position (optional feature)
                await manager.broadcast({
                    "type": "cursor_position",
                    "user_id": data.get("user_id"),
                    "position": data.get("position")
                }, session_id, exclude=websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)

        # Broadcast updated participant count
        if session_id in manager.active_connections:
            participant_count = len(manager.active_connections[session_id])
            await manager.broadcast({
                "type": "participants",
                "count": participant_count
            }, session_id)

    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, session_id)


# Serve static files (for Docker deployment)
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend files for production (Docker)"""
        # Serve index.html for all frontend routes
        if full_path and not full_path.startswith("api"):
            file_path = static_dir / full_path
            if file_path.exists() and file_path.is_file():
                return FileResponse(file_path)

        # Default to index.html for SPA routing
        return FileResponse(static_dir / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
