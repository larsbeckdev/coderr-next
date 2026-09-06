"use client"

import Link from "next/link"
import { ClockIcon, PackageCheckIcon, SearchIcon, StarIcon } from "lucide-react"

import { StatCard } from "@/components/dashboard/stat-card"
import { EmptyState } from "@/components/empty-state"
import { OfferCard, OfferCardSkeleton } from "@/components/offers/offer-card"
import { Button } from "@/components/ui/button"
import { useOffers } from "@/hooks/use-offers"
import { useOrders } from "@/hooks/use-orders"
import { useReviews } from "@/hooks/use-reviews"
import type { Session } from "@/lib/auth/session"
import { formatDate, formatPrice } from "@/lib/format"
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS } from "@/lib/offer-meta"
import { cn } from "@/lib/utils"

const SUGGESTION_PARAMS = { page_size: 3, ordering: "min_price" } as const

export function CustomerDashboard({ session }: { session: Session }) {
  const { data: orders, isPending: ordersPending } = useOrders()
  const { data: reviews } = useReviews({ reviewer_id: session.userId })
  const { data: suggestions, isPending: suggestionsPending } =
    useOffers(SUGGESTION_PARAMS)

  const inProgress = orders?.filter((order) => order.status === "in_progress")
  const completed = orders?.filter((order) => order.status === "completed")

  return (
    <div className="grid gap-10">
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Laufende Aufträge"
          value={inProgress?.length}
          icon={ClockIcon}
        />
        <StatCard
          label="Abgeschlossen"
          value={completed?.length}
          icon={PackageCheckIcon}
        />
        <StatCard
          label="Bewertungen geschrieben"
          value={reviews?.length}
          icon={StarIcon}
        />
      </section>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-heading text-xl font-bold">Zuletzt beauftragt</h2>
          <Button variant="ghost" size="md" render={<Link href="/orders" />}>
            Alle Aufträge
          </Button>
        </div>

        {ordersPending ? null : !orders || orders.length === 0 ? (
          <EmptyState
            title="Noch nichts beauftragt"
            description="Such dir ein Paket aus – Preis und Lieferzeit stehen vorher fest."
            action={
              <Button size="md" render={<Link href="/offers" />}>
                <SearchIcon data-icon="inline-start" />
                Angebote durchsuchen
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-3">
            {orders.slice(0, 5).map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{order.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)} · {formatPrice(order.price)}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    ORDER_STATUS_CLASSES[order.status]
                  )}
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4">
        <h2 className="font-heading text-xl font-bold">Günstig einsteigen</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {suggestionsPending
            ? Array.from({ length: 3 }, (_, index) => (
                <OfferCardSkeleton key={index} />
              ))
            : (suggestions?.results ?? []).map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
        </div>
      </section>
    </div>
  )
}
