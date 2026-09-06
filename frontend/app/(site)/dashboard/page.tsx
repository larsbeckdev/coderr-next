import type { Metadata } from "next"

import { SessionGate } from "@/components/auth/session-gate"
import { DashboardView } from "@/components/dashboard/dashboard-view"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default function DashboardPage() {
  return (
    <SessionGate expects="user" redirectTo="/login">
      <DashboardView />
    </SessionGate>
  )
}
