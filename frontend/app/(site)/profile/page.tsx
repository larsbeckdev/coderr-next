import type { Metadata } from "next"

import { SessionGate } from "@/components/auth/session-gate"
import { OwnProfileView } from "@/components/profile/own-profile-view"

export const metadata: Metadata = {
  title: "Mein Profil",
}

export default function OwnProfilePage() {
  return (
    <SessionGate expects="user" redirectTo="/login">
      <OwnProfileView />
    </SessionGate>
  )
}
