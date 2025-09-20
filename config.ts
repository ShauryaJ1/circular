import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuration helper for switching between AI providers
 */

export type AIProvider = 'gemini' | 'anthropic';

// Detect which provider to use based on available API keys
export function getProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY) {
    return 'anthropic';
  }
  if (process.env.GEMINI_API_KEY) {
    return 'gemini';
  }
  throw new Error('No API key found. Please set either GEMINI_API_KEY or ANTHROPIC_API_KEY in your .env file');
}

// Get configuration for Stagehand initialization
export function getStagehandConfig() {
  const provider = getProvider();
  
  if (provider === 'anthropic') {
    return {
      modelName: 'claude-sonnet-4-20250514',
      modelClientOptions: {
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
    };
  } else {
    return {
      modelName: 'google/gemini-2.5-flash',
      modelClientOptions: {
        apiKey: process.env.GEMINI_API_KEY,
      },
    };
  }
}

// Get configuration for agent
export function getAgentConfig() {
  const provider = getProvider();
  
  if (provider === 'anthropic') {
    return {
      provider: 'anthropic' as const,
      model: 'claude-sonnet-4-20250514',
      options: {
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
    };
  } else {
    return {
      provider: 'google' as const,
      model: 'gemini-2.5-flash',
      options: {
        apiKey: process.env.GEMINI_API_KEY,
      },
    };
  }
}

export function getProviderInfo() {
  const provider = getProvider();
  return {
    name: provider === 'anthropic' ? 'Anthropic Claude' : 'Google Gemini',
    model: provider === 'anthropic' ? 'claude-sonnet-4-20250514' : 'gemini-2.5-flash',
    envVar: provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'GEMINI_API_KEY',
  };
}
