'use client'

import { use } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { TagList } from '@/components/ui/tag-list'
import { NetworkMonitor } from '@/components/monitoring/network-monitor'
import { ConsoleMonitor } from '@/components/monitoring/console-monitor'
import { StorageMonitor } from '@/components/monitoring/storage-monitor'
import { LogViewer } from '@/components/logs/log-viewer'
import { mockRuns } from '@/lib/mock-data'
import { formatDate, formatDuration } from '@/lib/utils'
import Link from 'next/link'

interface RunDetailPageProps {
  params: Promise<{ id: string }>
}

export default function RunDetailPage({ params }: RunDetailPageProps) {
  const { id } = use(params)
  
  // Find the run by ID
  const run = mockRuns.find(r => r.id === id)
  
  if (!run) {
    return (
      <MainLayout title="Run Not Found">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Run Not Found
          </h2>
          <p className="text-muted-foreground mb-4">
            The run with ID &ldquo;{id}&rdquo; could not be found.
          </p>
          <Link
            href="/runs"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Runs
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title={`Run ${run.id.substring(0, 8)}`}>
      <div className="space-y-6">
        {/* Run Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-3">
                  <StatusBadge status={run.status} />
                  <span>Run {run.id.substring(0, 8)}</span>
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Task: <Link href={`/tasks/${run.taskId}`} className="text-blue-600 hover:underline">{run.taskId}</Link>
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>Started: {formatDate(run.startedAt)}</div>
                {run.completedAt && (
                  <div>Completed: {formatDate(run.completedAt)}</div>
                )}
                {run.duration && (
                  <div>Duration: {formatDuration(run.duration)}</div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Error Message */}
            {run.error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  Error
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {run.error}
                </p>
              </div>
            )}

            {/* Metadata */}
            {run.metadata && Object.keys(run.metadata).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Metadata</h4>
                <div className="code-block">
                  {JSON.stringify(run.metadata, null, 2)}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Log Entries</div>
                <div className="text-lg font-semibold">{run.logs.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Console Outputs</div>
                <div className="text-lg font-semibold">{run.consoleOutputs.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Network Requests</div>
                <div className="text-lg font-semibold">{run.networkRequests.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Tags</div>
                <div className="text-lg font-semibold">{run.tags.length}</div>
              </div>
            </div>

            {/* Tags */}
            {run.tags.length > 0 && (
              <div className="mt-4">
                <TagList tags={run.tags} limit={10} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monitoring Tabs */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Console Monitor */}
          <ConsoleMonitor consoleLogs={run.consoleOutputs} />
          
          {/* Network Monitor */}
          <NetworkMonitor networkLogs={run.networkRequests} />
        </div>

        {/* Storage Monitor */}
        {run.storageData && (
          <StorageMonitor storageData={run.storageData} />
        )}

        {/* System Logs */}
        <Card>
          <CardHeader>
            <CardTitle>System Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <LogViewer 
              logs={run.logs}
              consoleLogs={[]}
              networkLogs={[]}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
