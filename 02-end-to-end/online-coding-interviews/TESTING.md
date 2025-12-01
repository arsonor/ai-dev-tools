# Testing Guide

This document explains how to run the integration tests for the collaborative coding interview platform.

## Test Coverage

The integration tests verify the complete interaction between client and server, including:

- **Session Management**: Creating and retrieving sessions
- **WebSocket Connections**: Establishing and managing real-time connections
- **Code Synchronization**: Real-time code changes across multiple clients
- **Language Changes**: Broadcasting language selection to all participants
- **Multi-Client Collaboration**: Multiple users editing code simultaneously
- **Participant Tracking**: Counting active participants in sessions
- **Edge Cases**: Handling empty code, large payloads, and rapid changes

## Test File Structure

```
backend/test_integration.py
├── TestSessionManagement      # Session creation and retrieval
├── TestWebSocketConnection    # WebSocket connections
├── TestCodeSynchronization    # Real-time code sync
├── TestMultiClientCollaboration  # Multiple clients
└── TestEdgeCases             # Error handling and edge cases
```

## Running the Tests

### Prerequisites

1. Make sure you're in the backend directory:
   ```bash
   cd backend
   ```

2. Install test dependencies:
   ```bash
   # Using requirements.txt
   uv pip install -r requirements.txt

   # OR using pyproject.toml with test extras
   uv pip install -e ".[test]"
   ```

### Run All Tests

**Recommended approach:**
```bash
# Activate virtual environment
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux

# Run tests
pytest test_integration.py
```

**Or using uv without activating venv:**
```bash
uv run --no-project pytest test_integration.py
```

### Run Specific Test Classes

```bash
# Test only session management
pytest test_integration.py::TestSessionManagement

# Test only WebSocket connections
pytest test_integration.py::TestWebSocketConnection

# Test only code synchronization
pytest test_integration.py::TestCodeSynchronization
```

### Run Specific Test Functions

```bash
# Test a specific function
pytest test_integration.py::TestSessionManagement::test_create_session

# Test multiple clients collaboration
pytest test_integration.py::TestMultiClientCollaboration::test_three_clients_collaboration
```

### Run with Verbose Output

```bash
pytest test_integration.py -v
```

### Run with Coverage Report

```bash
# Install coverage first
uv pip install pytest-cov

# Run with coverage
pytest test_integration.py --cov=main --cov-report=html

# Open coverage report
# Windows: start htmlcov\index.html
# Mac/Linux: open htmlcov/index.html
```

### Run Tests with Output

```bash
# Show print statements
pytest test_integration.py -s

# Show both verbose and output
pytest test_integration.py -v -s
```

## Understanding Test Results

### Successful Test Run
```
test_integration.py::TestSessionManagement::test_create_session PASSED
test_integration.py::TestSessionManagement::test_get_existing_session PASSED
test_integration.py::TestWebSocketConnection::test_websocket_connect_to_valid_session PASSED
...
========================= 17 passed in 2.34s =========================
```

### Failed Test
```
test_integration.py::TestSessionManagement::test_create_session FAILED

FAILED test_integration.py::TestSessionManagement::test_create_session
AssertionError: assert 200 == 201
```

## Test Details

### Session Management Tests (4 tests)
- ✅ Create new session
- ✅ Retrieve existing session
- ✅ Handle non-existent session (404)
- ✅ Create multiple unique sessions

### WebSocket Connection Tests (4 tests)
- ✅ Connect to valid session
- ✅ Reject connection to invalid session
- ✅ Multiple clients connect to same session
- ✅ Participant count updates on disconnect

### Code Synchronization Tests (4 tests)
- ✅ Broadcast code changes to all clients
- ✅ Persist code in session storage
- ✅ Broadcast language changes to all clients
- ✅ Persist language in session storage

### Multi-Client Collaboration Tests (2 tests)
- ✅ Three clients collaborating simultaneously
- ✅ Handle rapid successive code changes

### Edge Cases Tests (3 tests)
- ✅ Handle empty code
- ✅ Handle large code payloads (10KB+)
- ✅ Ignore unknown message types

## Troubleshooting

### Import Errors
```
ModuleNotFoundError: No module named 'pytest'
```
**Solution**: Install test dependencies with `uv pip install -r requirements.txt`

### WebSocket Connection Failures
```
Error: WebSocket connection failed
```
**Solution**: Make sure no other instance of the server is running on port 8000

### Fixture Errors
```
fixture 'client' not found
```
**Solution**: Ensure pytest is discovering the test file correctly. Run from the backend directory.

### Asyncio Errors
```
RuntimeError: Event loop is closed
```
**Solution**: Make sure `pytest-asyncio>=0.21.0` is installed

## Continuous Integration

To run tests in CI/CD pipeline:

```bash
# Install dependencies
uv pip install -r requirements.txt

# Activate virtual environment
source .venv/bin/activate  # Mac/Linux
# .venv\Scripts\activate  # Windows

# Run tests with JUnit XML output
pytest test_integration.py --junit-xml=test-results.xml

# Or run with coverage for CI
pytest test_integration.py --cov=main --cov-report=xml
```

## Writing New Tests

To add new integration tests:

1. Add test methods to existing test classes or create new classes
2. Use the `client` fixture for HTTP/WebSocket testing
3. Use the `clear_sessions` fixture to ensure clean state
4. Follow naming convention: `test_<description>`
5. Add docstrings to explain what the test validates

Example:
```python
class TestNewFeature:
    def test_my_new_feature(self, client):
        """Test description here"""
        response = client.post("/new-endpoint")
        assert response.status_code == 200
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `pytest test_integration.py` | Run all tests |
| `pytest test_integration.py -v` | Verbose output |
| `pytest test_integration.py -k "session"` | Run tests matching "session" |
| `pytest test_integration.py --lf` | Run last failed tests |
| `pytest test_integration.py --tb=short` | Short traceback format |
| `pytest test_integration.py -x` | Stop on first failure |

**Note:** Make sure to activate the virtual environment first (`.venv\Scripts\activate` on Windows or `source .venv/bin/activate` on Mac/Linux)

## Expected Test Duration

All 17 integration tests should complete in approximately **2-5 seconds** on a modern machine.
