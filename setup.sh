#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Embedding model for Ollama
EMBEDDING_MODEL="embeddinggemma:300m"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to prompt for API keys
prompt_api_keys() {
    print_status "Setting up API keys..."
    
    # Check if .env exists, if not copy from env.sample
    if [ ! -f .env ]; then
        print_status "Creating .env file from env.sample..."
        cp env.sample .env
    fi
    
    # Function to update .env file
    update_env() {
        local key=$1
        local value=$2
        if grep -q "^${key}=" .env; then
            sed -i.bak "s/^${key}=.*/${key}=${value}/" .env
        else
            echo "${key}=${value}" >> .env
        fi
    }
    
    # Check if CEREBRAS_API_KEY already exists and is not placeholder
    if grep -q "^CEREBRAS_API_KEY=" .env && ! grep -q "^CEREBRAS_API_KEY=your_cerebras_api_key_here" .env && ! grep -q "^CEREBRAS_API_KEY=$" .env; then
        print_success "Cerebras API key already configured"
    else
        # Prompt for Cerebras API key (securely)
        echo ""
        echo -e "${YELLOW}⚠️  Cerebras API key is required${NC}"
        echo -e "${BLUE}Please enter your CEREBRAS_API_KEY (input will be hidden):${NC}"
        read -rs cerebras_key
        if [ ! -z "$cerebras_key" ]; then
            update_env "CEREBRAS_API_KEY" "$cerebras_key"
            print_success "Cerebras API key set"
        else
            print_error "Cerebras API key is required. Please run setup again."
            exit 1
        fi
    fi
    
    # Ensure all required environment variables exist with placeholders
    # These will be updated with real values when Supabase starts
    if ! grep -q "^DATABASE_URL=" .env; then
        echo "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres" >> .env
    fi
    
    if ! grep -q "^SUPABASE_URL=" .env; then
        echo "SUPABASE_URL=http://127.0.0.1:54321" >> .env
    fi
    
    if ! grep -q "^SUPABASE_ANON_KEY=" .env; then
        echo "SUPABASE_ANON_KEY=your_supabase_anon_key_here" >> .env
    fi
    
    if ! grep -q "^SUPABASE_SERVICE_ROLE_KEY=" .env; then
        echo "SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here" >> .env
    fi
    
    # Clean up backup file
    rm -f .env.bak
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if command_exists pnpm; then
        pnpm install
    elif command_exists npm; then
        npm install
    elif command_exists yarn; then
        yarn install
    else
        print_error "No package manager found. Please install pnpm, npm, or yarn."
        exit 1
    fi
    
    print_success "Dependencies installed"
}

# Function to fix Supabase config issues
fix_supabase_config() {
    print_status "Checking Supabase configuration..."
    
    if [ -f "supabase/config.toml" ]; then
        # Check if network_restrictions section exists and comment it out
        if grep -q "^\[db.network_restrictions\]" supabase/config.toml; then
            print_status "Fixing Supabase config (commenting out unsupported network_restrictions)..."
            
            # Create a temporary file with the fixed config
            awk '
            /^\[db\.network_restrictions\]/ {
                in_section = 1
                print "# " $0
                next
            }
            /^\[/ && in_section {
                in_section = 0
            }
            in_section && /^[^#]/ {
                print "# " $0
                next
            }
            {print}
            ' supabase/config.toml > supabase/config.toml.tmp
            
            # Replace the original file
            mv supabase/config.toml.tmp supabase/config.toml
            print_success "Supabase config fixed"
        fi
    fi
}

# Function to setup Supabase
setup_supabase() {
    print_status "Setting up Supabase..."
    
    # Check if Supabase CLI is installed
    if ! command_exists supabase; then
        print_status "Installing Supabase CLI..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command_exists brew; then
                brew install supabase/tap/supabase
            else
                print_error "Please install Homebrew first: https://brew.sh/"
                exit 1
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            curl -fsSL https://supabase.com/install.sh | sh
        else
            print_error "Unsupported OS. Please install Supabase CLI manually: https://supabase.com/docs/guides/cli"
            exit 1
        fi
    fi
    
    # Initialize Supabase if not already done
    if [ ! -d "supabase" ]; then
        print_status "Initializing Supabase project..."
        supabase init
    fi
    
    # Fix config issues before starting
    fix_supabase_config
    
    # Stop any existing Supabase instances to avoid port conflicts
    print_status "Stopping any existing Supabase instances..."
    supabase stop 2>/dev/null || true
    
    # Start Supabase and capture output
    print_status "Starting Supabase..."
    SUPABASE_OUTPUT=$(supabase start 2>&1)
    
    # Display the output
    echo "$SUPABASE_OUTPUT"
    
    # Extract values from the output and update .env
    if [ -f .env ]; then
        # Extract API URL (for SUPABASE_URL)
        api_url=$(echo "$SUPABASE_OUTPUT" | grep "API URL:" | sed 's/.*API URL: *//')
        if [ ! -z "$api_url" ]; then
            if grep -q "^SUPABASE_URL=" .env; then
                sed -i.bak "s|^SUPABASE_URL=.*|SUPABASE_URL=${api_url}|" .env
            else
                echo "SUPABASE_URL=${api_url}" >> .env
            fi
            print_success "Supabase URL updated in .env"
        fi
        
        # Extract database URL
        db_url=$(echo "$SUPABASE_OUTPUT" | grep "DB URL:" | sed 's/.*DB URL: *//')
        if [ ! -z "$db_url" ]; then
            if grep -q "^DATABASE_URL=" .env; then
                sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=${db_url}|" .env
            else
                echo "DATABASE_URL=${db_url}" >> .env
            fi
            print_success "Database URL updated in .env"
        fi
        
        # Extract anon key
        anon_key=$(echo "$SUPABASE_OUTPUT" | grep "anon key:" | sed 's/.*anon key: *//')
        if [ ! -z "$anon_key" ]; then
            if grep -q "^SUPABASE_ANON_KEY=" .env; then
                sed -i.bak "s|^SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=${anon_key}|" .env
            else
                echo "SUPABASE_ANON_KEY=${anon_key}" >> .env
            fi
            print_success "Supabase anon key updated in .env"
        fi
        
        # Extract service role key
        service_key=$(echo "$SUPABASE_OUTPUT" | grep "service_role key:" | sed 's/.*service_role key: *//')
        if [ ! -z "$service_key" ]; then
            if grep -q "^SUPABASE_SERVICE_ROLE_KEY=" .env; then
                sed -i.bak "s|^SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=${service_key}|" .env
            else
                echo "SUPABASE_SERVICE_ROLE_KEY=${service_key}" >> .env
            fi
            print_success "Supabase service role key updated in .env"
        fi
        
        # Clean up backup file
        rm -f .env.bak
    fi
    
    print_success "Supabase setup complete"
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Generate Prisma client
    if command_exists pnpm; then
        pnpm db:generate
    else
        npx prisma generate
    fi
    
    # Push database schema
    if command_exists pnpm; then
        pnpm db:push
    else
        npx prisma db push
    fi
    
    print_success "Database setup complete"
}

# Function to create Next.js app if it doesn't exist
setup_nextjs() {
    if [ ! -d "next-app" ]; then
        print_status "Creating Next.js app..."
        
        if command_exists pnpm; then
            pnpm create next-app@latest next-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
        else
            npx create-next-app@latest next-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
        fi
        
        # Install dependencies for the Next.js app
        cd next-app
        if command_exists pnpm; then
            pnpm install
            pnpm add @prisma/client @supabase/supabase-js
        else
            npm install
            npm install @prisma/client @supabase/supabase-js
        fi
        cd ..
        
        print_success "Next.js app created"
    else
        print_status "Next.js app already exists"
        
        # Check if node_modules exists in next-app
        if [ ! -d "next-app/node_modules" ]; then
            print_status "Installing Next.js dependencies..."
            cd next-app
            if command_exists pnpm; then
                pnpm install
                pnpm add @prisma/client @supabase/supabase-js
            else
                npm install
                npm install @prisma/client @supabase/supabase-js
            fi
            cd ..
            print_success "Next.js dependencies installed"
        fi
    fi
}

# Function to start all services
start_services() {
    print_status "Starting all services..."
    
    # Fix config issues before starting
    fix_supabase_config
    
    # Stop any existing Supabase instances to avoid port conflicts
    print_status "Stopping any existing Supabase instances..."
    supabase stop 2>/dev/null || true
    
    # Start Supabase
    print_status "Starting Supabase..."
    supabase start
    
    # Wait a bit for Supabase to start
    sleep 5
    
    # Always ensure Ollama is running
    print_status "Checking Ollama service..."
    if ensure_ollama_running; then
        echo -e "${GREEN}✅ Ollama service is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Ollama service may not have started properly${NC}"
        echo "Please check if Ollama is installed and try running 'ollama serve' manually"
    fi
    
    # Pre-load embedding model for fast response
    if command -v ollama &> /dev/null; then
        print_status "Pre-loading embedding model ${EMBEDDING_MODEL}..."
        if echo "test" | ollama embed ${EMBEDDING_MODEL} > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Embedding model pre-loaded${NC}"
        else
            echo -e "${YELLOW}⚠️  Could not pre-load embedding model${NC}"
        fi
    fi
    
    # Start Next.js app in background
    print_status "Starting Next.js app..."
    cd next-app
    if command_exists pnpm; then
        pnpm dev &
    else
        npm run dev &
    fi
    NEXTJS_PID=$!
    cd ..
    
    # Function to cleanup on exit
    cleanup() {
        print_status "Shutting down services..."
        kill $NEXTJS_PID 2>/dev/null
        supabase stop
        exit 0
    }
    
    # Set up signal handlers
    trap cleanup SIGINT SIGTERM
    
    print_success "All services started!"
    echo ""
    print_status "Services running:"
    echo "  - Supabase Studio: http://localhost:54323"
    echo "  - Supabase API: http://localhost:54321"
    echo "  - Next.js App: http://localhost:3000"
    echo "  - Ollama API: http://localhost:11434"
    echo ""
    print_status "Press Ctrl+C to stop all services"
    
    # Wait for processes
    wait
}

# Helper function to ensure Ollama is running
ensure_ollama_running() {
    if ! curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
        echo -e "${YELLOW}Starting Ollama service...${NC}"
        if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "mingw"* ]] || [[ "$OSTYPE" == "cygwin" ]]; then
            # Windows - Use start to launch in new window
            start "Ollama" ollama serve &
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            ollama serve > /dev/null 2>&1 &
        else
            # Linux
            systemctl --user start ollama 2>/dev/null || ollama serve > /dev/null 2>&1 &
        fi
        
        # Wait for service to start (up to 10 seconds)
        local attempts=0
        while [ $attempts -lt 10 ]; do
            if curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
                return 0
            fi
            sleep 1
            ((attempts++))
        done
        
        return 1
    fi
    return 0
}

# Function to check and setup Ollama
check_and_setup_ollama() {
    echo -e "${BLUE}🦙 Checking Ollama setup...${NC}"
    
    # Check if Ollama is installed
    if ! command -v ollama &> /dev/null; then
        echo -e "${YELLOW}⚠️  Ollama is not installed${NC}"
        echo "Ollama is required for embedding generation."
        echo "Please install Ollama from: https://ollama.ai"
        return 1
    fi
    
    echo -e "${GREEN}✅ Ollama is installed${NC}"
    
    # Always ensure Ollama service is running
    if ensure_ollama_running; then
        echo -e "${GREEN}✅ Ollama service is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not start Ollama service${NC}"
        echo "You may need to start it manually: ollama serve"
        return 1
    fi
    
    # Check if embedding model is installed
    echo -e "${BLUE}Checking for embedding model: ${EMBEDDING_MODEL}${NC}"
    
    # Get list of installed models
    if ollama list | grep -q "${EMBEDDING_MODEL%%:*}"; then
        echo -e "${GREEN}✅ Embedding model ${EMBEDDING_MODEL} is installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Embedding model ${EMBEDDING_MODEL} is not installed${NC}"
        echo ""
        echo "This model is required for semantic search and embedding generation."
        echo "Model size: ~3-4GB (quantized version)"
        echo ""
        read -p "Would you like to install the embedding model now? (y/n) " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}Downloading embedding model...${NC}"
            echo "This may take a few minutes depending on your internet connection..."
            
            if ollama pull ${EMBEDDING_MODEL}; then
                echo -e "${GREEN}✅ Embedding model installed successfully${NC}"
            else
                echo -e "${RED}❌ Failed to install embedding model${NC}"
                echo "You can install it manually later with:"
                echo "  ollama pull ${EMBEDDING_MODEL}"
                return 1
            fi
        else
            echo -e "${YELLOW}⚠️  Skipping embedding model installation${NC}"
            echo "You can install it later with:"
            echo "  ollama pull ${EMBEDDING_MODEL}"
        fi
    fi
    
    # Pre-load the model for faster first-time use
    echo -e "${BLUE}Pre-loading embedding model...${NC}"
    echo "test" | ollama embed ${EMBEDDING_MODEL} > /dev/null 2>&1 && \
        echo -e "${GREEN}✅ Model pre-loaded and ready${NC}" || \
        echo -e "${YELLOW}⚠️  Could not pre-load model (will load on first use)${NC}"
    
    return 0
}

# Main function
main() {
    echo "🚀 Circular Project Setup"
    echo "========================="
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Parse command line arguments
    case "${1:-setup}" in
        "setup")
            prompt_api_keys
            install_dependencies
            
            # Ensure Ollama is running early in the setup process
            if command -v ollama &> /dev/null; then
                print_status "Ensuring Ollama service is running for setup..."
                ensure_ollama_running
            fi
            
            setup_supabase
            setup_database
            setup_nextjs
            check_and_setup_ollama
            print_success "Setup complete! Run './setup.sh start' to start all services"
            ;;
        "start")
            start_services
            ;;
        "stop")
            print_status "Stopping Supabase..."
            supabase stop
            print_success "Services stopped"
            ;;
        "reset")
            print_status "Resetting Supabase database..."
            supabase db reset
            setup_database
            print_success "Database reset complete"
            ;;
        "status")
            print_status "Checking service status..."
            supabase status
            ;;
        *)
            echo "Usage: $0 {setup|start|stop|reset|status}"
            echo ""
            echo "Commands:"
            echo "  setup  - Initial setup (install deps, configure API keys, setup Supabase)"
            echo "  start  - Start all services (Supabase + Next.js)"
            echo "  stop   - Stop all services"
            echo "  reset  - Reset database and re-run migrations"
            echo "  status - Show service status"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
