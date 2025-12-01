#!/bin/bash
# Script to run integration tests for the collaborative coding platform

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Running Integration Tests${NC}"
echo "================================"
echo ""

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo -e "${RED}Error: uv is not installed${NC}"
    echo "Install uv with: pip install uv"
    exit 1
fi

# Install dependencies if needed
echo -e "${BLUE}Installing dependencies...${NC}"
uv pip install -r requirements.txt
echo ""

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source .venv/bin/activate

# Run the tests
echo -e "${GREEN}Running tests...${NC}"
echo ""

pytest test_integration.py -v --tb=short

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All tests passed!${NC}"
else
    echo ""
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
