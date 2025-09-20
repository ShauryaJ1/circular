import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { TagList } from '@/components/ui/tag-list'
import { Task } from '@/types'
import { formatRelativeTime, formatDuration, calculateSuccessRate } from '@/lib/utils'
import { PlusIcon, PlayIcon } from '@heroicons/react/24/outline'

interface TaskOverviewProps {
  tasks: Task[]
}

export function TaskOverview({ tasks }: TaskOverviewProps) {
  const activeTasks = tasks.filter(task => task.status === 'running')
  const recentTasks = tasks.slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks Overview</CardTitle>
        <Button size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Tasks Summary */}
        {activeTasks.length > 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Currently Running ({activeTasks.length})
            </h4>
            <div className="space-y-2">
              {activeTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="text-sm text-blue-800 dark:text-blue-200 hover:underline"
                  >
                    {task.name}
                  </Link>
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Tasks */}
        <div>
          <h4 className="text-sm font-medium mb-3">Recent Tasks</h4>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={task.status} />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                      >
                        {task.name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {task.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>
                      {task.totalRuns} runs
                    </span>
                    <span>
                      {calculateSuccessRate(task.successfulRuns, task.totalRuns)}% success
                    </span>
                    {task.lastRunAt && (
                      <span>
                        Last: {formatRelativeTime(task.lastRunAt)}
                      </span>
                    )}
                  </div>
                  {task.tags.length > 0 && (
                    <div className="mt-2">
                      <TagList tags={task.tags} limit={2} />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <PlayIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {tasks.length > recentTasks.length && (
          <div className="text-center pt-4">
            <Link
              href="/tasks"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all tasks →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
