'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  PlayCircleIcon,
  ClipboardDocumentListIcon,
  BugAntIcon,
  CogIcon,
  LightBulbIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Tasks', href: '/tasks', icon: PlayCircleIcon },
  { name: 'Runs', href: '/runs', icon: ClipboardDocumentListIcon },
  { name: 'Logs', href: '/logs', icon: BugAntIcon },
  { name: 'Solutions', href: '/solutions', icon: LightBulbIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn('flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800', className)}>
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Circular
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'sidebar-nav-item',
                isActive && 'active'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <div className="text-xs text-gray-500 dark:text-slate-400">
          Circular v1.0.0
          <br />
          Agentic Browser Testing
        </div>
      </div>
    </div>
  )
}
