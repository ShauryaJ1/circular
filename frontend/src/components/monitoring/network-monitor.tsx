'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { NetworkLog } from '@/types'
import { formatDate, formatDuration, parseJsonSafely } from '@/lib/utils'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

interface NetworkMonitorProps {
  networkLogs: NetworkLog[]
}

export function NetworkMonitor({ networkLogs }: NetworkMonitorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [expandedRequests, setExpandedRequests] = useState<{ [key: string]: boolean }>({})

  // Group requests and responses
  const groupedRequests = networkLogs.reduce((acc, log) => {
    const key = `${log.url}-${log.timestamp.getTime()}`
    if (!acc[key]) {
      acc[key] = { request: null, response: null }
    }
    if (log.type === 'request') {
      acc[key].request = log
    } else {
      acc[key].response = log
    }
    return acc
  }, {} as { [key: string]: { request: NetworkLog | null, response: NetworkLog | null } })

  const requests = Object.values(groupedRequests)
    .filter(group => group.request || group.response)
    .map(group => ({
      ...group.request,
      ...group.response,
      id: group.request?.id || group.response?.id,
      method: group.request?.method || 'UNKNOWN',
      url: group.request?.url || group.response?.url || '',
      status: group.response?.status,
      statusText: group.response?.statusText,
      duration: group.response?.duration,
      timestamp: group.request?.timestamp || group.response?.timestamp,
      requestHeaders: group.request?.headers,
      responseHeaders: group.response?.headers,
      postData: group.request?.postData,
      responseBody: group.response?.responseBody,
    }))

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.method && request.method.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'success' && request.status && request.status < 400) ||
                         (statusFilter === 'error' && request.status && request.status >= 400) ||
                         (statusFilter === 'pending' && !request.status)
    const matchesMethod = methodFilter === 'all' || request.method === methodFilter
    
    return matchesSearch && matchesStatus && matchesMethod
  })

  const toggleExpanded = (requestId: string) => {
    setExpandedRequests(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }))
  }

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-gray-600 bg-gray-50 border-gray-200'
    if (status < 300) return 'text-green-600 bg-green-50 border-green-200'
    if (status < 400) return 'text-blue-600 bg-blue-50 border-blue-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const exportNetworkLogs = () => {
    const dataStr = JSON.stringify(filteredRequests, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `network-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Network Monitor</CardTitle>
          <Button variant="outline" size="sm" onClick={exportNetworkLogs}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Filter by URL or method..."
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
            <option value="success">Success (2xx-3xx)</option>
            <option value="error">Error (4xx-5xx)</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <FunnelIcon className="h-4 w-4" />
            <span>{filteredRequests.length} requests</span>
          </div>
        </div>

        {/* Request List */}
        <div className="space-y-2">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No network requests found
            </div>
          ) : (
            filteredRequests.map((request) => {
              const isExpanded = expandedRequests[request.id!]
              return (
                <div key={request.id} className="border rounded-lg">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => toggleExpanded(request.id!)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {isExpanded ? (
                          <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                        
                        <Badge variant="outline" className="text-xs">
                          {request.method}
                        </Badge>
                        
                        <Badge className={getStatusColor(request.status)}>
                          {request.status || 'Pending'}
                        </Badge>
                        
                        <span className="text-sm font-mono truncate flex-1 min-w-0">
                          {request.url}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-muted-foreground flex-shrink-0">
                        {request.duration && (
                          <span>{request.duration}ms</span>
                        )}
                        <span>{formatDate(request.timestamp!)}</span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-gray-50 dark:bg-gray-900 p-4 space-y-4">
                      {/* Request Headers */}
                      {request.requestHeaders && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Request Headers</h4>
                          <div className="code-block">
                            {JSON.stringify(request.requestHeaders, null, 2)}
                          </div>
                        </div>
                      )}

                      {/* Request Body */}
                      {request.postData && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Request Body</h4>
                          <div className="code-block">
                            {typeof request.postData === 'string' 
                              ? JSON.stringify(parseJsonSafely(request.postData), null, 2)
                              : JSON.stringify(request.postData, null, 2)
                            }
                          </div>
                        </div>
                      )}

                      {/* Response Headers */}
                      {request.responseHeaders && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Response Headers</h4>
                          <div className="code-block">
                            {JSON.stringify(request.responseHeaders, null, 2)}
                          </div>
                        </div>
                      )}

                      {/* Response Body */}
                      {request.responseBody && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Response Body</h4>
                          <div className="code-block max-h-60 overflow-y-auto">
                            {typeof request.responseBody === 'string'
                              ? JSON.stringify(parseJsonSafely(request.responseBody), null, 2)
                              : JSON.stringify(request.responseBody, null, 2)
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
