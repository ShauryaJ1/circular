// API service for fetching real data from backend
class ApiService {
  private baseUrl = '' // Use relative URLs for same-origin requests

  // Fetch real log data from API
  async fetchLogs() {
    try {
      const response = await fetch(`${this.baseUrl}/api/logs`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const logs = await response.json()
      return logs
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      return []
    }
  }

  // Fetch real solution data from API
  async fetchSolutions() {
    try {
      const response = await fetch(`${this.baseUrl}/api/solutions`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const solutions = await response.json()
      return solutions
    } catch (error) {
      console.error('Failed to fetch solutions:', error)
      return []
    }
  }

  // Create new log entry
  async createLog(logData: { issueText: string; solutionText?: string; tags?: string[] }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const newLog = await response.json()
      return newLog
    } catch (error) {
      console.error('Failed to create log:', error)
      throw error
    }
  }

  // Fetch real run data from API
  async fetchRuns() {
    try {
      const response = await fetch(`${this.baseUrl}/api/runs`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const runs = await response.json()
      return runs
    } catch (error) {
      console.error('Failed to fetch runs:', error)
      return []
    }
  }

  // Create new run entry
  async createRun(runData: { taskId: string; status: string; metadata?: any }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(runData),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const newRun = await response.json()
      return newRun
    } catch (error) {
      console.error('Failed to create run:', error)
      throw error
    }
  }
}

export const apiService = new ApiService()
