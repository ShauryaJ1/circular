'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockTasks, mockRuns } from '@/lib/mock-data'
import { calculateSuccessRate, formatDuration } from '@/lib/utils'

export default function AnalyticsPage() {
  // Calculate analytics data
  const totalTasks = mockTasks.length
  const totalRuns = mockRuns.length
  const completedRuns = mockRuns.filter(run => run.status === 'completed').length
  const failedRuns = mockRuns.filter(run => run.status === 'failed').length
  const runningRuns = mockRuns.filter(run => run.status === 'running').length
  const successRate = calculateSuccessRate(completedRuns, totalRuns)
  
  const avgDuration = mockRuns
    .filter(run => run.duration)
    .reduce((acc, run) => acc + (run.duration || 0), 0) / 
    mockRuns.filter(run => run.duration).length

  // Task performance
  const taskPerformance = mockTasks.map(task => ({
    name: task.name,
    runs: task.totalRuns,
    successRate: calculateSuccessRate(task.successfulRuns, task.totalRuns),
    avgRuntime: task.averageRunTime || 0,
  })).sort((a, b) => b.runs - a.runs)

  return (
    <MainLayout title="Analytics">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRuns}</div>
              <p className="text-xs text-muted-foreground">
                {runningRuns} currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">
                {completedRuns} completed, {failedRuns} failed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(avgDuration)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Task Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taskPerformance.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span>{task.runs} runs</span>
                      <span>{task.successRate}% success</span>
                      <span>{formatDuration(task.avgRuntime)} avg</span>
                    </div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${task.successRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Run Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Run Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed</span>
                  <span className="text-sm font-medium text-green-600">{completedRuns}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Failed</span>
                  <span className="text-sm font-medium text-red-600">{failedRuns}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Running</span>
                  <span className="text-sm font-medium text-blue-600">{runningRuns}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Trend charts would be implemented here</p>
                <p className="text-xs mt-2">
                  Integration with charting library needed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
