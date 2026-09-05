import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { SessionGate } from "@/components/auth/session-gate"
import { OfferEditView } from "@/components/offers/offer-edit-view"

export const metadata: Metadata = {
  title: "Angebot bearbeiten",
}

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ offerId: string }>
}) {
  const { offerId } = await params
  const id = Number(offerId)

  if (!Number.isInteger(id) || id < 1) {
    notFound()
  }

  return (
    <SessionGate expects="user" requires="business" redirectTo="/offers">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <OfferEditView offerId={id} />
      </div>
    </SessionGate>
  )
}
