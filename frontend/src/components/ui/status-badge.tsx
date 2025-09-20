import { Badge } from './badge'
import { getStatusColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'success'
      case 'running':
      case 'in_progress':
        return 'info'
      case 'failed':
      case 'error':
        return 'destructive'
      case 'pending':
      case 'queued':
        return 'warning'
      case 'cancelled':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <Badge 
      variant={getVariant(status)} 
      className={cn('capitalize', className)}
    >
      {status}
    </Badge>
  )
}
