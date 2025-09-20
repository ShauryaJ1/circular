'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { RunList } from '@/components/runs/run-list'
import { mockRuns } from '@/lib/mock-data'

export default function RunsPage() {
  return (
    <MainLayout>
      <RunList runs={mockRuns} />
    </MainLayout>
  )
}
