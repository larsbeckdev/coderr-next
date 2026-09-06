import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { SessionGate } from "@/components/auth/session-gate"
import { PublicProfileView } from "@/components/profile/public-profile-view"

export const metadata: Metadata = {
  title: "Profil",
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const id = Number(userId)

  if (!Number.isInteger(id) || id < 1) {
    notFound()
  }

  // Reading a profile needs a token, so the route is gated like the offer
  // detail it is usually reached from.
  return (
    <SessionGate expects="user" redirectTo="/login">
      <PublicProfileView userId={id} />
    </SessionGate>
  )
}
