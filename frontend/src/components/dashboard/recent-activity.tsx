import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { TagList } from '@/components/ui/tag-list'
import { TaskRun } from '@/types'
import { formatRelativeTime, formatDuration } from '@/lib/utils'

interface RecentActivityProps {
  runs: TaskRun[]
}

export function RecentActivity({ runs }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {runs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No recent activity
          </p>
        ) : (
          runs.map((run) => (
            <div
              key={run.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <StatusBadge status={run.status} />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/runs/${run.id}`}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                    >
                      Run {run.id.substring(0, 8)}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Task: {run.taskId}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(run.startedAt)}
                  </span>
                  {run.duration && (
                    <span className="text-xs text-muted-foreground">
                      Duration: {formatDuration(run.duration)}
                    </span>
                  )}
                </div>
                {run.tags.length > 0 && (
                  <div className="mt-2">
                    <TagList tags={run.tags} limit={3} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {runs.length > 0 && (
          <div className="text-center pt-4">
            <Link
              href="/runs"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all runs →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
