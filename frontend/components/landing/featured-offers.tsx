"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { OfferCard, OfferCardSkeleton } from "@/components/offers/offer-card"
import { Button } from "@/components/ui/button"
import { useOffers } from "@/hooks/use-offers"

const FEATURED_PARAMS = { page_size: 4, ordering: "-updated_at" } as const

export function FeaturedOffers() {
  const { data, isPending } = useOffers(FEATURED_PARAMS)
  const offers = data?.results ?? []

  if (!isPending && offers.length === 0) {
    return null
  }

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold">Neu auf Coderr</h2>
          <p className="text-sm text-muted-foreground">
            Die zuletzt veröffentlichten Angebote.
          </p>
        </div>
        <Button variant="ghost" size="md" render={<Link href="/offers" />}>
          Alle ansehen
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isPending
          ? Array.from({ length: 4 }, (_, index) => <OfferCardSkeleton key={index} />)
          : offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
      </div>
    </section>
  )
}
