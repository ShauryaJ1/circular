'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { TaskList } from '@/components/tasks/task-list'
import { mockTasks } from '@/lib/mock-data'

export default function TasksPage() {
  return (
    <MainLayout>
      <TaskList tasks={mockTasks} />
    </MainLayout>
  )
}
