"use client"

import { ChevronLeftIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { OfferPackages } from "@/components/offers/offer-packages"
import { ProviderCard } from "@/components/offers/provider-card"
import { ReviewList } from "@/components/reviews/review-list"
import { LinkButton } from "@/components/ui/link-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useOffer } from "@/hooks/use-offers"
import { formatDate } from "@/lib/format"

export function OfferDetailView({ offerId }: { offerId: number }) {
  const { data, isPending, isError, error } = useOffer(offerId)

  if (isPending) {
    return (
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-4">
          <Skeleton className="aspect-[16/9] w-full rounded-xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Angebot nicht gefunden"
          description={error?.message}
          action={
            <LinkButton variant="outline" size="md" href="/offers">
              Zurück zu den Angeboten
            </LinkButton>
          }
        />
      </div>
    )
  }

  const { offer, packages } = data

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6">
      <LinkButton variant="ghost" size="md" href="/offers">
        <ChevronLeftIcon data-icon="inline-start" />
        Alle Angebote
      </LinkButton>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="grid gap-8">
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            {/* The API host is only known at runtime, so next/image cannot
                declare it as a remote pattern. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={offer.image ?? "/img/placeholder.jpg"}
              alt=""
              className="aspect-[16/9] w-full object-cover"
            />
          </div>

          <header className="grid gap-2">
            <h1 className="font-heading text-3xl leading-tight font-bold">
              {offer.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              Zuletzt aktualisiert am {formatDate(offer.updated_at)}
            </p>
          </header>

          {offer.description ? (
            <section className="grid gap-3">
              <h2 className="font-heading text-xl font-bold">Beschreibung</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {offer.description}
              </p>
            </section>
          ) : null}

          <ReviewList businessUserId={offer.user} />
        </div>

        <div className="grid gap-6 lg:sticky lg:top-24">
          <OfferPackages offer={offer} packages={packages} />
          <ProviderCard userId={offer.user} />
        </div>
      </div>
    </div>
  )
}
