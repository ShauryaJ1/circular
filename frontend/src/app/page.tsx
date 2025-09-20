import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mockDashboardStats, mockRuns } from '@/lib/mock-data'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatDate, formatDuration } from '@/lib/utils'
import Link from 'next/link'

export default function Home() {
  const stats = mockDashboardStats
  const recentRuns = mockRuns.slice(0, 3)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor your automated tests and browser automation tasks
            </p>
          </div>
          <Button>
            <Link href="/runs">View All Runs</Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Badge variant="secondary">{stats.totalTasks}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeTasks} currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <Badge variant="secondary">{stats.totalRuns}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRuns}</div>
              <p className="text-xs text-muted-foreground">
                Across all tasks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Badge variant="outline" className="text-green-700 bg-green-50">
                {stats.successRate}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                Overall success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Runtime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(stats.averageRunTime)}
              </div>
              <p className="text-xs text-muted-foreground">
                Average execution time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRuns.map((run) => (
                <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <StatusBadge status={run.status} />
                    <div>
                      <div className="font-medium">
                        <span className="text-gray-900 dark:text-white">
                          Run {run.id.substring(0, 8)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Task: {run.taskId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(run.startedAt)}
                    </div>
                    {run.duration && (
                      <div className="text-sm font-medium">
                        {formatDuration(run.duration)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
