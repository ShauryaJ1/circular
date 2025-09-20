import { Task, TaskRun, Solution, DashboardStats, BrowserLog, NetworkLog, LogEntry } from '@/types'

// Mock data for development and demonstration
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    name: 'Login Flow Test',
    description: 'Test the complete user login flow including form validation and error handling',
    status: 'completed',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T14:30:00Z'),
    totalRuns: 25,
    successfulRuns: 23,
    failedRuns: 2,
    tags: ['authentication', 'forms', 'critical'],
    lastRunAt: new Date('2024-01-15T14:30:00Z'),
    averageRunTime: 12500,
  },
  {
    id: 'task-2',
    name: 'E-commerce Checkout',
    description: 'Validate the complete checkout process including payment flow',
    status: 'running',
    createdAt: new Date('2024-01-14T09:15:00Z'),
    updatedAt: new Date('2024-01-15T11:45:00Z'),
    totalRuns: 18,
    successfulRuns: 15,
    failedRuns: 2,
    tags: ['payments', 'checkout', 'critical', 'e-commerce'],
    lastRunAt: new Date('2024-01-15T11:45:00Z'),
    averageRunTime: 28750,
  },
  {
    id: 'task-3',
    name: 'API Integration Test',
    description: 'Test all API endpoints for data consistency and error handling',
    status: 'failed',
    createdAt: new Date('2024-01-13T16:20:00Z'),
    updatedAt: new Date('2024-01-15T09:10:00Z'),
    totalRuns: 8,
    successfulRuns: 5,
    failedRuns: 3,
    tags: ['api', 'integration', 'backend'],
    lastRunAt: new Date('2024-01-15T09:10:00Z'),
    averageRunTime: 8200,
  },
  {
    id: 'task-4',
    name: 'Form Validation Suite',
    description: 'Comprehensive testing of form validation across multiple pages',
    status: 'pending',
    createdAt: new Date('2024-01-12T13:45:00Z'),
    updatedAt: new Date('2024-01-12T13:45:00Z'),
    totalRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
    tags: ['forms', 'validation', 'ui'],
    averageRunTime: 0,
  },
]

export const mockRuns: TaskRun[] = [
  {
    id: 'run-1',
    taskId: 'task-1',
    status: 'completed',
    startedAt: new Date('2024-01-15T14:25:00Z'),
    completedAt: new Date('2024-01-15T14:30:00Z'),
    duration: 300000, // 5 minutes
    logs: [
      {
        id: 'log-1',
        runId: 'run-1',
        level: 'info',
        message: 'Starting login flow test',
        timestamp: new Date('2024-01-15T14:25:00Z'),
        tags: ['authentication', 'test-start'],
      },
      {
        id: 'log-2',
        runId: 'run-1',
        level: 'info',
        message: 'Navigating to login page',
        timestamp: new Date('2024-01-15T14:25:15Z'),
        tags: ['navigation', 'login-page'],
      },
      {
        id: 'log-3',
        runId: 'run-1',
        level: 'info',
        message: 'Filling login form with test credentials',
        timestamp: new Date('2024-01-15T14:26:00Z'),
        tags: ['form-filling', 'credentials'],
      },
      {
        id: 'log-4',
        runId: 'run-1',
        level: 'info',
        message: 'Login successful, redirected to dashboard',
        timestamp: new Date('2024-01-15T14:28:30Z'),
        tags: ['success', 'redirect', 'dashboard'],
      },
    ],
    consoleOutputs: [
      {
        id: 'console-1',
        type: 'log',
        text: 'User authenticated successfully',
        timestamp: new Date('2024-01-15T14:28:30Z'),
        args: ['user-id', '12345'],
      },
      {
        id: 'console-2',
        type: 'info',
        text: 'Dashboard loaded',
        timestamp: new Date('2024-01-15T14:28:45Z'),
      },
    ],
    networkRequests: [
      {
        id: 'network-1',
        type: 'request',
        method: 'POST',
        url: 'https://api.example.com/auth/login',
        headers: { 'Content-Type': 'application/json' },
        postData: '{"username":"test@example.com","password":"***"}',
        timestamp: new Date('2024-01-15T14:26:30Z'),
      },
      {
        id: 'network-2',
        type: 'response',
        url: 'https://api.example.com/auth/login',
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        responseBody: '{"token":"jwt-token","user":{"id":"12345","email":"test@example.com"}}',
        timestamp: new Date('2024-01-15T14:26:35Z'),
        duration: 150,
      },
    ],
    tags: ['authentication', 'success'],
  },
  {
    id: 'run-2',
    taskId: 'task-2',
    status: 'running',
    startedAt: new Date('2024-01-15T11:45:00Z'),
    logs: [
      {
        id: 'log-5',
        runId: 'run-2',
        level: 'info',
        message: 'Starting checkout flow test',
        timestamp: new Date('2024-01-15T11:45:00Z'),
        tags: ['checkout', 'test-start', 'e-commerce'],
      },
      {
        id: 'log-6',
        runId: 'run-2',
        level: 'info',
        message: 'Adding items to cart',
        timestamp: new Date('2024-01-15T11:46:00Z'),
        tags: ['cart', 'items', 'shopping'],
      },
      {
        id: 'log-7',
        runId: 'run-2',
        level: 'warn',
        message: 'Payment gateway taking longer than expected',
        timestamp: new Date('2024-01-15T11:50:00Z'),
        tags: ['payment', 'timeout', 'performance'],
        issue: {
          id: 'issue-1',
          title: 'Payment Gateway Timeout',
          fullText: 'During the checkout flow test, the payment gateway response time exceeded the expected threshold of 5 seconds. This could indicate network latency, payment provider issues, or insufficient server resources. The delay occurred when processing a standard credit card transaction with valid test credentials. Browser console shows no JavaScript errors, but network tab indicates slow response from payment API endpoint.',
          tags: ['payment', 'timeout', 'performance', 'api'],
          detectedAt: new Date('2024-01-15T11:50:00Z'),
          context: {
            url: 'https://example.com/checkout/payment',
            selector: '#payment-form',
            userAction: 'Submit payment form',
            expectedBehavior: 'Payment should process within 5 seconds',
            actualBehavior: 'Payment processing took 12 seconds',
            browserInfo: 'Chrome 120.0.0.0 on macOS',
          }
        },
        solution: {
          id: 'solution-1',
          issueId: 'issue-1',
          title: 'Implement Payment Retry with Exponential Backoff',
          fullText: 'To resolve the payment gateway timeout issue, we implemented a comprehensive solution involving retry logic, user feedback, and timeout handling. The solution includes: 1) Exponential backoff retry mechanism for failed/slow requests, 2) Loading indicators and progress feedback for users, 3) Fallback payment methods when primary gateway is slow, 4) Improved error handling and user messaging, 5) Monitoring and alerting for payment gateway performance.',
          tags: ['retry-logic', 'user-feedback', 'error-handling', 'monitoring'],
          appliedAt: new Date('2024-01-15T12:15:00Z'),
          effectiveness: 85,
          context: {
            steps: [
              'Add retry mechanism with exponential backoff',
              'Improve user feedback with loading indicators', 
              'Add fallback payment methods',
              'Implement proper error handling',
              'Set up monitoring and alerts'
            ],
            codeChanges: {
              'src/components/PaymentForm.tsx': {
                description: 'Added exponential backoff retry logic',
                before: 'const processPayment = async (paymentData) => {\n  return await paymentAPI.process(paymentData);\n}',
                after: 'const processPayment = async (paymentData, retryCount = 0) => {\n  try {\n    return await paymentAPI.process(paymentData);\n  } catch (error) {\n    if (retryCount < 3) {\n      await delay(Math.pow(2, retryCount) * 1000);\n      return processPayment(paymentData, retryCount + 1);\n    }\n    throw error;\n  }\n}'
              }
            },
            verification: 'Automated test with simulated slow payment gateway - achieved 95% success rate'
          }
        }
      },
    ],
    consoleOutputs: [
      {
        id: 'console-3',
        type: 'log',
        text: 'Cart updated with 3 items',
        timestamp: new Date('2024-01-15T11:46:15Z'),
      },
      {
        id: 'console-4',
        type: 'warn',
        text: 'Payment processing timeout warning',
        timestamp: new Date('2024-01-15T11:50:00Z'),
      },
    ],
    networkRequests: [
      {
        id: 'network-3',
        type: 'request',
        method: 'POST',
        url: 'https://api.example.com/cart/add',
        headers: { 'Content-Type': 'application/json' },
        timestamp: new Date('2024-01-15T11:46:00Z'),
      },
    ],
    tags: ['checkout', 'in-progress'],
  },
  {
    id: 'run-3',
    taskId: 'task-3',
    status: 'failed',
    startedAt: new Date('2024-01-15T09:05:00Z'),
    completedAt: new Date('2024-01-15T09:10:00Z'),
    duration: 300000,
    error: 'API endpoint returned 500 Internal Server Error',
    logs: [
      {
        id: 'log-8',
        runId: 'run-3',
        level: 'info',
        message: 'Starting API integration test',
        timestamp: new Date('2024-01-15T09:05:00Z'),
        tags: ['api', 'integration', 'test-start'],
      },
      {
        id: 'log-9',
        runId: 'run-3',
        level: 'error',
        message: 'API request failed with 500 error',
        timestamp: new Date('2024-01-15T09:08:00Z'),
        metadata: { endpoint: '/api/users', statusCode: 500 },
        tags: ['api', 'error', 'server-error', '500'],
        issue: {
          id: 'issue-2',
          title: 'API Server Internal Error',
          fullText: 'The /api/users endpoint is consistently returning HTTP 500 Internal Server Error responses during integration testing. This appears to be a server-side issue affecting user data retrieval functionality. The error occurs when making GET requests to fetch user profile information. Server logs indicate a database connection timeout, suggesting the issue may be related to database performance or connection pool exhaustion. No client-side JavaScript errors are present, and the request headers and payload are correctly formatted.',
          tags: ['api', 'server-error', 'database', 'timeout'],
          detectedAt: new Date('2024-01-15T09:08:00Z'),
          context: {
            url: 'https://api.example.com/users',
            userAction: 'Fetch user profile data',
            expectedBehavior: 'API should return user data with 200 status',
            actualBehavior: 'API returns 500 Internal Server Error',
            browserInfo: 'Chrome 120.0.0.0 on macOS',
          }
        },
        solution: {
          id: 'solution-2',
          issueId: 'issue-2',
          title: 'Database Connection Pool Optimization',
          fullText: 'To resolve the API 500 errors, we implemented a comprehensive database connection optimization strategy. The solution involved: 1) Increasing database connection pool size and timeout settings, 2) Adding connection health checks and automatic reconnection logic, 3) Implementing proper error handling and fallback responses, 4) Adding database query optimization and indexing, 5) Setting up monitoring and alerting for database performance metrics.',
          tags: ['database', 'connection-pool', 'error-handling', 'monitoring'],
          appliedAt: new Date('2024-01-15T10:30:00Z'),
          effectiveness: 92,
          context: {
            steps: [
              'Optimize connection pool size and timeout settings',
              'Add connection health checks and reconnection logic',
              'Implement proper error handling and fallback responses',
              'Add database query optimization and indexing',
              'Set up monitoring and alerting for database performance'
            ],
            verification: 'Load testing with 100 concurrent API requests - achieved 99% success rate'
          }
        }
      },
    ],
    consoleOutputs: [
      {
        id: 'console-5',
        type: 'error',
        text: 'Failed to fetch user data: Internal Server Error',
        timestamp: new Date('2024-01-15T09:08:00Z'),
      },
    ],
    networkRequests: [
      {
        id: 'network-4',
        type: 'response',
        url: 'https://api.example.com/users',
        status: 500,
        statusText: 'Internal Server Error',
        timestamp: new Date('2024-01-15T09:08:00Z'),
        duration: 2500,
      },
    ],
    tags: ['api', 'error', 'server-error'],
  },
]

export const mockSolutions: Solution[] = [
  {
    id: 'solution-1',
    title: 'Handle Login Timeout Errors',
    description: 'Solution for handling authentication timeouts gracefully',
    issue: 'Login requests occasionally timeout causing test failures and poor user experience',
    solution: 'Implement retry mechanism with exponential backoff and show loading states to users. Add timeout detection and fallback authentication methods.',
    tags: ['authentication', 'timeout', 'retry', 'ux'],
    createdAt: new Date('2024-01-10T15:30:00Z'),
    updatedAt: new Date('2024-01-12T10:15:00Z'),
    usageCount: 8,
    effectiveness: 92,
    relatedTaskIds: ['task-1'],
  },
  {
    id: 'solution-2',
    title: 'Payment Gateway Integration Fix',
    description: 'Resolve payment processing failures and improve error handling',
    issue: 'Payment gateway integration fails intermittently with unclear error messages, causing checkout abandonment',
    solution: 'Add comprehensive error handling for different payment failure scenarios. Implement proper validation before payment submission and provide clear user feedback. Add fallback payment methods.',
    tags: ['payments', 'error-handling', 'validation', 'ux'],
    createdAt: new Date('2024-01-08T11:20:00Z'),
    updatedAt: new Date('2024-01-14T16:45:00Z'),
    usageCount: 12,
    effectiveness: 88,
    relatedTaskIds: ['task-2'],
  },
  {
    id: 'solution-3',
    title: 'API Rate Limiting Handler',
    description: 'Implement proper rate limiting and throttling for API calls',
    issue: 'API integration tests fail due to rate limiting and concurrent request issues',
    solution: 'Implement request queuing system with rate limiting. Add exponential backoff for failed requests and proper error messages for rate limit exceeded scenarios. Cache frequently accessed data to reduce API calls.',
    tags: ['api', 'rate-limiting', 'performance', 'caching'],
    createdAt: new Date('2024-01-05T09:45:00Z'),
    updatedAt: new Date('2024-01-13T14:20:00Z'),
    usageCount: 15,
    effectiveness: 95,
    relatedTaskIds: ['task-3'],
  },
  {
    id: 'solution-4',
    title: 'Form Validation Enhancement',
    description: 'Improve client-side and server-side form validation consistency',
    issue: 'Form validation inconsistencies between frontend and backend causing confusion and failed submissions',
    solution: 'Standardize validation rules across frontend and backend. Implement real-time validation feedback. Add clear error messages and field highlighting. Create reusable validation components.',
    tags: ['forms', 'validation', 'consistency', 'ux'],
    createdAt: new Date('2024-01-03T13:10:00Z'),
    updatedAt: new Date('2024-01-11T12:30:00Z'),
    usageCount: 6,
    effectiveness: 85,
    relatedTaskIds: ['task-4'],
  },
]

export const mockDashboardStats: DashboardStats = {
  totalTasks: 4,
  activeTasks: 2,
  totalRuns: 51,
  successRate: 84,
  averageRunTime: 15875,
  recentActivity: mockRuns.slice(0, 5),
}
