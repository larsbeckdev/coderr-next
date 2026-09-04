"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { EmptyState } from "@/components/empty-state"
import { OfferCard, OfferCardSkeleton } from "@/components/offers/offer-card"
import { OfferFilters } from "@/components/offers/offer-filters"
import { PaginationBar } from "@/components/pagination-bar"
import { Button } from "@/components/ui/button"
import { useOffers } from "@/hooks/use-offers"
import { OFFERS_PAGE_SIZE, readOfferParams } from "@/lib/offer-search-params"

export function OfferListView() {
  const searchParams = useSearchParams()
  const params = readOfferParams(searchParams)
  const { data, isPending, isError, error } = useOffers(params)

  const offers = data?.results ?? []
  const page = params.page ?? 1
  const pageCount = data ? Math.max(1, Math.ceil(data.count / OFFERS_PAGE_SIZE)) : 1

  return (
    <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-10 sm:px-6">
      <header className="grid gap-1">
        <h1 className="font-heading text-3xl font-bold">Angebote</h1>
        <p className="text-sm text-muted-foreground">
          Alle Leistungen mit festem Preis, fester Lieferzeit und einer festen
          Zahl an Überarbeitungen.
        </p>
      </header>

      <OfferFilters resultCount={data?.count} />

      {isError ? (
        <EmptyState
          title="Die Angebote konnten nicht geladen werden"
          description={error.message}
        />
      ) : isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: OFFERS_PAGE_SIZE }, (_, index) => (
            <OfferCardSkeleton key={index} />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <EmptyState
          title="Dazu haben wir nichts gefunden"
          description="Versuche einen anderen Suchbegriff oder setze die Filter zurück."
          action={
            <Button variant="outline" size="md" render={<Link href="/offers" />}>
              Alle Angebote zeigen
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
          <PaginationBar page={page} pageCount={pageCount} />
        </>
      )}
    </div>
  )
}
