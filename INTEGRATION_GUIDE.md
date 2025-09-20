# Circular - Integrated Browser Automation & Monitoring System

A complete integration of Stagehand browser automation with a modern Next.js frontend for real-time monitoring, logging, and test management.

## 🏗️ System Architecture

```
┌─────────────────┐    WebSocket    ┌──────────────────┐
│   Frontend      │◄──────────────►│   Backend        │
│   (Next.js)     │                 │   (Node.js)      │
├─────────────────┤                 ├──────────────────┤
│ • Dashboard     │                 │ • Stagehand      │
│ • Log Viewer    │                 │ • Browser Tools  │
│ • Run Monitor   │                 │ • WebSocket API  │
│ • Solutions     │                 │ • Real-time Data │
└─────────────────┘                 └──────────────────┘
                                              │
                                    ┌──────────────────┐
                                    │   Browser        │
                                    │   (Playwright)   │
                                    ├──────────────────┤
                                    │ • Console Logs   │
                                    │ • Network Req    │
                                    │ • Storage Data   │
                                    │ • Automation     │
                                    └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- API key (see [config.ts](./config.ts) for supported providers)

### 1. Install Dependencies
```bash
pnpm install
cd frontend && pnpm install
```

### 2. Configure Environment
```bash
cp env.sample .env
# Edit .env with your API key
```

### 3. Start the System

**Option A: Separate Terminals (Recommended for Development)**
```bash
# Terminal 1: Start Frontend
pnpm dev:frontend

# Terminal 2: Start Backend
pnpm dev:backend
```

**Option B: Integrated Start**
```bash
pnpm start:integrated
```

### 4. Access the System
- **Frontend Dashboard**: http://localhost:3000
- **Backend WebSocket**: ws://localhost:8080

## 📊 Features

### Frontend (Next.js)
- **Dashboard**: Real-time stats and recent activity
- **Enhanced Log Viewer**: Advanced filtering, search, and issue tracking
- **Run Management**: View and monitor test runs
- **Solutions Library**: Browse and manage automation solutions
- **Real-time Updates**: WebSocket integration for live data

### Backend (Stagehand + WebSocket)
- **Browser Automation**: Powered by Stagehand and Playwright
- **Real-time Monitoring**: Console logs, network requests, storage
- **WebSocket API**: Live communication with frontend
- **Failed Request Tracking**: Automatic capture and analysis
- **Export Capabilities**: JSON export of all captured data

## 🔧 Integration Points

### Data Flow
1. **Browser Events** → Stagehand captures console/network/storage
2. **Backend Processing** → Events processed and forwarded via WebSocket
3. **Frontend Updates** → Real-time UI updates and data visualization
4. **User Commands** → Frontend sends commands to backend via WebSocket

### Key Components

#### Backend Integration (`frontend-server.ts`)
```typescript
// Start integrated backend server
const server = new FrontendServer();
await server.start(8080);

// Real-time event forwarding
server.broadcast({
  type: 'console_log',
  payload: logData
});
```

#### Frontend Data Service (`data-service.ts`)
```typescript
// Connect to backend
await dataService.connect('ws://localhost:8080');

// Listen for real-time updates
dataService.on('console_log', (log) => {
  // Update UI with new log
});

// Send commands to backend
await dataService.startRun(taskId, instruction);
```

#### Shared Types (`types/index.ts`)
- Consistent data structures between frontend and backend
- TypeScript interfaces for all entities (Tasks, Runs, Logs, Solutions)
- Real-time event types and WebSocket message formats

## 📁 Project Structure

```
circular/
├── frontend/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── components/         # React components
│   │   │   ├── layout/         # Layout components
│   │   │   ├── logs/           # Log viewing components
│   │   │   ├── runs/           # Run management
│   │   │   └── ui/             # Reusable UI components
│   │   ├── lib/                # Utilities and services
│   │   └── types/              # TypeScript definitions
│   └── package.json
│
├── backend/                     # Backend Integration
│   ├── frontend-server.ts      # WebSocket server
│   ├── stagehand-browser-tools.ts # Extended Stagehand
│   └── config.ts               # Provider configuration
│
├── examples/                    # Usage examples
│   ├── example-usage-flexible.ts
│   └── example-agent-flexible.ts
│
└── package.json                # Root dependencies
```

## 🎮 Usage Examples

### Start a Test Run
```typescript
// From frontend
await dataService.startRun('task-1', 'Click the login button and fill the form');

// Backend receives and executes
await stagehand.act('Click the login button and fill the form');
```

### Monitor Real-time Logs
```typescript
// Frontend listens for browser events
dataService.on('console_log', (log) => {
  console.log(`[${log.level}] ${log.message}`);
});

dataService.on('network_request', (request) => {
  console.log(`${request.method} ${request.url}`);
});
```

### Export Captured Data
```typescript
// Request data export
const logs = await dataService.exportLogs();

// Backend returns complete log history
const exportData = {
  consoleLogs: [...],
  networkLogs: [...],
  timestamp: '2024-01-15T10:30:00Z'
};
```

## 🔄 Real-time Communication

### WebSocket Message Types

**Backend → Frontend:**
```typescript
{
  type: 'console_log',
  payload: BrowserLog
}

{
  type: 'network_request',
  payload: NetworkLog
}

{
  type: 'run_completed',
  payload: { taskId, instruction, endTime }
}
```

**Frontend → Backend:**
```typescript
{
  type: 'command',
  command: 'start_run',
  params: { taskId, instruction }
}

{
  type: 'command',
  command: 'navigate',
  params: { url: 'https://example.com' }
}
```

## 🧪 Testing

### Test the Integration
```bash
# Start both frontend and backend
pnpm dev:frontend  # Terminal 1
pnpm dev:backend   # Terminal 2

# Open browser to http://localhost:3000
# Click around the dashboard to see real-time updates
```

### Example Test Scenarios
1. **Dashboard Monitoring**: View real-time stats and activity
2. **Log Filtering**: Use advanced filters in the log viewer
3. **Run Tracking**: Start/stop test runs and monitor progress
4. **Solution Management**: Browse and apply automation solutions

## 🐛 Troubleshooting

### Common Issues

**Frontend not connecting to backend:**
- Ensure backend is running on port 8080
- Check WebSocket connection in browser dev tools
- Verify no firewall blocking local connections

**Browser not opening:**
- Check if Chrome/Chromium is installed
- Verify Playwright dependencies: `npx playwright install`

**API key errors:**
- Ensure `.env` file exists with valid API key
- Check supported providers in `config.ts`

**Type errors:**
- Run `pnpm install` in both root and frontend directories
- Ensure TypeScript versions are compatible

## 📈 Performance

### Optimization Tips
- Use `headless: true` for production runs
- Limit real-time log retention to prevent memory issues
- Implement log rotation for long-running sessions
- Use WebSocket compression for large data transfers

### Monitoring
- Backend logs connection status and errors
- Frontend shows connection status in UI
- Failed requests automatically saved to files
- Export logs regularly for analysis

## 🔒 Security

### Best Practices
- API keys stored in environment variables only
- WebSocket connections limited to localhost by default
- No sensitive data logged in browser console
- Regular dependency updates for security patches

## 📚 API Reference

### DataService Methods
```typescript
// Connection management
await dataService.connect(url)
dataService.disconnect()

// Command execution
await dataService.startRun(taskId, instruction)
await dataService.stopRun(runId)
await dataService.clearLogs()
await dataService.exportLogs()

// Event handling
dataService.on(event, callback)
dataService.once(event, callback)
dataService.off(event, callback)
```

### FrontendServer Methods
```typescript
// Server lifecycle
await server.start(port)
await server.stop()

// Broadcasting
server.broadcast(message)

// Stagehand integration
await server.initializeStagehand()
server.setupStagehandListeners()
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the integration thoroughly
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details.
