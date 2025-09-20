'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StorageData } from '@/types'
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

interface StorageMonitorProps {
  storageData: StorageData
}

export function StorageMonitor({ storageData }: StorageMonitorProps) {
  const [activeTab, setActiveTab] = useState<'localStorage' | 'sessionStorage' | 'cookies'>('localStorage')
  const [searchTerm, setSearchTerm] = useState('')

  const tabs = [
    { id: 'localStorage' as const, label: 'Local Storage', count: Object.keys(storageData.localStorage).length },
    { id: 'sessionStorage' as const, label: 'Session Storage', count: Object.keys(storageData.sessionStorage).length },
    { id: 'cookies' as const, label: 'Cookies', count: storageData.cookies.length },
  ]

  const exportStorageData = () => {
    const dataStr = JSON.stringify(storageData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `storage-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const renderStorageItems = (storage: Record<string, string>, type: 'localStorage' | 'sessionStorage') => {
    const items = Object.entries(storage).filter(([key, value]) => 
      key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'No items match your search' : `No ${type} items found`}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {items.map(([key, value]) => (
          <div key={key} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {type === 'localStorage' ? 'Local' : 'Session'}
                </Badge>
                <span className="font-medium text-sm">{key}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" title="Edit">
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Delete" className="text-red-600 hover:text-red-700">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="code-block">
              <div className="text-xs text-muted-foreground mb-1">Value:</div>
              <div className="font-mono text-sm break-all">
                {typeof value === 'string' && value.length > 200 
                  ? `${value.substring(0, 200)}...` 
                  : value
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderCookies = () => {
    const filteredCookies = storageData.cookies.filter(cookie =>
      cookie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cookie.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cookie.domain && cookie.domain.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (filteredCookies.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'No cookies match your search' : 'No cookies found'}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {filteredCookies.map((cookie, index) => (
          <div key={`${cookie.name}-${index}`} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">Cookie</Badge>
                <span className="font-medium text-sm">{cookie.name}</span>
                {cookie.httpOnly && (
                  <Badge variant="secondary" className="text-xs">HttpOnly</Badge>
                )}
                {cookie.secure && (
                  <Badge variant="secondary" className="text-xs">Secure</Badge>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" title="Edit">
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Delete" className="text-red-600 hover:text-red-700">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Value:</div>
                <div className="code-block">
                  {cookie.value.length > 100 
                    ? `${cookie.value.substring(0, 100)}...` 
                    : cookie.value
                  }
                </div>
              </div>
              
              <div className="space-y-2">
                {cookie.domain && (
                  <div>
                    <span className="text-xs text-muted-foreground">Domain: </span>
                    <span className="font-mono text-xs">{cookie.domain}</span>
                  </div>
                )}
                {cookie.path && (
                  <div>
                    <span className="text-xs text-muted-foreground">Path: </span>
                    <span className="font-mono text-xs">{cookie.path}</span>
                  </div>
                )}
                {cookie.expires && (
                  <div>
                    <span className="text-xs text-muted-foreground">Expires: </span>
                    <span className="font-mono text-xs">
                      {new Date(cookie.expires * 1000).toLocaleString()}
                    </span>
                  </div>
                )}
                {cookie.sameSite && (
                  <div>
                    <span className="text-xs text-muted-foreground">SameSite: </span>
                    <span className="font-mono text-xs">{cookie.sameSite}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Storage Monitor</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            <Button variant="outline" size="sm" onClick={exportStorageData}>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder={`Search ${activeTab === 'cookies' ? 'cookies' : 'storage items'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {activeTab === 'localStorage' && renderStorageItems(storageData.localStorage, 'localStorage')}
          {activeTab === 'sessionStorage' && renderStorageItems(storageData.sessionStorage, 'sessionStorage')}
          {activeTab === 'cookies' && renderCookies()}
        </div>
      </CardContent>
    </Card>
  )
}
