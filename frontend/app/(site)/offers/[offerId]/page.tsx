import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { SessionGate } from "@/components/auth/session-gate"
import { OfferDetailView } from "@/components/offers/offer-detail-view"

export const metadata: Metadata = {
  title: "Angebot",
}

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ offerId: string }>
}) {
  const { offerId } = await params
  const id = Number(offerId)

  if (!Number.isInteger(id) || id < 1) {
    notFound()
  }

  // The list endpoint is public, the detail endpoint is not - so browsing is
  // open but opening a single offer asks for an account.
  return (
    <SessionGate expects="user" redirectTo="/login">
      <OfferDetailView offerId={id} />
    </SessionGate>
  )
}
