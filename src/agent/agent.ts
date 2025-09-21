#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';

/**
 * Main agent CLI
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case '--run':
    case '-r':
      runAgentServer();
      break;
      
    case '--test':
    case '-t':
      runAgentTest(args.slice(1));
      break;
      
    case '--help':
    case '-h':
      showHelp();
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

/**
 * Start the agent server
 */
function runAgentServer() {
  console.log('🚀 Starting agent server...\n');
  
  const serverPath = path.join(__dirname, 'agent-server.ts');
  const child = spawn('tsx', [serverPath], {
    stdio: 'inherit',
    shell: true,
  });
  
  child.on('error', (error) => {
    console.error('Failed to start agent server:', error);
    process.exit(1);
  });
  
  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Agent server exited with code ${code}`);
      process.exit(code || 1);
    }
  });
}

/**
 * Send test command to agent
 */
function runAgentTest(args: string[]) {
  const clientPath = path.join(__dirname, 'agent-client.ts');
  const child = spawn('tsx', [clientPath, ...args], {
    stdio: 'inherit',
    shell: true,
  });
  
  child.on('error', (error) => {
    console.error('Failed to run test:', error);
    process.exit(1);
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║            Stagehand Browser Agent CLI                        ║
╚════════════════════════════════════════════════════════════════╝

Usage: pnpm agent [command] [options]

Commands:
  --run, -r           Start the agent server with browser
  --test, -t          Send test command to running agent
  --help, -h          Show this help message

Test Options:
  -context <string>   Optional context to add to the test
  <instruction>       The instruction for the agent to execute

Examples:
  # Start the agent server (in one terminal)
  pnpm agent --run
  
  # Send test commands (in another terminal)
  pnpm agent --test "Click the Test Console button"
  pnpm agent --test -context "User is testing the form" "Fill and submit the form with test data"
  pnpm agent --test "Navigate to the dashboard and check for errors"

Notes:
  1. The Next.js app must be running (pnpm dev:next)
  2. Start the agent server first (--run)
  3. Send test commands from another terminal (--test)
  4. The agent will refresh the page before each test

Environment Variables:
  AGENT_PORT          Port for agent server (default: 3456)
  AGENT_SERVER_URL    Agent server URL (default: http://localhost:3456)
`);
}

// Run the CLI
if (require.main === module) {
  main();
}
