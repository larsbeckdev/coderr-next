"use client"

import { BusinessDashboard } from "@/components/dashboard/business-dashboard"
import { CustomerDashboard } from "@/components/dashboard/customer-dashboard"
import { useOwnProfile } from "@/hooks/use-profiles"
import { displayName, useSession } from "@/lib/auth/use-session"

export function DashboardView() {
  const session = useSession()
  const { data: profile } = useOwnProfile()

  if (!session) {
    return null
  }

  const name = profile
    ? displayName(profile.first_name, profile.last_name, profile.username)
    : session.username

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:px-6">
      <header className="grid gap-1">
        <h1 className="font-heading text-3xl font-bold">Hallo {name}</h1>
        <p className="text-sm text-muted-foreground">
          {session.type === "business"
            ? "Deine Angebote und alles, was gerade hereinkommt."
            : "Deine Aufträge auf einen Blick."}
        </p>
      </header>

      {session.type === "business" ? (
        <BusinessDashboard session={session} />
      ) : (
        <CustomerDashboard session={session} />
      )}
    </div>
  )
}
