import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuration helper for AI providers that support computer use
 */

export type AIProvider = 'anthropic' | 'openai' | 'cerebras';

// Detect which provider to use based on available API keys
export function getProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY) {
    return 'anthropic';
  }
  if (process.env.OPENAI_API_KEY) {
    return 'openai';
  }
  if (process.env.CEREBRAS_API_KEY) {
    return 'cerebras';
  }
  throw new Error('No API key found. Please set ANTHROPIC_API_KEY, OPENAI_API_KEY, or CEREBRAS_API_KEY in your .env file');
}

// Get configuration for Stagehand initialization
export function getStagehandConfig() {
  const provider = getProvider();
  
  if (provider === 'anthropic') {
    return {
      modelName: 'claude-3-7-sonnet-latest',
      modelClientOptions: {
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
    };
  }
  
  if (provider === 'openai') {
    return {
      modelName: 'gpt-4o',
      modelClientOptions: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    };
  }
  
  if (provider === 'cerebras') {
    return {
      modelName: 'claude-sonnet-4-20250514',
      modelClientOptions: {
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
    };
  }
  
  throw new Error(`Unsupported provider: ${provider}`);
}

// Get configuration for agent
export function getAgentConfig() {
  const provider = getProvider();
  
  if (provider === 'anthropic') {
    return {
      model: 'claude-3-7-sonnet-latest',
      options: {
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
    };
  }
  
  if (provider === 'openai') {
    return {
      model: 'gpt-4o',
      options: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    };
  }
  
  if (provider === 'cerebras') {
    return {
      model: 'claude-sonnet-4-20250514',
      options: {
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
    };
  }
  
  throw new Error(`Unsupported provider: ${provider}`);
}

export function getProviderInfo() {
  const provider = getProvider();
  
  if (provider === 'anthropic') {
    return {
      name: 'Anthropic',
      model: 'claude-3-7-sonnet-latest',
      envVar: 'ANTHROPIC_API_KEY',
    };
  }
  
  if (provider === 'openai') {
    return {
      name: 'OpenAI',
      model: 'gpt-4o',
      envVar: 'OPENAI_API_KEY',
    };
  }
  
  if (provider === 'cerebras') {
    return {
      name: 'Cerebras',
      model: 'claude-sonnet-4-20250514',
      envVar: 'CEREBRAS_API_KEY',
    };
  }
  
  throw new Error(`Unsupported provider: ${provider}`);
}
