import { Badge } from './badge'
import { cn } from '@/lib/utils'

interface TagListProps {
  tags: string[]
  limit?: number
  className?: string
}

export function TagList({ tags, limit = 3, className }: TagListProps) {
  const displayTags = tags.slice(0, limit)
  const remainingCount = tags.length - limit

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {displayTags.map((tag, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="text-xs"
        >
          {tag}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount}
        </Badge>
      )}
    </div>
  )
}
