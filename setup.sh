#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    
    # Start Supabase
    print_status "Starting Supabase..."
    supabase start
    
    # Get the database URL and update .env
    if [ -f .env ]; then
        # Extract database URL from Supabase status
        db_url=$(supabase status | grep "DB URL" | awk '{print $3}')
        if [ ! -z "$db_url" ]; then
            if grep -q "^DATABASE_URL=" .env; then
                sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=${db_url}|" .env
            else
                echo "DATABASE_URL=${db_url}" >> .env
            fi
            print_success "Database URL updated in .env"
        fi
        
        # Extract Supabase keys and update .env
        anon_key=$(supabase status | grep "anon key" | awk '{print $3}')
        service_key=$(supabase status | grep "service_role key" | awk '{print $3}')
        
        if [ ! -z "$anon_key" ]; then
            if grep -q "^SUPABASE_ANON_KEY=" .env; then
                sed -i.bak "s|^SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=${anon_key}|" .env
            else
                echo "SUPABASE_ANON_KEY=${anon_key}" >> .env
            fi
        fi
        
        if [ ! -z "$service_key" ]; then
            if grep -q "^SUPABASE_SERVICE_ROLE_KEY=" .env; then
                sed -i.bak "s|^SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=${service_key}|" .env
            else
                echo "SUPABASE_SERVICE_ROLE_KEY=${service_key}" >> .env
            fi
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
    
    # Start Supabase in background
    print_status "Starting Supabase..."
    supabase start &
    SUPABASE_PID=$!
    
    # Wait a bit for Supabase to start
    sleep 5
    
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
        kill $SUPABASE_PID 2>/dev/null
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
    echo ""
    print_status "Press Ctrl+C to stop all services"
    
    # Wait for processes
    wait
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
            setup_supabase
            setup_database
            setup_nextjs
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
