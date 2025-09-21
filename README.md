# Circular

**The missing piece for AI-native IDEs: browser testing that actually works**

Circular extends Cursor and other AI-powered IDEs with intelligent browser testing capabilities, combining natural language commands with comprehensive DevTools monitoring and learning from past solutions.

---

## 🎯 Inspiration  

Circular works as an extension for AI-native IDEs, offering an agentic approach to browser testing that combines the simplicity of natural language commands with the depth of DevTools monitoring. The inspiration for this project came from two of our team members, who had written over 300,000 lines of "vibe coding" while working at a startup this summer. They experienced firsthand the limitations of Cursor, particularly that it couldn't actually test the code it generated.  

## 💡 What it does  

Circular solves Cursor's primary flaw: **it can't verify if its code works**. Our agent runs tests in the browser, monitors DevTools for issues, and learns from past solutions to solve similar bugs more efficiently. This makes Cursor's vibe coding workflow more robust by adding actual validation and memory of prior fixes. As this is integrated into AI-Native IDEs like Cursor through editing the Cursor rules, Circular's testing provides an additional layer of quality assurance and greatly streamlines the debugging process

**Key Features:**
- 🤖 **Natural Language Testing** - "Click the login button and verify it works"
- 🔍 **DevTools Monitoring** - Captures console logs, network requests, storage changes
- 🧠 **Learning Memory** - Matches current problems against historical fixes
- ⚡ **Real-time Feedback** - Integrates directly with your IDE workflow
- 📊 **Comprehensive Logging** - Full observability of browser automation
- 🖥️ **Web Dashboard** - Beautiful Next.js interface to view all test logs, runs, and solutions in real-time

## 🛠️ How we built it  

We built our agent using **Stagehand** (built on Playwright) to automate browser interactions. Alongside this, we created a **Next.js + pgVector + Supabase** web app to store logs of past issues and their resolutions, enabling the agent to match current problems against historical fixes. 

### Tech Stack:
- **🎭 Browser Automation**: Stagehand + Playwright for natural language browser control
- **🧠 LLMs**: Cerebras API and open-source models for intelligent test generation
- **🔗 Embeddings**: Local Ollama server (embedding-gemma) for efficient similarity matching
- **💾 Database**: PostgreSQL with pgVector for semantic search capabilities
- **🖥️ Frontend**: Next.js dashboard for real-time monitoring and management
- **🔌 Integration**: Direct Cursor integration with custom rules and context

## 🚧 Challenges we ran into  

- **Model Selection**: Choosing models small enough to run locally without sacrificing performance (embedding-gemma at ~600MB vs. Qwen3 embeddings at ~8GB)
- **IDE Integration**: Defining Cursor rules so our extension could provide the right testing context
- **DevTools Access**: Figuring out how to give Stagehand access to DevTools and formatting error outputs so Cursor could understand them
- **Performance**: Waiting for the agent to fully interact with the created project was slower than ideal

## 🏆 Accomplishments that we're proud of  

We're proud to have built a product that **meaningfully improves on Cursor**, one of the most popular AI coding tools today. Circular integrates seamlessly into Cursor, enhances its capabilities, and has the potential to revolutionize coding workflows by bridging the gap between vibe coding and validation.  

## 📚 What we learned  

- How to build browser agents with Stagehand and Playwright
- How to serve and use local models with Ollama  
- How to design embedding-based retrieval for problem–solution matching
- How critical context management is when working with AI-native IDEs

## 🚀 What's next for Circular  

- **⚡ Performance**: Improved speed and efficiency
- **🎤 Voice Testing**: Support for voice-based model testing  
- **📁 File Formats**: Support for testing the upload of more file formats
- **🏠 Local Models**: Running the browser agent fully on local models
- **🌍 Accessibility**: Expanding access so that every coder can use it

## 🖥️ Web Dashboard

Circular includes a comprehensive **Next.js dashboard** that provides real-time visibility into all your browser automation activities:

### Dashboard Features:
- **📊 Overview Dashboard** - System statistics, recent runs, and activity summaries
- **📝 Logs Viewer** - Detailed log entries with filtering, search, and expandable details
- **🏃 Test Runs** - History of all test executions with status, duration, and metadata
- **💡 Solutions Database** - Knowledge base of past issues and their resolutions
- **🔍 Semantic Search** - Find similar issues using AI-powered embeddings
- **📱 Responsive Design** - Works on desktop, tablet, and mobile devices

### Dashboard Pages:
- **`/`** - Main dashboard with system overview and recent activity
- **`/logs`** - Comprehensive log viewer with advanced filtering
- **`/runs`** - Test execution history and performance metrics  
- **`/solutions`** - Searchable knowledge base of solved problems

The dashboard updates in real-time as your agent runs tests, providing immediate feedback on what's happening in the browser and storing all results for future reference.

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- API key from one of the supported providers
- Supabase account (for database and embeddings)

### 1. Database Setup (Supabase)

Circular uses **PostgreSQL with pgVector** for storing logs and semantic search. You can use Supabase (recommended) or your own PostgreSQL instance.

#### Option A: Supabase (Recommended)

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the project to be fully provisioned

2. **Enable Required Extensions**:
   ```sql
   -- Run these in the Supabase SQL Editor
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";  
   CREATE EXTENSION IF NOT EXISTS "vector";
   ```

3. **Get Your Database URL**:
   - Go to Project Settings → Database
   - Copy the connection string under "Connection pooling"
   - It should look like: `postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true`

#### Option B: Local PostgreSQL

1. **Install PostgreSQL** with pgVector extension
2. **Create Database** and enable extensions:
   ```sql
   CREATE DATABASE circular;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   CREATE EXTENSION IF NOT EXISTS "vector";
   ```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Set up Environment Variables
Copy `env.sample` to `.env` and configure your environment:
```bash
cp env.sample .env
# Then edit .env with the following:
```

**Required Environment Variables:**
```bash
# Database (from Supabase or your PostgreSQL instance)
DATABASE_URL="postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true"

# AI Provider (choose one)
ANTHROPIC_API_KEY="your_key_here"     # Recommended
OPENAI_API_KEY="your_key_here"        # Alternative
CEREBRAS_API_KEY="your_key_here"      # Fast & cost-effective

# Optional: Embeddings service (if using local Ollama)
OLLAMA_BASE_URL="http://localhost:11434"
```

### 4. Initialize Database
Run Prisma migrations to set up the database schema:
```bash
pnpm db:push
```

### 5. (Optional) Set up Local Embeddings with Ollama

For enhanced privacy and performance, you can run embeddings locally using Ollama:

1. **Install Ollama**:
   - Download from [ollama.ai](https://ollama.ai)
   - Or install via package manager

2. **Pull the Embedding Model**:
   ```bash
   ollama pull embedding-gemma
   ```

3. **Start Ollama Service**:
   ```bash
   ollama serve
   ```
   
   This will start the service on `http://localhost:11434` (already configured in your `.env`)

**Note**: If you skip this step, the system will work without local embeddings but won't have semantic search capabilities for the knowledge base.

### 6. Verify Setup
Test that everything is configured correctly:
```bash
pnpm test:setup
```

### 7. Start the System

**Terminal 1: Start the Dashboard**
```bash
pnpm dev:next
```
Dashboard available at http://localhost:3000

**🖥️ Dashboard Access:**
- **Main Dashboard**: http://localhost:3000 - Overview and system stats
- **Logs Viewer**: http://localhost:3000/logs - Detailed test logs with search/filter
- **Test Runs**: http://localhost:3000/runs - Execution history and performance
- **Solutions**: http://localhost:3000/solutions - Knowledge base of solved issues

**Terminal 2: Start the Agent Server**
```bash
./agent.sh --run        # Unix/Mac
agent.bat --run         # Windows
```

**Terminal 3: Send Test Commands**
```bash
# Simple test
./agent.sh --test "Click the login button and verify it works"

# Test with context
./agent.sh --test -context "Testing user registration flow" "Fill out the signup form with test data and submit"
```

## 🎮 Usage Examples

### Basic Browser Testing
```bash
# Test form interactions
./agent.sh --test "Fill out the contact form and submit"

# Test navigation
./agent.sh --test "Navigate to the dashboard and verify all widgets load"

# Test error handling
./agent.sh --test "Try to submit an empty form and verify error messages appear"
```

### Advanced Testing with Context
```bash
# E-commerce testing
./agent.sh --test -context "Testing checkout flow on e-commerce site" "Add item to cart, proceed to checkout, and verify total calculation"

# API testing
./agent.sh --test -context "Testing API integration" "Submit form and verify the API response is displayed correctly"
```

### Knowledge System
```bash
# Store solutions for future reference
./agent.sh --store --issue "Login form validation not working" --solution "Added proper email regex validation" --tags login validation frontend

# Search for similar issues
./agent.sh --retrieve --input "form validation errors"
./agent.sh --retrieve --tags frontend validation
```

## 📊 Project Structure

```
circular/
├── src/
│   ├── agent/                   # Core agent system
│   │   ├── agent-server.ts     # Main agent server
│   │   ├── stagehand-browser-tools.ts # Extended browser automation
│   │   └── config.ts           # Multi-provider AI configuration
│   ├── examples/               # Usage examples
│   ├── tests/                  # Test suite
│   └── utils/                  # Utility functions
├── frontend/                   # Next.js dashboard
├── demo-apps/                  # Test applications
├── lib/                        # Shared libraries
├── prisma/                     # Database schema
└── agent.sh / agent.bat        # CLI scripts
```

## 🤝 Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation, every contribution helps make Circular better for the entire AI coding community.

## 📄 License

ISC License - see LICENSE file for details.

---

**Built with ❤️ for the AI coding community**
