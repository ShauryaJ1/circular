import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

export function getLogLevelColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'warn':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'info':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'debug':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    case 'log':
      return 'text-green-600 bg-green-50 border-green-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function parseJsonSafely(jsonString: string): any {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    return null
  }
}
