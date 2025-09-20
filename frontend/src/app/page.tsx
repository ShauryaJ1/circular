'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { TaskOverview } from '@/components/dashboard/task-overview'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { mockTasks, mockRuns, mockDashboardStats } from '@/lib/mock-data'

export default function DashboardPage() {
  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <StatsCards stats={mockDashboardStats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Overview - Takes 2 columns */}
          <div className="lg:col-span-2">
            <TaskOverview tasks={mockTasks} />
          </div>

          {/* Recent Activity - Takes 1 column */}
          <div>
            <RecentActivity runs={mockDashboardStats.recentActivity} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
