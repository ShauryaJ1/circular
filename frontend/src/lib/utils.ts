import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM dd, yyyy HH:mm:ss')
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'success':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'running':
    case 'in_progress':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'failed':
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'pending':
    case 'queued':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'cancelled':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getLogLevelColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'error':
      return 'text-red-600'
    case 'warn':
      return 'text-yellow-600'
    case 'info':
      return 'text-blue-600'
    case 'debug':
      return 'text-purple-600'
    default:
      return 'text-gray-600'
  }
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function parseJsonSafely(json: string): any {
  try {
    return JSON.parse(json)
  } catch {
    return json
  }
}

export function calculateSuccessRate(successful: number, total: number): number {
  if (total === 0) return 0
  return Math.round((successful / total) * 100)
}
