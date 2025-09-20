'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { SolutionList } from '@/components/solutions/solution-list'
import { mockSolutions } from '@/lib/mock-data'

export default function SolutionsPage() {
  return (
    <MainLayout title="Solutions">
      <SolutionList solutions={mockSolutions} />
    </MainLayout>
  )
}