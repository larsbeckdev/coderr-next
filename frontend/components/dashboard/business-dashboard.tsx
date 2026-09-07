"use client"

import Link from "next/link"
import {
  ClockIcon,
  PackageCheckIcon,
  PackageIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
} from "lucide-react"

import { StatCard } from "@/components/dashboard/stat-card"
import { EmptyState } from "@/components/empty-state"
import { LinkButton } from "@/components/ui/link-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessRatings } from "@/hooks/use-business-ratings"
import { useOffers } from "@/hooks/use-offers"
import { useOrderCounts, useOrders } from "@/hooks/use-orders"
import type { Session } from "@/lib/auth/session"
import { formatDeliveryTime, formatPrice, formatRating } from "@/lib/format"

export function BusinessDashboard({ session }: { session: Session }) {
  const { data: counts } = useOrderCounts(session.userId)
  const { data: ratings } = useBusinessRatings()
  const { data: offers, isPending: offersPending } = useOffers({
    creator_id: session.userId,
    page_size: 6,
  })
  const { data: orders } = useOrders()

  const rating = ratings?.get(session.userId)
  const openOrders =
    orders?.filter((order) => order.status === "in_progress") ?? []

  return (
    <div className="grid gap-10">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Laufende Aufträge"
          value={counts?.inProgress}
          icon={ClockIcon}
        />
        <StatCard
          label="Abgeschlossen"
          value={counts?.completed}
          icon={PackageCheckIcon}
        />
        <StatCard
          label="Meine Angebote"
          value={offers?.count}
          icon={PackageIcon}
        />
        <StatCard
          label="Bewertung"
          value={rating ? formatRating(rating.average) : "–"}
          icon={StarIcon}
          hint={
            rating
              ? `${rating.count} ${rating.count === 1 ? "Bewertung" : "Bewertungen"}`
              : "Noch keine Bewertungen"
          }
        />
      </section>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-heading text-xl font-bold">Meine Angebote</h2>
          <LinkButton size="md" href="/offers/new">
            <PlusIcon data-icon="inline-start" />
            Neues Angebot
          </LinkButton>
        </div>

        {offersPending ? (
          <div className="grid gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : !offers || offers.results.length === 0 ? (
          <EmptyState
            title="Noch kein Angebot veröffentlicht"
            description="Mit dem ersten Angebot wirst du in der Suche gefunden."
            action={
              <LinkButton size="md" href="/offers/new">
                Erstes Angebot anlegen
              </LinkButton>
            }
          />
        ) : (
          <ul className="grid gap-3">
            {offers.results.map((offer) => (
              <li
                key={offer.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                {/* Runtime API host, so next/image cannot pre-declare it. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={offer.image ?? "/img/placeholder.jpg"}
                  alt=""
                  className="size-14 shrink-0 rounded-lg object-cover"
                />

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/offers/${offer.id}`}
                    className="truncate font-semibold hover:text-primary"
                  >
                    {offer.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    ab {formatPrice(offer.min_price)} ·{" "}
                    {formatDeliveryTime(offer.min_delivery_time)}
                  </p>
                </div>

                <LinkButton
                  variant="outline"
                  size="md"
                  href={`/offers/${offer.id}/edit`}
                >
                  <PencilIcon data-icon="inline-start" />
                  Bearbeiten
                </LinkButton>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-heading text-xl font-bold">Offene Aufträge</h2>
          <LinkButton variant="ghost" size="md" href="/orders">
            Alle Aufträge
          </LinkButton>
        </div>

        {openOrders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Gerade ist nichts offen.
          </p>
        ) : (
          <ul className="grid gap-3">
            {openOrders.slice(0, 5).map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{order.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDeliveryTime(order.delivery_time_in_days)} ·{" "}
                    {formatPrice(order.price)}
                  </p>
                </div>
                <LinkButton variant="outline" size="md" href="/orders">
                  Status setzen
                </LinkButton>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
