import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                Circular
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/logs"
              className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logs
            </Link>
            <Link
              href="/runs"
              className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
            >
              Runs
            </Link>
            <Link
              href="/solutions"
              className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
            >
              Solutions
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
