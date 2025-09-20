import { StagehandWithBrowserTools } from './stagehand-browser-tools';
import { saveFailedRequestsToFile, formatFailedRequestsSummary } from './save-failed-requests';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Example showing how to use the agent functionality with browser monitoring
 */
async function runAgentWithBrowserTools() {
  const stagehand = new StagehandWithBrowserTools({
    env: 'LOCAL',
    localBrowserLaunchOptions: {
      headless: false,
      devtools: true,
    },
    modelName: 'claude-sonnet-4-20250514',
    modelClientOptions: {
      apiKey: process.env.ANTHROPIC_API_KEY,
    },
  });

  try {
    await stagehand.init();
    await stagehand.startMonitoring();

    // Navigate to the test app
    await stagehand.page.goto('http://localhost:3000');

    // Create an agent for autonomous execution
    const agent = stagehand.agent({
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        options: {
          apiKey: process.env.ANTHROPIC_API_KEY,
        },
    });

    console.log('\n=== Running Agent Tasks ===');
    
    // Let the agent perform complex tasks autonomously
    await agent.execute({
      instruction: "Test the console logging functionality by clicking the Test Console button and entering a custom message 'Agent Test Message'",
      maxSteps: 5
    });

    // Check captured console logs
    const consoleLogs = stagehand.getConsoleLogs();
    console.log('\nCaptured Console Logs:', consoleLogs);

    // Another agent task
    await agent.execute({
      instruction: "Fill out the form with name 'Test User', email 'test@example.com', and message 'Hello from agent' then submit it",
      maxSteps: 8
    });

    // Check network logs for form submission
    const networkLogs = stagehand.getNetworkLogs({ urlPattern: 'api/trpc' });
    console.log('\nNetwork Logs from Form Submission:', networkLogs);

    // Test storage operations
    await agent.execute({
      instruction: "Set a localStorage item with key 'agentTest' and value 'successfulTest'",
      maxSteps: 5
    });

    const storageData = await stagehand.getStorageData();
    console.log('\nStorage Data After Agent Actions:', storageData);

    // Test error handling
    await agent.execute({
      instruction: "Click the 'Test Broken API' button to trigger an error",
      maxSteps: 3
    });

    const failedRequests = stagehand.getFailedRequests();
    console.log('\nFailed Requests Summary:');
    console.log(formatFailedRequestsSummary(failedRequests));
    
    // Save failed requests to file
    if (failedRequests.length > 0) {
      const filepath = saveFailedRequestsToFile(failedRequests);
      console.log(`Failed requests saved to: ${filepath}`);
    }

    // Export all logs
    const allLogs = stagehand.exportLogs();
    console.log('\n=== All Captured Logs ===');
    console.log(allLogs);

  } catch (error) {
    console.error('Agent execution error:', error);
  } finally {
    await stagehand.close();
  }
}

// Run the example
if (require.main === module) {
  runAgentWithBrowserTools().catch(console.error);
}
