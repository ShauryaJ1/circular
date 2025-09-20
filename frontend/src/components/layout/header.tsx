'use client'

import { Input } from '@/components/ui/input'
import {
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        {title && (
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search tasks, runs, logs..."
            className="pl-10 w-64"
          />
        </div>
      </div>
    </header>
  )
}
