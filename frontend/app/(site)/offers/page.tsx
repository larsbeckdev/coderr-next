import { Suspense } from "react"
import type { Metadata } from "next"

import { OfferListView } from "@/components/offers/offer-list-view"

export const metadata: Metadata = {
  title: "Angebote",
  description:
    "Alle Angebote auf Coderr: nach Preis, Lieferzeit und Stichwort filtern.",
}

export default function OffersPage() {
  return (
    <Suspense>
      <OfferListView />
    </Suspense>
  )
}
