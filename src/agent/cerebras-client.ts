import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface CerebrasResponse {
  text: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class CerebrasClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.CEREBRAS_API_KEY || '';
    this.baseUrl = 'https://api.cerebras.ai/v1';
    
    if (!this.apiKey) {
      throw new Error('Cerebras API key is required. Please set CEREBRAS_API_KEY in your .env file or pass it to the constructor.');
    }
  }

  async generateStructuredContent(
    prompt: string,
    format: 'markdown' | 'html' | 'json' | 'text' = 'text',
    systemPrompt?: string
  ): Promise<string> {
    try {
      const messages = [];
      
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt
        });
      }
      
      messages.push({
        role: 'user',
        content: prompt
      });

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'qwen-3-32b',
          messages: messages,
          max_tokens: 4000,
          temperature: 0.7,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from Cerebras API');
      }

      // Format the content based on the requested format
      return this.formatContent(content, format);
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        throw new Error(`Cerebras API error: ${errorMessage}`);
      }
      throw new Error(`Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatContent(content: string, format: string): string {
    switch (format) {
      case 'markdown':
        // Ensure proper markdown formatting
        return this.ensureMarkdownFormatting(content);
      case 'html':
        // Convert to HTML if needed
        return this.convertToHTML(content);
      case 'json':
        // Try to parse and format as JSON
        try {
          const parsed = JSON.parse(content);
          return JSON.stringify(parsed, null, 2);
        } catch {
          // If not valid JSON, wrap in a JSON structure
          return JSON.stringify({ content: content }, null, 2);
        }
      case 'text':
      default:
        return content;
    }
  }

  private ensureMarkdownFormatting(content: string): string {
    // Basic markdown formatting improvements
    let formatted = content;
    
    // Ensure headings have proper spacing
    formatted = formatted.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2');
    
    // Ensure lists have proper formatting
    formatted = formatted.replace(/^(\s*)([-*+])\s+(.+)$/gm, '$1$2 $3');
    formatted = formatted.replace(/^(\s*)(\d+\.)\s+(.+)$/gm, '$1$2 $3');
    
    // Ensure paragraphs have proper spacing
    formatted = formatted.replace(/\n\n+/g, '\n\n');
    
    return formatted;
  }

  private convertToHTML(content: string): string {
    // Basic markdown to HTML conversion
    let html = content;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');
    
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    return html;
  }

  async generateText(prompt: string, maxTokens: number = 1000): Promise<string> {
    return this.generateStructuredContent(prompt, 'text');
  }

  async generateMarkdown(prompt: string, systemPrompt?: string): Promise<string> {
    return this.generateStructuredContent(prompt, 'markdown', systemPrompt);
  }

  async generateHTML(prompt: string, systemPrompt?: string): Promise<string> {
    return this.generateStructuredContent(prompt, 'html', systemPrompt);
  }

  async generateJSON(prompt: string, systemPrompt?: string): Promise<string> {
    return this.generateStructuredContent(prompt, 'json', systemPrompt);
  }
}
