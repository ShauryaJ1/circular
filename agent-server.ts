import express from 'express';
import { StagehandWithBrowserTools } from './stagehand-browser-tools';
import { getStagehandConfig, getProviderInfo, getAgentConfig, getProvider } from './config';

// Function to create run entry via API
async function createRunEntry(taskId: string, status: string, metadata: any = {}) {
  try {
    const response = await fetch('http://localhost:3001/api/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId,
        status,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          source: 'agent-server'
        }
      }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Run entry created:', result.id);
      return result;
    } else {
      console.log('⚠️ Failed to create run entry:', response.status);
    }
  } catch (error) {
    console.log('⚠️ Could not connect to frontend API for run logging:', error.message);
  }
  return null;
}

const app = express();
app.use(express.json());

let stagehand: StagehandWithBrowserTools | null = null;
let agent: any = null;
let isReady = false;

const PORT = process.env.AGENT_PORT || 3456;

/**
 * Initialize Stagehand and the agent
 */
async function initializeAgent() {
  try {
    const providerInfo = getProviderInfo();
    console.log(`🚀 Initializing Agent with ${providerInfo.name} (${providerInfo.model})`);
    
    stagehand = new StagehandWithBrowserTools({
      env: 'LOCAL',
      localBrowserLaunchOptions: {
        headless: false,  // Keep browser visible
        devtools: true,   // Show DevTools for debugging
        args: [
          '--start-maximized',  // Start browser maximized
          '--disable-blink-features=AutomationControlled',  // Hide automation
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ],
        defaultViewport: null,  // Use full screen instead of default viewport
      },
      ...getStagehandConfig(),
    });

    await stagehand.init();
    await stagehand.startMonitoring();
    
    // Navigate to the test app (try port 3001 first, then 3000)
    try {
      await stagehand.page.goto('http://localhost:3001');
      console.log('✅ Connected to frontend on port 3001');
    } catch (error) {
      console.log('Port 3001 not available, trying 3000...');
      await stagehand.page.goto('http://localhost:3000');
      console.log('✅ Connected to frontend on port 3000');
    }
    
    // Handle browser page close
    stagehand.page.on('close', () => {
      console.log('\n⚠️ Browser window was closed');
      console.log('🛑 Shutting down agent server...');
      process.exit(0);
    });
    
    // Create the agent
    const agentConfig = getAgentConfig();
    const provider = getProvider();
    
    // Map our provider types to the expected agent provider types
    let agentProvider: string;
    if (provider === 'anthropic') {
      agentProvider = 'anthropic';
    } else if (provider === 'openai') {
      agentProvider = 'openai';
    } else if (provider === 'cerebras') {
      agentProvider = 'anthropic'; // Cerebras uses Anthropic-compatible API
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    
    agent = stagehand.agent({
      provider: agentProvider as any,
      model: agentConfig.model,
      options: agentConfig.options,
    });
    
    isReady = true;
    console.log('✅ Agent is ready and listening on port', PORT);
    console.log('🖥️  Browser is visible and will stay open');
    console.log('📡 Waiting for test commands...');
    console.log('💡 Tip: Keep the browser window open - closing it will stop the agent\n');
    
  } catch (error) {
    console.error('❌ Failed to initialize agent:', error);
    process.exit(1);
  }
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: isReady ? 'ready' : 'initializing',
    provider: getProviderInfo().name,
    model: getProviderInfo().model 
  });
});

/**
 * Execute test endpoint
 */
app.post('/test', async (req, res) => {
  if (!isReady || !agent || !stagehand) {
    return res.status(503).json({ error: 'Agent not ready' });
  }

  // Check if browser context is still valid
  try {
    const isConnected = await stagehand.page.evaluate(() => true);
  } catch (error) {
    console.log('⚠️ Browser context lost, reinitializing...');
    try {
      // Set ready to false during reinitialization
      isReady = false;
      await initializeAgent();
      console.log('✅ Agent reinitialized successfully');
    } catch (reinitError: any) {
      console.error('❌ Failed to reinitialize agent:', reinitError.message);
      isReady = false;
      return res.status(503).json({ error: 'Agent reinitialization failed: ' + reinitError.message });
    }
  }

  const { context, instruction } = req.body;
  
  if (!instruction) {
    return res.status(400).json({ error: 'Missing instruction' });
  }

  console.log('\n📋 Received test request:');
  if (context) {
    console.log(`   Context: ${context}`);
  }
  console.log(`   Instruction: ${instruction}`);
  
  // Create a task ID for this run
  const taskId = `task-${Date.now()}`;
  const startTime = new Date();
  
  // Log run start
  await createRunEntry(taskId, 'running', {
    instruction,
    context,
    startTime: startTime.toISOString()
  });
  
  try {
    // Check if page is still available and refresh if needed
    console.log('🔄 Checking page status and refreshing if needed...');
    try {
      // Try to get the current URL to test if page is still active
      const currentUrl = await stagehand.page.url();
      console.log(`📍 Current page: ${currentUrl}`);
      
      // Skip reload if we're already on the right page and it's responsive
      if (currentUrl.includes('localhost:3001') || currentUrl.includes('localhost:3000')) {
        console.log('✅ Page is already loaded and responsive');
      } else {
        // Navigate to frontend if we're on wrong page
        console.log('🔄 Navigating to frontend...');
        try {
          await stagehand.page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
          console.log('✅ Connected to frontend on port 3001');
        } catch (navError) {
          console.log('Port 3001 not available, trying 3000...');
          await stagehand.page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
          console.log('✅ Connected to frontend on port 3000');
        }
      }
      
      await stagehand.page.waitForTimeout(1000);
    } catch (pageError: any) {
      console.log('⚠️ Page appears to be closed, attempting to navigate to frontend...');
      
      // Try to navigate to the frontend again
      try {
        await stagehand.page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
        console.log('✅ Reconnected to frontend on port 3001');
      } catch (navError) {
        console.log('Port 3001 not available, trying 3000...');
        await stagehand.page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        console.log('✅ Reconnected to frontend on port 3000');
      }
      
      await stagehand.page.waitForTimeout(1000);
    }
    
    // Clear previous logs
    stagehand.clearLogs();
    
    // Prepare the full instruction with context
    let fullInstruction = instruction;
    if (context) {
      fullInstruction = `Context: ${context}\n\nTask: ${instruction}`;
    }
    
    // Execute the agent task
    console.log('🤖 Executing agent task...');
    const result = await agent.execute({
      instruction: fullInstruction,
      maxSteps: 10
    });
    
    // Collect results
    const consoleLogs = stagehand.getConsoleLogs();
    const networkLogs = stagehand.getNetworkLogs();
    const failedRequests = stagehand.getFailedRequests();
    const storageData = await stagehand.getStorageData();
    
    // Don't save to file anymore, just return the data
    console.log('✅ Test completed successfully');
    
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    // Log successful completion
    await createRunEntry(taskId, 'completed', {
      instruction,
      context,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      consoleLogs: consoleLogs.length,
      networkRequests: networkLogs.length,
      failedRequests: failedRequests.length,
      result: result?.success || true
    });
    
    res.json({
      success: true,
      result,
      taskId,
      duration,
      logs: {
        console: consoleLogs,
        network: networkLogs.length,
        failedRequests: failedRequests, // Return full failed requests
        storage: storageData
      },
      // Include agent messages if available
      agentMessages: result?.messages || [],
      agentSteps: result?.steps || result
    });
    
  } catch (error: any) {
    console.error('❌ Test execution failed:', error.message);
    
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    // Log failed completion
    await createRunEntry(taskId, 'failed', {
      instruction,
      context,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      error: error.message,
      result: false
    });
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      taskId,
      duration
    });
  }
});

/**
 * Get current logs endpoint
 */
app.get('/logs', async (req, res) => {
  if (!stagehand) {
    return res.status(503).json({ error: 'Agent not ready' });
  }
  
  const consoleLogs = stagehand.getConsoleLogs();
  const networkLogs = stagehand.getNetworkLogs();
  const failedRequests = stagehand.getFailedRequests();
  const storageData = await stagehand.getStorageData();
  
  res.json({
    console: consoleLogs,
    network: networkLogs,
    failedRequests: failedRequests,
    storage: storageData
  });
});

/**
 * Shutdown endpoint
 */
app.post('/shutdown', async (req, res) => {
  console.log('🛑 Shutting down agent...');
  
  if (stagehand) {
    await stagehand.close();
  }
  
  res.json({ message: 'Agent shutdown initiated' });
  
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🌐 Agent server starting on http://localhost:${PORT}`);
  initializeAgent();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  if (stagehand) {
    await stagehand.close();
  }
  process.exit(0);
});
