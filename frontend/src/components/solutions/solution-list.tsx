'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TagList } from '@/components/ui/tag-list'
import { Solution } from '@/types'
import { formatRelativeTime, truncateText } from '@/lib/utils'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface SolutionListProps {
  solutions: Solution[]
}

export function SolutionList({ solutions }: SolutionListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'effectiveness' | 'usage'>('recent')

  const filteredAndSortedSolutions = solutions
    .filter((solution) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        solution.title.toLowerCase().includes(searchLower) ||
        solution.description.toLowerCase().includes(searchLower) ||
        solution.issue.toLowerCase().includes(searchLower) ||
        solution.solution.toLowerCase().includes(searchLower) ||
        solution.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'effectiveness':
          return b.effectiveness - a.effectiveness
        case 'usage':
          return b.usageCount - a.usageCount
        case 'recent':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (effectiveness >= 75) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (effectiveness >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const renderStars = (effectiveness: number) => {
    const stars = Math.round(effectiveness / 20) // Convert to 5-star scale
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          i < stars ? (
            <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={i} className="h-4 w-4 text-gray-300" />
          )
        ))}
        <span className="ml-1 text-xs text-muted-foreground">
          ({effectiveness}%)
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Solutions
          </h1>
          <p className="text-muted-foreground">
            Knowledge base of solutions to common problems and issues
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Solution
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search solutions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="recent">Most Recent</option>
          <option value="effectiveness">Highest Effectiveness</option>
          <option value="usage">Most Used</option>
        </select>
      </div>

      {/* Solutions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAndSortedSolutions.length === 0 ? (
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'No solutions match your search' 
                    : 'No solutions found. Create your first solution to build your knowledge base.'
                  }
                </p>
                {!searchTerm && (
                  <Button className="mt-4">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Solution
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredAndSortedSolutions.map((solution) => (
            <Card key={solution.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-2">
                      <Link
                        href={`/solutions/${solution.id}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
                      >
                        {solution.title}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {solution.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button variant="ghost" size="sm">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Issue Summary */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Issue:
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {solution.issue}
                  </p>
                </div>

                {/* Solution Preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Solution:
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {truncateText(solution.solution, 150)}
                  </p>
                </div>

                {/* Tags */}
                {solution.tags.length > 0 && (
                  <div className="mb-4">
                    <TagList tags={solution.tags} limit={3} />
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-4">
                    <span>Used {solution.usageCount} times</span>
                    <span>Updated {formatRelativeTime(solution.updatedAt)}</span>
                  </div>
                </div>

                {/* Effectiveness Rating */}
                <div className="flex items-center justify-between">
                  <div>
                    {renderStars(solution.effectiveness)}
                  </div>
                  <Badge className={getEffectivenessColor(solution.effectiveness)}>
                    {solution.effectiveness}% effective
                  </Badge>
                </div>

                {/* Related Tasks */}
                {solution.relatedTaskIds.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Related to {solution.relatedTaskIds.length} task(s)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      {filteredAndSortedSolutions.length > 0 && (
        <div className="text-center text-muted-foreground">
          Showing {filteredAndSortedSolutions.length} of {solutions.length} solutions
        </div>
      )}
    </div>
  )
}
