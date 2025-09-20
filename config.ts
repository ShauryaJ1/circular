import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuration helper for Cerebras AI provider
 */

export type AIProvider = 'cerebras';

// Detect which provider to use based on available API keys
export function getProvider(): AIProvider {
  if (process.env.CEREBRAS_API_KEY) {
    return 'cerebras';
  }
  throw new Error('No API key found. Please set CEREBRAS_API_KEY in your .env file');
}

// Get configuration for Stagehand initialization
export function getStagehandConfig() {
  const provider = getProvider();
  
  if (provider === 'cerebras') {
    return {
      modelName: 'cerebras/llama-3.1-8b-instruct',
      modelClientOptions: {
        apiKey: process.env.CEREBRAS_API_KEY,
      },
    };
  }
  
  throw new Error('Unsupported provider');
}

// Get configuration for agent
export function getAgentConfig() {
  const provider = getProvider();
  
  if (provider === 'cerebras') {
    // For now, use a generic config that should work with most providers
    return {
      model: 'cerebras/llama-3.1-8b-instruct',
      options: {
        apiKey: process.env.CEREBRAS_API_KEY,
      },
    };
  }
  
  throw new Error('Unsupported provider');
}

export function getProviderInfo() {
  const provider = getProvider();
  return {
    name: 'Cerebras',
    model: 'cerebras/llama-3.1-8b-instruct',
    envVar: 'CEREBRAS_API_KEY',
  };
}
