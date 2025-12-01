import pytest
import json
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocket
from main import app, sessions, manager
import asyncio


@pytest.fixture
def client():
    """Create a test client for the FastAPI app"""
    return TestClient(app)


@pytest.fixture(autouse=True)
def clear_sessions():
    """Clear sessions before each test"""
    sessions.clear()
    manager.active_connections.clear()
    yield
    sessions.clear()
    manager.active_connections.clear()


class TestSessionManagement:
    """Test session creation and retrieval"""

    def test_create_session(self, client):
        """Test creating a new session"""
        response = client.post("/sessions")
        assert response.status_code == 200

        data = response.json()
        assert "session_id" in data
        assert "session" in data
        assert len(data["session_id"]) == 8  # Short session ID

        session = data["session"]
        assert session["code"] == "# Write your code here\n"
        assert session["language"] == "python"
        assert "created_at" in session

    def test_get_existing_session(self, client):
        """Test retrieving an existing session"""
        # Create a session
        create_response = client.post("/sessions")
        session_id = create_response.json()["session_id"]

        # Get the session
        get_response = client.get(f"/sessions/{session_id}")
        assert get_response.status_code == 200

        data = get_response.json()
        assert data["id"] == session_id
        assert data["code"] == "# Write your code here\n"
        assert data["language"] == "python"
        assert data["participants"] == 0

    def test_get_nonexistent_session(self, client):
        """Test retrieving a non-existent session returns 404"""
        response = client.get("/sessions/nonexistent")
        assert response.status_code == 404
        assert response.json()["detail"] == "Session not found"

    def test_multiple_sessions(self, client):
        """Test creating multiple sessions generates unique IDs"""
        session_ids = set()

        for _ in range(5):
            response = client.post("/sessions")
            session_id = response.json()["session_id"]
            session_ids.add(session_id)

        # All session IDs should be unique
        assert len(session_ids) == 5


class TestWebSocketConnection:
    """Test WebSocket connections and basic functionality"""

    def test_websocket_connect_to_valid_session(self, client):
        """Test connecting to a valid session via WebSocket"""
        # Create a session
        response = client.post("/sessions")
        session_id = response.json()["session_id"]

        # Connect via WebSocket
        with client.websocket_connect(f"/ws/{session_id}") as websocket:
            # Should receive init message
            data = websocket.receive_json()
            assert data["type"] == "init"
            assert data["code"] == "# Write your code here\n"
            assert data["language"] == "python"

            # Should receive participant count update
            data = websocket.receive_json()
            assert data["type"] == "participants"
            assert data["count"] == 1

    def test_websocket_connect_to_invalid_session(self, client):
        """Test connecting to non-existent session fails"""
        with pytest.raises(Exception):
            with client.websocket_connect("/ws/invalid-session") as websocket:
                pass

    def test_multiple_websocket_connections(self, client):
        """Test multiple clients connecting to same session"""
        # Create a session
        response = client.post("/sessions")
        session_id = response.json()["session_id"]

        # Connect first client
        with client.websocket_connect(f"/ws/{session_id}") as ws1:
            # Receive init and participant messages
            ws1.receive_json()  # init
            data = ws1.receive_json()  # participants
            assert data["count"] == 1

            # Connect second client
            with client.websocket_connect(f"/ws/{session_id}") as ws2:
                # Second client receives init
                ws2.receive_json()  # init
                ws2.receive_json()  # participants (count: 2)

                # First client should receive participant update
                data = ws1.receive_json()
                assert data["type"] == "participants"
                assert data["count"] == 2

    def test_websocket_disconnect_updates_participants(self, client):
        """Test that disconnecting updates participant count"""
        response = client.post("/sessions")
        session_id = response.json()["session_id"]

        with client.websocket_connect(f"/ws/{session_id}") as ws1:
            ws1.receive_json()  # init
            ws1.receive_json()  # participants (1)

            # Connect and disconnect second client
            with client.websocket_connect(f"/ws/{session_id}") as ws2:
                ws2.receive_json()  # init
                ws2.receive_json()  # participants (2)
                ws1.receive_json()  # participants update (2)

            # After ws2 disconnects, ws1 should get update
            data = ws1.receive_json()
            assert data["type"] == "participants"
            assert data["count"] == 1


class TestCodeSynchronization:
    """Test real-time code synchronization"""

    def test_code_change_broadcast(self, client):
        """Test that code changes are broadcast to other clients"""
        response = client.post("/sessions")
        session_id = response.json()["session_id"]

        with client.websocket_connect(f"/ws/{session_id}") as ws1:
            ws1.receive_json()  # init
            ws1.receive_json()  # participants

            with client.websocket_connect(f"/ws/{session_id}") as ws2:
                ws2.receive_json()  # init
                ws2.receive_json()  # participants
                ws1.receive_json()  # participants update

                # Client 1 sends code change
                new_code = "print('Hello, World!')"
                ws1.send_json({
                    "type": "code_change",
                    "code": new_code
                })

                # Client 2 should receive the code change
                data = ws2.receive_json()
                assert data["type"] == "code_change"
                assert data["code"] == new_code

    def test_code_persists_in_session(self, client):
        """Test that code changes persist in the session"""
        response = client.post("/sessions")
        session_id = response.json()["session_id"]

        # Connect and send code change
        with client.websocket_connect(f"/ws/{session_id}") as ws1:
            ws1.receive_json()  # init
            ws1.receive_json()  # participants

            new_code = "def hello():\n    print('Hello')"
            ws1.send_json({
                "type": "code_change",
                "code": new_code
            })

        # Verify code is saved in session
        assert sessions[session_id]["code"] == new_code

        # New client should receive the updated code
        with client.websocket_connect(f"/ws/{session_id}") as ws2:
            data = ws2.receive_json()  # init
            assert data["type"] == "init"
            assert data["code"] == new_code

    def test_language_change_broadcast(self, client):
        """Test that language changes are broadcast to other clients"""
        response = client.post("/sessions")
        session_id = response.json()["session_id"]

        with client.websocket_connect(f"/ws/{session_id}") as ws1:
            ws1.receive_json()  # init
            ws1.receive_json()  # participants

            with client.websocket_connect(f"/ws/{session_id}") as ws2:
                ws2.receive_json()  # init
                ws2.receive_json()  # participants
                ws1.receive_json()  # participants update

                # Client 1 changes language
                ws1.send_json({
                    "type": "language_change",
                    "language": "javascript"
                })

                # Client 2 should receive the language change
                data = ws2.receive_json()
                assert data["type"] == "language_change"
                assert data["language"] == "javascript"

    def test_language_persists_in_session(self, client):
        """Test that language changes persist in the session"""
        response = client.post("/sessions")
        session_id = response.json()["session_id"]

        # Connect and change language
        with client.websocket_connect(f"/ws/{session_id}") as ws1:
            ws1.receive_json()  # init
            ws1.receive_json()  # participants

            ws1.send_json({
                "type": "language_change",
                "language": "javascript"
            })

        # Verify language is saved
        assert sessions[session_id]["language"] == "javascript"

        # New client should receive the updated language
        with client.websocket_connect(f"/ws/{session_id}") as ws2:
            data = ws2.receive_json()  # init
            assert data["language"] == "javascript"


class TestMultiClientCollaboration:
    """Test multiple clients collaborating simultaneously"""

    def test_three_clients_collaboration(self, client):
        """Test three clients can collaborate in real-time"""
        response = client.post("/sessions")
        session_id = response.json()["session_id"]

        with client.websocket_connect(f"/ws/{session_id}") as ws1:
            ws1.receive_json()  # init
            ws1.receive_json()  # participants (1)

            with client.websocket_connect(f"/ws/{session_id}") as ws2:
                ws2.receive_json()  # init
                ws2.receive_json()  # participants (2)
                ws1.receive_json()  # participants update

                with client.websocket_connect(f"/ws/{session_id}") as ws3:
                    ws3.receive_json()  # init
                    ws3.receive_json()  # participants (3)
                    ws1.receive_json()  # participants update
                    ws2.receive_json()  # participants update

                    # Client 1 sends code
                    ws1.send_json({
                        "type": "code_change",
                        "code": "// Client 1"
                    })

                    # Clients 2 and 3 should receive it
                    data2 = ws2.receive_json()
                    data3 = ws3.receive_json()
                    assert data2["code"] == "// Client 1"
                    assert data3["code"] == "// Client 1"

                    # Client 2 sends code
                    ws2.send_json({
                        "type": "code_change",
                        "code": "// Client 2"
                    })

                    # Clients 1 and 3 should receive it
                    data1 = ws1.receive_json()
                    data3 = ws3.receive_json()
                    assert data1["code"] == "// Client 2"
                    assert data3["code"] == "// Client 2"

    def test_rapid_code_changes(self, client):
        """Test handling rapid successive code changes"""
        response = client.post("/sessions")
        session_id = response.json()["session_id"]

        with client.websocket_connect(f"/ws/{session_id}") as ws1:
            ws1.receive_json()  # init
            ws1.receive_json()  # participants

            with client.websocket_connect(f"/ws/{session_id}") as ws2:
                ws2.receive_json()  # init
                ws2.receive_json()  # participants
                ws1.receive_json()  # participants update

                # Send rapid code changes
                for i in range(5):
                    ws1.send_json({
                        "type": "code_change",
                        "code": f"// Code change {i}"
                    })

                # Client 2 should receive all changes
                received_codes = []
                for _ in range(5):
                    data = ws2.receive_json()
                    assert data["type"] == "code_change"
                    received_codes.append(data["code"])

                # Last change should be persisted (last-write-wins)
                assert sessions[session_id]["code"] == "// Code change 4"


class TestEdgeCases:
    """Test edge cases and error handling"""

    def test_empty_code_change(self, client):
        """Test sending empty code"""
        response = client.post("/sessions")
        session_id = response.json()["session_id"]

        with client.websocket_connect(f"/ws/{session_id}") as ws1:
            ws1.receive_json()  # init
            ws1.receive_json()  # participants

            ws1.send_json({
                "type": "code_change",
                "code": ""
            })

        # Empty code should be saved
        assert sessions[session_id]["code"] == ""

    def test_large_code_payload(self, client):
        """Test sending large code payload"""
        response = client.post("/sessions")
        session_id = response.json()["session_id"]

        large_code = "# " + ("x" * 10000)  # 10KB of code

        with client.websocket_connect(f"/ws/{session_id}") as ws1:
            ws1.receive_json()  # init
            ws1.receive_json()  # participants

            ws1.send_json({
                "type": "code_change",
                "code": large_code
            })

        # Large code should be saved
        assert sessions[session_id]["code"] == large_code

    def test_unknown_message_type(self, client):
        """Test sending unknown message type doesn't crash"""
        response = client.post("/sessions")
        session_id = response.json()["session_id"]

        with client.websocket_connect(f"/ws/{session_id}") as ws1:
            ws1.receive_json()  # init
            ws1.receive_json()  # participants

            # Send unknown message type
            ws1.send_json({
                "type": "unknown_type",
                "data": "test"
            })

            # Connection should remain open
            # Send valid message to verify
            ws1.send_json({
                "type": "code_change",
                "code": "test"
            })

        assert sessions[session_id]["code"] == "test"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
