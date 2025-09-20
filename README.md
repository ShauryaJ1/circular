# Stagehand with Browser Tools

A powerful browser automation setup that extends [Stagehand](https://docs.stagehand.dev/) with DevTools-like capabilities for monitoring console logs, network requests, localStorage, cookies, and more.

## Features

### Browser Monitoring Tools
- **Console Logs**: Capture all browser console messages (log, info, warn, error)
- **Network Monitoring**: Track all HTTP requests and responses with payloads
- **Storage Access**: Read/write localStorage, sessionStorage, and cookies
- **Error Tracking**: Capture page errors and failed network requests
- **Export Logs**: Export all captured data as JSON for analysis

### Test Next.js App
Includes a full-featured Next.js app with tRPC for testing:
- Multiple forms for testing console logs, storage, and cookies
- Working tRPC endpoints for successful API calls
- Intentionally broken endpoints for error testing
- Beautiful modern UI with Tailwind CSS

## Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set up Environment Variables
Copy `env.sample` to `.env` and add your API key:
```bash
cp env.sample .env
# Then edit .env with your API key (choose one):
```

**Cerebras** (powerful and cost-effective)
- Get your API key from: https://console.cerebras.net/
- Set `CEREBRAS_API_KEY=your_key_here`

### 3. Verify Setup (Optional)
Test that everything is configured correctly:
```bash
pnpm test:setup
```
This will verify your API key and browser automation setup.

### 4. Start the Next.js Test App
In one terminal:
```bash
pnpm dev:next
```
The app will be available at http://localhost:3000

### 5. Run Stagehand with Browser Tools
In another terminal:

**Flexible Examples** (auto-detect provider from .env):
```bash
# Basic example - works with any provider
pnpm run:flexible

# Agent example - works with any provider
pnpm run:agent-flexible
```

**Provider-Specific Examples** (if you've modified them):
```bash
# Anthropic Claude examples
pnpm run:stagehand     # Uses Claude for basic automation
pnpm run:agent         # Uses Claude agent

# Note: Update these files to use Gemini if needed
```

## 🎮 Agent Server System (NEW!)

The agent can now run as a server that accepts test commands via CLI:

### Prerequisites
- **tsx installed globally**: `npm install -g tsx`
- **Dependencies installed**: `pnpm install`
- **.env configured**: with your API keys

### Quick Start
```bash
# Terminal 1: Start Next.js app
pnpm dev:next

# Terminal 2: Start agent server
./agent.sh --run        # Unix/Mac
agent.bat --run         # Windows

# Terminal 3: Send test commands
./agent.sh --test "Click the Test Console button"              # Unix/Mac
./agent.sh --test -context "Testing forms" "Fill the form"     # Unix/Mac

agent.bat --test "Click the Test Console button"               # Windows
agent.bat --test -context "Testing forms" "Fill the form"      # Windows
```

### Commands

#### Start Agent Server
```bash
# Unix/Mac/Linux
./agent.sh --run

# Windows
agent.bat --run
```

#### Send Test Commands
```bash
# Simple test (Unix/Mac)
./agent.sh --test "Click on the login button"

# Simple test (Windows)
agent.bat --test "Click on the login button"

# Test with context (Unix/Mac)
./agent.sh --test -context "User is on homepage" "Navigate to settings"

# Test with context (Windows)
agent.bat --test -context "User is on homepage" "Navigate to settings"
```

### Features
- ✅ **Visible browser window** - stays open and maximized
- ✅ Agent runs as persistent server
- ✅ Page refreshes before each test
- ✅ Context is added to system prompt
- ✅ Failed requests automatically saved to files
- ✅ Real-time browser monitoring with DevTools

## Usage

### Basic Example
```typescript
import { StagehandWithBrowserTools } from './stagehand-browser-tools';

// Option 1: Google Gemini
const stagehand = new StagehandWithBrowserTools({
  env: 'LOCAL',
  localBrowserLaunchOptions: {
    headless: false,
    devtools: true,
  },
  modelName: 'google/gemini-2.5-flash',
  modelClientOptions: {
    apiKey: process.env.CEREBRAS_API_KEY,
  },
});

// Option 2: Anthropic Claude
const stagehand = new StagehandWithBrowserTools({
  env: 'LOCAL',
  localBrowserLaunchOptions: {
    headless: false,
    devtools: true,
  },
  modelName: 'claude-sonnet-4-20250514',
  modelClientOptions: {
    apiKey: process.env.CEREBRAS_API_KEY,
  },
});

// Initialize and start monitoring
await stagehand.init();
await stagehand.startMonitoring();

// Navigate to your app
await stagehand.page.goto('http://localhost:3000');

// Use Stagehand's natural language actions
await stagehand.act('Click on the "Test Console" button');

// Get captured logs
const consoleLogs = stagehand.getConsoleLogs();
const networkLogs = stagehand.getNetworkLogs();
const storageData = await stagehand.getStorageData();
```

### Using with Agent (Autonomous Execution)
```typescript
// Option 1: Google Gemini Agent
const agent = stagehand.agent({
  provider: 'google',
  model: 'gemini-2.5-flash',
  options: {
    apiKey: process.env.CEREBRAS_API_KEY,
  }
});

// Option 2: Anthropic Claude Agent (more powerful)
const agent = stagehand.agent({
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  options: {
    apiKey: process.env.CEREBRAS_API_KEY,
  }
});

// Execute complex tasks autonomously
await agent.execute({
  instruction: "Fill out the form with test data and submit it",
  maxSteps: 10
});

// Monitor what the agent did
const logs = stagehand.getNetworkLogs();
const consoleLogs = stagehand.getConsoleLogs();
```

### Available Methods

#### Monitoring
- `startMonitoring()` - Start capturing browser events
- `clearLogs()` - Clear all captured logs

#### Console Logs
- `getConsoleLogs(type?)` - Get console logs, optionally filtered by type
- `waitForConsoleLog(pattern, timeout?)` - Wait for specific console message

#### Network
- `getNetworkLogs(filter?)` - Get network logs with optional filtering
- `getFailedRequests()` - Get all failed network requests (status >= 400)
- `waitForNetworkRequest(urlPattern, timeout?)` - Wait for specific request

#### Storage
- `getStorageData()` - Get all localStorage, sessionStorage, and cookies
- `setLocalStorageItem(key, value)` - Set localStorage item
- `setCookie(cookie)` - Set a cookie

#### Export
- `exportLogs()` - Export all logs as JSON string

### Saving Failed Requests to File

All examples now automatically save failed requests to timestamped text files:

```typescript
import { saveFailedRequestsToFile } from './save-failed-requests';

const failedRequests = stagehand.getFailedRequests();
if (failedRequests.length > 0) {
  const filepath = saveFailedRequestsToFile(failedRequests);
  console.log(`Failed requests saved to: ${filepath}`);
}
```

The output file includes:
- Full URL and status codes
- Request/response headers
- Request/response bodies
- Timestamps for each failed request

Test this feature:
```bash
pnpm test:failed-requests
```

## Project Structure

```
stagehand_with_browser_tools/
├── stagehand-browser-tools.ts  # Extended Stagehand class with browser tools
├── config.ts                    # Configuration helper for provider switching
│
├── Agent System (NEW!)
│   ├── agent.ts                # Main CLI entry point
│   ├── agent-server.ts         # Agent server that runs browser
│   ├── agent-client.ts         # Client for sending test commands
│   ├── agent.sh                # Unix/Mac shell script
│   └── agent.bat               # Windows batch script
│
├── Examples
│   ├── example-usage.ts        # Basic example
│   ├── example-agent-usage.ts   # Agent example
│   ├── example-usage-flexible.ts # Auto-detect provider
│   └── example-agent-flexible.ts # Auto-detect provider agent
│
├── Testing
│   ├── test-setup.ts           # Setup verification
│   ├── test-failed-requests.ts  # Test failed request capture
│   └── test-agent-system.sh    # Test the agent system
│
├── next-app/                    # Test Next.js application
│   ├── src/
│   │   ├── app/                # Next.js app router pages
│   │   ├── server/             # tRPC server setup
│   │   ├── components/         # React components
│   │   └── utils/              # Utility functions
│   └── ...
│
├── Utilities
│   └── save-failed-requests.ts  # Failed request file saver
│
├── package.json                 # Project dependencies and scripts
├── env.sample                   # Environment variables template
└── README.md                    # This file
```

## Test Scenarios

The Next.js test app includes:

1. **Console Testing** - Generate various console messages
2. **Storage Testing** - Set/get localStorage and sessionStorage
3. **Cookie Testing** - Set and read cookies
4. **Form Submission** - Test form data with tRPC mutation
5. **API Calls** - Test successful tRPC queries
6. **Error Handling** - Test broken endpoints and 404s
7. **Network Monitoring** - Track all API requests/responses

## Tips

1. **Use DevTools**: Run with `headless: false` and `devtools: true` to see the browser
2. **Parallel Terminals**: Keep Next.js running in one terminal, Stagehand in another
3. **Check Logs**: The console will show real-time capture of browser events
4. **Export Data**: Use `exportLogs()` to save all captured data for analysis

## Troubleshooting

- **Port 3000 in use**: Make sure no other app is using port 3000
- **API Key not working**: Verify your Gemini API key is valid
- **Browser not opening**: Check if Chrome/Chromium is installed
- **tRPC errors**: Ensure the Next.js app is running before Stagehand

## License

ISC
