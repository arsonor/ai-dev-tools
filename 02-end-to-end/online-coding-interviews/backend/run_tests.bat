@echo off
REM Script to run integration tests for the collaborative coding platform (Windows)

echo Running Integration Tests
echo ================================
echo.

REM Check if uv is installed
uv --version >nul 2>&1
if errorlevel 1 (
    echo Error: uv is not installed
    echo Install uv with: pip install uv
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
uv pip install -r requirements.txt
echo.

REM Activate virtual environment
echo Activating virtual environment...
call .venv\Scripts\activate
echo.

REM Run the tests
echo Running tests...
echo.

pytest test_integration.py -v --tb=short

if errorlevel 1 (
    echo.
    echo X Some tests failed
    exit /b 1
) else (
    echo.
    echo All tests passed!
    exit /b 0
)
