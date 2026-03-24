import { createFileRoute } from "@tanstack/react-router"

import useAuth from "@/hooks/useAuth"
import { useState } from "react"
import WorklogDashboard from "@/components/Worklog/WorklogDashboard"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({
    meta: [
      {
        title: "Dashboard - FastAPI Cloud",
      },
    ],
  }),
})

function Dashboard() {
  const { user: currentUser } = useAuth()
  const [showWorklogs, setShowWorklogs] = useState(false)

  if (showWorklogs) {
    return (
      <div>
        <button
          onClick={() => setShowWorklogs(false)}
          className="mb-4 text-blue-600 hover:text-blue-900 font-medium"
        >
          ← Back to Dashboard
        </button>
        <WorklogDashboard />
      </div>
    )
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl truncate max-w-sm">
          Hi, {currentUser?.full_name || currentUser?.email} 👋
        </h1>
        <p className="text-muted-foreground">
          Welcome back, nice to see you again!!!
        </p>
      </div>
          <div className="mt-8">
            <button
              onClick={() => setShowWorklogs(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              View Worklog Payment Dashboard →
            </button>
          </div>
    </div>
  )
}
