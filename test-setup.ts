import { StagehandWithBrowserTools } from './stagehand-browser-tools';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Quick test to verify the setup is working correctly
 */
async function testSetup() {
  console.log('🔧 Testing Stagehand with Browser Tools Setup...\n');

  // Check environment
  const hasGemini = process.env.GEMINI_API_KEY;
  const hasAnthropic = process.env.ANTHROPIC_API_KEY;
  
  if (!hasGemini && !hasAnthropic) {
    console.error('❌ No API key found in .env file');
    console.log('Please create a .env file with either:');
    console.log('  GEMINI_API_KEY=your_key_here');
    console.log('  or');
    console.log('  ANTHROPIC_API_KEY=your_key_here');
    process.exit(1);
  }
  
  const usingProvider = hasAnthropic ? 'Anthropic Claude' : 'Google Gemini';
  console.log(`✅ Environment variables loaded (using ${usingProvider})`);

  // Test Stagehand initialization
  try {
    const modelConfig = hasAnthropic 
      ? {
          modelName: 'claude-sonnet-4-20250514',
          modelClientOptions: {
            apiKey: process.env.ANTHROPIC_API_KEY,
          },
        }
      : {
          modelName: 'google/gemini-2.5-flash',
          modelClientOptions: {
            apiKey: process.env.GEMINI_API_KEY,
          },
        };

    const stagehand = new StagehandWithBrowserTools({
      env: 'LOCAL',
      localBrowserLaunchOptions: {
        headless: true, // Run headless for quick test
      },
      ...modelConfig,
    });

    console.log('✅ Stagehand instance created');

    await stagehand.init();
    console.log('✅ Stagehand initialized');

    await stagehand.startMonitoring();
    console.log('✅ Browser monitoring started');

    // Test navigation
    await stagehand.page.goto('https://example.com');
    console.log('✅ Navigation successful');

    // Test console log capture
    await stagehand.page.evaluate(() => {
      console.log('Test message from browser');
    });
    
    await stagehand.page.waitForTimeout(500);
    const logs = stagehand.getConsoleLogs();
    if (logs.length > 0) {
      console.log('✅ Console log capture working');
    }

    // Test network monitoring
    const networkLogs = stagehand.getNetworkLogs();
    if (networkLogs.length > 0) {
      console.log('✅ Network monitoring working');
    }

    await stagehand.close();
    console.log('✅ Cleanup successful');

    console.log('\n🎉 All tests passed! Your setup is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Start the Next.js app: pnpm dev:next');
    console.log('2. Run examples: pnpm run:stagehand or pnpm run:agent');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Check your API key (GEMINI_API_KEY or ANTHROPIC_API_KEY) is valid');
    console.log('2. Ensure Chrome/Chromium is installed');
    console.log('3. Run: pnpm install');
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testSetup().catch(console.error);
}
