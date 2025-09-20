'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { TagList } from '@/components/ui/tag-list'
import { TaskRun } from '@/types'
import { formatDate, formatRelativeTime, formatDuration } from '@/lib/utils'
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowPathIcon,
  StopIcon,
} from '@heroicons/react/24/outline'

interface RunListProps {
  runs: TaskRun[]
}

export function RunList({ runs }: RunListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredRuns = runs.filter((run) => {
    const matchesSearch = run.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         run.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         run.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <ArrowPathIcon className="h-4 w-4 animate-spin" />
      case 'completed':
        return null
      case 'failed':
        return null
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Task Runs
          </h1>
          <p className="text-muted-foreground">
            Monitor task execution history and results
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search runs..."
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
          <option value="queued">Queued</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Run List */}
      <div className="space-y-4">
        {filteredRuns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No runs match your filters' 
                  : 'No task runs found.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRuns.map((run) => (
            <Card key={run.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <StatusBadge status={run.status} />
                      {getStatusIcon(run.status)}
                      <Link
                        href={`/runs/${run.id}`}
                        className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        Run {run.id.substring(0, 8)}
                      </Link>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
                      <span>
                        Task: <Link href={`/tasks/${run.taskId}`} className="text-blue-600 hover:underline">{run.taskId}</Link>
                      </span>
                      <span>
                        Started {formatRelativeTime(run.startedAt)}
                      </span>
                      {run.completedAt && (
                        <span>
                          Completed {formatRelativeTime(run.completedAt)}
                        </span>
                      )}
                      {run.duration && (
                        <span>
                          Duration: {formatDuration(run.duration)}
                        </span>
                      )}
                    </div>

                    {run.error && (
                      <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <strong>Error:</strong> {run.error}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
                      <span>
                        {run.logs.length} log entries
                      </span>
                      <span>
                        {run.consoleOutputs.length} console outputs
                      </span>
                      <span>
                        {run.networkRequests.length} network requests
                      </span>
                    </div>

                    {run.tags.length > 0 && (
                      <TagList tags={run.tags} limit={4} />
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/runs/${run.id}`}>
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    {run.status === 'running' && (
                      <Button variant="ghost" size="sm" title="Cancel Run" className="text-red-600 hover:text-red-700">
                        <StopIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {run.status === 'failed' && (
                      <Button variant="ghost" size="sm" title="Retry Run">
                        <ArrowPathIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      {filteredRuns.length > 0 && (
        <div className="text-center text-muted-foreground">
          Showing {filteredRuns.length} of {runs.length} runs
        </div>
      )}
    </div>
  )
}
