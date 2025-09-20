import { StagehandWithBrowserTools } from './stagehand-browser-tools';
import { getStagehandConfig, getProviderInfo } from './config';
import { saveFailedRequestsToFile, formatFailedRequestsSummary } from './save-failed-requests';

async function runStagehandWithBrowserTools() {
  const providerInfo = getProviderInfo();
  console.log(`Using ${providerInfo.name} (${providerInfo.model})`);
  
  const stagehand = new StagehandWithBrowserTools({
    env: 'LOCAL',
    localBrowserLaunchOptions: {
      headless: false,
      devtools: true,
    },
    ...getStagehandConfig(),
  });

  try {
    await stagehand.init();
    await stagehand.startMonitoring();

    // Navigate to the Next.js app (will be at localhost:3000)
    await stagehand.page.goto('http://localhost:3000');
    
    console.log('\n=== Testing Console Logs ===');
    await stagehand.act('Click on the "Test Console" button');
    await stagehand.page.waitForTimeout(1000);
    
    const consoleLogs = stagehand.getConsoleLogs();
    console.log('Console Logs:', consoleLogs);

    console.log('\n=== Testing LocalStorage ===');
    await stagehand.act('Fill in the localStorage form and submit it');
    await stagehand.page.waitForTimeout(1000);
    
    const storageData = await stagehand.getStorageData();
    console.log('Storage Data:', storageData);

    console.log('\n=== Testing Network Requests ===');
    await stagehand.act('Click on "Test API" button to make tRPC requests');
    await stagehand.page.waitForTimeout(2000);
    
    const networkLogs = stagehand.getNetworkLogs({ urlPattern: 'api/trpc' });
    console.log('tRPC Network Logs:', networkLogs);

    console.log('\n=== Testing Failed Requests ===');
    await stagehand.act('Click on "Test Broken API" button');
    await stagehand.page.waitForTimeout(2000);
    
    const failedRequests = stagehand.getFailedRequests();
    console.log(formatFailedRequestsSummary(failedRequests));
    
    // Save failed requests to file
    if (failedRequests.length > 0) {
      const filepath = saveFailedRequestsToFile(failedRequests);
      console.log(`Failed requests saved to: ${filepath}`);
    }

    // Extract structured data from the page
    console.log('\n=== Extracting Page Data ===');
    const pageData = await stagehand.extract({
      instruction: 'Extract all form data and button text from the page',
      schema: {
        type: 'object',
        properties: {
          forms: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                fields: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          buttons: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });
    console.log('Extracted Data:', pageData);

    // Export all logs
    const logsExport = stagehand.exportLogs();
    console.log('\n=== Exported Logs ===');
    console.log(logsExport);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await stagehand.close();
  }
}

// Run the example
if (require.main === module) {
  runStagehandWithBrowserTools().catch(console.error);
}
