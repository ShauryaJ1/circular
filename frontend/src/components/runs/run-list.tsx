import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { TagList } from '@/components/ui/tag-list'
import { TaskRun } from '@/types'
import { formatDate, formatDuration } from '@/lib/utils'

interface RunListProps {
  runs: TaskRun[]
}

export function RunList({ runs }: RunListProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {runs.map((run) => (
          <Card key={run.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-lg">
                    <Link 
                      href={`/runs/${run.id}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Run {run.id.substring(0, 8)}
                    </Link>
                  </CardTitle>
                  <StatusBadge status={run.status} />
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(run.startedAt)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Task Link */}
                <div>
                  <span className="text-sm text-muted-foreground">Task: </span>
                  <Link 
                    href={`/tasks/${run.taskId}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {run.taskId}
                  </Link>
                </div>

                {/* Duration */}
                {run.duration && (
                  <div>
                    <span className="text-sm text-muted-foreground">Duration: </span>
                    <span className="text-sm font-medium">
                      {formatDuration(run.duration)}
                    </span>
                  </div>
                )}

                {/* Error */}
                {run.error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      Error
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      {run.error}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Logs</div>
                    <div className="font-semibold">{run.logs.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Console</div>
                    <div className="font-semibold">{run.consoleOutputs.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Network</div>
                    <div className="font-semibold">{run.networkRequests.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tags</div>
                    <div className="font-semibold">{run.tags.length}</div>
                  </div>
                </div>

                {/* Tags */}
                {run.tags.length > 0 && (
                  <TagList tags={run.tags} limit={5} />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {runs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No test runs found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
