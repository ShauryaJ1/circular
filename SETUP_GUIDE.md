# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Google Gemini API key (get one at https://aistudio.google.com/app/apikey)

## Step-by-Step Setup

### 1. Clone/Download this project
```bash
cd stagehand_with_browser_tools
```

### 2. Install all dependencies
```bash
pnpm install
```

### 3. Configure environment
Create a `.env` file in the root directory:
```env
CEREBRAS_API_KEY=your_actual_cerebras_api_key_here
```

### 4. Start the test app
Terminal 1:
```bash
pnpm dev:next
```
Wait for "Ready" message, then open http://localhost:3000 to verify

### 5. Run Stagehand examples
Terminal 2 (while Next.js is running):

**Basic browser monitoring:**
```bash
pnpm run:stagehand
```

**Agent autonomous execution:**
```bash
pnpm run:agent
```

## What's Happening?

### The Test App (Next.js)
- Running on http://localhost:3000
- Has forms for testing console logs, localStorage, cookies
- Includes working and intentionally broken API endpoints
- Uses tRPC for type-safe API calls

### Stagehand with Browser Tools
- Extends Stagehand with DevTools-like capabilities
- Monitors console logs, network requests, storage
- Can use natural language commands (`act`, `extract`, `observe`)
- Agent can perform complex tasks autonomously

### Browser Monitoring Features
- **Console Logs**: Captures all console.log, .warn, .error messages
- **Network**: Tracks all HTTP requests/responses
- **Storage**: Reads/writes localStorage, sessionStorage, cookies
- **Errors**: Captures page errors and failed requests

## Common Issues

### "Port 3000 already in use"
- Kill any process using port 3000
- Or change the port in next-app/package.json

### "CEREBRAS_API_KEY not found"
- Make sure `.env` file exists in root directory
- Verify the API key is valid

### Browser doesn't open
- The browser should open automatically with `headless: false`
- Make sure Chrome/Chromium is installed

### TypeScript errors
- Run `pnpm install` again
- Check that all dependencies are installed

## Next Steps

1. Explore the test app UI at http://localhost:3000
2. Watch the console output when running examples
3. Modify `example-usage.ts` to test your own scenarios
4. Check captured logs in the console output
5. Build your own automations using the StagehandWithBrowserTools class

## Tips

- Use `headless: false` to see what's happening
- Enable `devtools: true` for debugging
- Check the exported logs for detailed analysis
- The agent can handle complex multi-step tasks
- All Playwright methods work through `stagehand.page`
