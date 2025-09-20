'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BrowserLog } from '@/types'
import { formatDate, getLogLevelColor } from '@/lib/utils'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'

interface ConsoleMonitorProps {
  consoleLogs: BrowserLog[]
}

export function ConsoleMonitor({ consoleLogs }: ConsoleMonitorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [expandedLogs, setExpandedLogs] = useState<{ [key: string]: boolean }>({})

  const filteredLogs = consoleLogs.filter(log => {
    const matchesSearch = log.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === 'all' || log.type === levelFilter
    return matchesSearch && matchesLevel
  })

  const toggleExpanded = (logId: string) => {
    setExpandedLogs(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }))
  }

  const exportConsoleLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `console-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '❌'
      case 'warn':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      case 'debug':
        return '🐛'
      default:
        return '📝'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Console Monitor</CardTitle>
          <Button variant="outline" size="sm" onClick={exportConsoleLogs}>
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
              placeholder="Filter console messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="log">Log</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <FunnelIcon className="h-4 w-4" />
            <span>{filteredLogs.length} messages</span>
          </div>
        </div>

        {/* Console Log List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No console messages found
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogs[log.id]
              const hasArgs = log.args && log.args.length > 0
              
              return (
                <div key={log.id} className={`log-entry ${log.type} border rounded-lg`}>
                  <div
                    className={`p-3 ${hasArgs ? 'cursor-pointer hover:bg-opacity-80' : ''}`}
                    onClick={() => hasArgs && toggleExpanded(log.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {hasArgs && (
                          <div className="flex-shrink-0 mt-0.5">
                            {isExpanded ? (
                              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        )}
                        
                        <div className="flex-shrink-0">
                          <span className="text-sm mr-2">{getTypeIcon(log.type)}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getLogLevelColor(log.type)}`}
                            >
                              {log.type.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(log.timestamp)}
                            </span>
                          </div>
                          
                          <div className="text-sm font-mono break-words">
                            {log.text}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Arguments */}
                    {isExpanded && hasArgs && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs font-medium text-muted-foreground mb-2">
                          Arguments:
                        </h4>
                        <div className="code-block">
                          {log.args?.map((arg, index) => (
                            <div key={index} className="mb-2">
                              <span className="text-xs text-muted-foreground">
                                [{index}]:
                              </span>
                              <div className="ml-4">
                                {typeof arg === 'object' 
                                  ? JSON.stringify(arg, null, 2)
                                  : String(arg)
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Summary Stats */}
        {filteredLogs.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex space-x-4">
                <span>Total: {filteredLogs.length}</span>
                <span>Errors: {filteredLogs.filter(l => l.type === 'error').length}</span>
                <span>Warnings: {filteredLogs.filter(l => l.type === 'warn').length}</span>
                <span>Info: {filteredLogs.filter(l => l.type === 'info').length}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
