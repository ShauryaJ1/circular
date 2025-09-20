'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { TagList } from '@/components/ui/tag-list'
import { Task } from '@/types'
import { formatRelativeTime, formatDuration, calculateSuccessRate } from '@/lib/utils'
import {
  MagnifyingGlassIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor your browser testing tasks
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No tasks match your filters' 
                  : 'No tasks found. Create your first task to get started.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button className="mt-4">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <StatusBadge status={task.status} />
                      <Link
                        href={`/tasks/${task.id}`}
                        className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                      >
                        {task.name}
                      </Link>
                    </div>
                    
                    {task.description && (
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
                      <span>
                        <strong>{task.totalRuns}</strong> runs
                      </span>
                      <span>
                        <strong>{calculateSuccessRate(task.successfulRuns, task.totalRuns)}%</strong> success rate
                      </span>
                      {task.averageRunTime && task.averageRunTime > 0 && (
                        <span>
                          <strong>{formatDuration(task.averageRunTime)}</strong> avg runtime
                        </span>
                      )}
                      {task.lastRunAt && (
                        <span>
                          Last run {formatRelativeTime(task.lastRunAt)}
                        </span>
                      )}
                    </div>

                    {task.tags.length > 0 && (
                      <TagList tags={task.tags} limit={4} />
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm" title="Run Task">
                      <PlayIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Edit Task">
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Delete Task" className="text-red-600 hover:text-red-700">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination would go here */}
      {filteredTasks.length > 0 && (
        <div className="text-center text-muted-foreground">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      )}
    </div>
  )
}
