import { Stagehand } from '@browserbasehq/stagehand';
import { Page, BrowserContext, Request, Response, ConsoleMessage } from 'playwright';

export interface BrowserLog {
  type: string;
  text: string;
  timestamp: Date;
  args?: any[];
}

export interface NetworkLog {
  type: 'request' | 'response';
  method?: string;
  url: string;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  postData?: string;
  responseBody?: string;
  timestamp: Date;
}

export interface StorageData {
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  cookies: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  }>;
}

export class StagehandWithBrowserTools extends Stagehand {
  private consoleLogs: BrowserLog[] = [];
  private networkLogs: NetworkLog[] = [];
  private isMonitoring: boolean = false;

  constructor(options?: any) {
    // Pass options directly to Stagehand - it will handle the proper types internally
    super(options);
  }

  /**
   * Start monitoring browser console, network, and storage
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('Browser monitoring is already active');
      return;
    }

    const page = this.page;
    if (!page) {
      throw new Error('No page available. Make sure to call init() first');
    }

    // Monitor console logs
    page.on('console', (msg: ConsoleMessage) => {
      const log: BrowserLog = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date(),
        args: []
      };
      
      // Try to get the actual values of console.log arguments
      msg.args().forEach(async (arg) => {
        try {
          const value = await arg.jsonValue();
          log.args?.push(value);
        } catch (e) {
          log.args?.push('[Object]');
        }
      });

      this.consoleLogs.push(log);
      console.log(`[Browser Console:${log.type}] ${log.text}`);
    });

    // Monitor network requests
    page.on('request', async (request: Request) => {
      const networkLog: NetworkLog = {
        type: 'request',
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        postData: request.postData() || undefined,
        timestamp: new Date()
      };
      this.networkLogs.push(networkLog);
      console.log(`[Network Request] ${request.method()} ${request.url()}`);
    });

    // Monitor network responses
    page.on('response', async (response: Response) => {
      const networkLog: NetworkLog = {
        type: 'response',
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        timestamp: new Date()
      };

      // Try to get response body for non-binary responses
      // Note: Response body may not always be available due to browser limitations
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('json') || contentType.includes('text')) {
          networkLog.responseBody = await response.text();
        }
      } catch (e) {
        // Body might not be available for certain requests (e.g., cross-origin, large files)
      }

      this.networkLogs.push(networkLog);
      console.log(`[Network Response] ${response.status()} ${response.url()}`);
    });

    // Monitor page errors
    page.on('pageerror', (error: Error) => {
      const log: BrowserLog = {
        type: 'error',
        text: error.message,
        timestamp: new Date()
      };
      this.consoleLogs.push(log);
      console.error(`[Page Error] ${error.message}`);
    });

    this.isMonitoring = true;
    console.log('Browser monitoring started');
  }

  /**
   * Get all console logs
   */
  getConsoleLogs(type?: string): BrowserLog[] {
    if (type) {
      return this.consoleLogs.filter(log => log.type === type);
    }
    return this.consoleLogs;
  }

  /**
   * Get all network logs
   */
  getNetworkLogs(filter?: { type?: 'request' | 'response'; urlPattern?: string }): NetworkLog[] {
    let logs = [...this.networkLogs];
    
    if (filter?.type) {
      logs = logs.filter(log => log.type === filter.type);
    }
    
    if (filter?.urlPattern) {
      const pattern = new RegExp(filter.urlPattern);
      logs = logs.filter(log => pattern.test(log.url));
    }
    
    return logs;
  }

  /**
   * Get localStorage, sessionStorage, and cookies
   */
  async getStorageData(): Promise<StorageData> {
    const page = this.page;
    const context = this.context;
    
    if (!page || !context) {
      throw new Error('No page or context available');
    }

    // Get localStorage and sessionStorage
    const storageData = await page.evaluate(() => {
      return {
        localStorage: Object.fromEntries(
          Object.entries(localStorage)
        ),
        sessionStorage: Object.fromEntries(
          Object.entries(sessionStorage)
        )
      };
    });

    // Get cookies
    const cookies = await context.cookies();

    return {
      ...storageData,
      cookies
    };
  }

  /**
   * Set localStorage item
   */
  async setLocalStorageItem(key: string, value: string): Promise<void> {
    const page = this.page;
    if (!page) {
      throw new Error('No page available');
    }

    await page.evaluate(({key, value}) => {
      localStorage.setItem(key, value);
    }, {key, value});
  }

  /**
   * Set cookie
   */
  async setCookie(cookie: {
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  }): Promise<void> {
    const context = this.context;
    if (!context) {
      throw new Error('No context available');
    }

    await context.addCookies([cookie]);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.consoleLogs = [];
    this.networkLogs = [];
    console.log('All logs cleared');
  }

  /**
   * Get failed network requests
   */
  getFailedRequests(): NetworkLog[] {
    return this.networkLogs.filter(log => 
      log.type === 'response' && log.status && log.status >= 400
    );
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify({
      consoleLogs: this.consoleLogs,
      networkLogs: this.networkLogs,
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Helper to wait for a specific console log
   */
  async waitForConsoleLog(pattern: string | RegExp, timeout: number = 5000): Promise<BrowserLog | null> {
    const startTime = Date.now();
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    while (Date.now() - startTime < timeout) {
      const matchingLog = this.consoleLogs.find(log => regex.test(log.text));
      if (matchingLog) {
        return matchingLog;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
  }

  /**
   * Helper to wait for a specific network request
   */
  async waitForNetworkRequest(urlPattern: string | RegExp, timeout: number = 5000): Promise<NetworkLog | null> {
    const startTime = Date.now();
    const regex = typeof urlPattern === 'string' ? new RegExp(urlPattern) : urlPattern;

    while (Date.now() - startTime < timeout) {
      const matchingRequest = this.networkLogs.find(log => 
        log.type === 'request' && regex.test(log.url)
      );
      if (matchingRequest) {
        return matchingRequest;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
  }
}
