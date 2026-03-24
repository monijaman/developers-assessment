import { createFileRoute } from '@tanstack/react-router'
import WorklogDashboard from '@/components/Worklog/WorklogDashboard'

export const Route = createFileRoute('/_layout/worklogs' as any)({
  component: WorklogDashboardPage,
  head: () => ({
    meta: [
      {
        title: "Worklogs - Payment Dashboard",
      },
    ],
  }),
})

function WorklogDashboardPage() {
  return <WorklogDashboard />
}
