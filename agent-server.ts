import express from 'express';
import { StagehandWithBrowserTools } from './stagehand-browser-tools';
import { getStagehandConfig, getProviderInfo } from './config';

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
    
    // Navigate to the test app
    await stagehand.page.goto('http://localhost:3000');
    
    // Handle browser page close
    stagehand.page.on('close', () => {
      console.log('\n⚠️ Browser window was closed');
      console.log('🛑 Shutting down agent server...');
      process.exit(0);
    });
    
    // Create the agent
    agent = stagehand.agent({
      provider: 'cerebras',
      model: getProviderInfo().model,
      options: {
        apiKey: process.env.CEREBRAS_API_KEY,
      },
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

  const { context, instruction } = req.body;
  
  if (!instruction) {
    return res.status(400).json({ error: 'Missing instruction' });
  }

  console.log('\n📋 Received test request:');
  if (context) {
    console.log(`   Context: ${context}`);
  }
  console.log(`   Instruction: ${instruction}`);
  
  try {
    // Always refresh the page first
    console.log('🔄 Refreshing page before starting tests...');
    await stagehand.page.reload({ waitUntil: 'networkidle' });
    await stagehand.page.waitForTimeout(2000); // Give page more time to stabilize
    console.log('✅ Page refreshed successfully');
    
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
    
    res.json({
      success: true,
      result,
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
    res.status(500).json({ 
      success: false, 
      error: error.message 
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
