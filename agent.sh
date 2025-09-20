#!/bin/bash

# Stagehand Browser Agent Shell Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to show help
show_help() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║            Stagehand Browser Agent CLI                        ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Usage: ./agent.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  --run           Start the agent server with browser"
    echo "  --test          Send test command to running agent"
    echo "  --help          Show this help message"
    echo ""
    echo "Test Options:"
    echo "  -context <text> Optional context to add to the test"
    echo "  <instruction>   The instruction for the agent to execute"
    echo ""
    echo "Examples:"
    echo "  # Start the agent server"
    echo "  ./agent.sh --run"
    echo ""
    echo "  # Send test commands"
    echo "  ./agent.sh --test \"Click the Test Console button\""
    echo "  ./agent.sh --test -context \"Testing forms\" \"Fill the form\""
}

# Check if tsx is installed
if ! command -v tsx &> /dev/null; then
    echo -e "${RED}Error: tsx is not installed${NC}"
    echo "Please install tsx first:"
    echo "  npm install -g tsx"
    echo "  or"
    echo "  pnpm add -g tsx"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo -e "${YELLOW}Warning: node_modules not found${NC}"
    echo "Please run 'pnpm install' or 'npm install' first"
    exit 1
fi

# Load environment variables from .env if it exists
if [ -f "$SCRIPT_DIR/.env" ]; then
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

# Parse command
case "$1" in
    --run|-r)
        echo -e "${GREEN}🚀 Starting agent server...${NC}"
        echo -e "${BLUE}🖥️  Browser will open and stay visible${NC}"
        echo ""
        cd "$SCRIPT_DIR" && tsx agent-server.ts
        ;;
        
    --test|-t)
        shift # Remove --test from arguments
        cd "$SCRIPT_DIR" && tsx agent-client.ts "$@"
        ;;
        
    --help|-h|"")
        show_help
        ;;
        
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
