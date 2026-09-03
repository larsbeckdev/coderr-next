"use client"

import Link from "next/link"
import { ClockIcon } from "lucide-react"

import { RatingStars } from "@/components/offers/rating-stars"
import { UserAvatar } from "@/components/user-avatar"
import { useBusinessRatings } from "@/hooks/use-business-ratings"
import type { Offer } from "@/lib/api/types"
import { displayName } from "@/lib/auth/use-session"
import { formatDeliveryTime, formatPrice, formatRating } from "@/lib/format"

export function OfferCard({ offer }: { offer: Offer }) {
  const { data: ratings } = useBusinessRatings()
  const rating = ratings?.get(offer.user)
  const provider = displayName(
    offer.user_details.first_name,
    offer.user_details.last_name,
    offer.user_details.username
  )

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">
      <Link
        href={`/offers/${offer.id}`}
        className="relative block aspect-[16/10] overflow-hidden bg-muted"
      >
        {/* Offer images come from the API on a host that is only known at
            runtime, so next/image cannot pre-declare it as a remote pattern. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={offer.image ?? "/img/placeholder.jpg"}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link
          href={`/profile/${offer.user}`}
          className="flex items-center gap-2 text-sm font-medium hover:text-primary"
        >
          <UserAvatar name={provider} size="sm" />
          <span className="truncate">{provider}</span>
        </Link>

        <Link href={`/offers/${offer.id}`} className="flex-1">
          <h3 className="line-clamp-2 text-sm leading-snug font-semibold transition-colors group-hover:text-primary">
            {offer.title}
          </h3>
        </Link>

        {rating ? (
          <div className="flex items-center gap-1.5 text-xs">
            <RatingStars value={rating.average} />
            <span className="font-semibold">{formatRating(rating.average)}</span>
            <span className="text-muted-foreground">({rating.count})</span>
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between border-t border-border pt-3">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ClockIcon className="size-3.5" aria-hidden />
            {formatDeliveryTime(offer.min_delivery_time)}
          </span>
          <span className="text-right">
            <span className="block text-[0.625rem] tracking-wide text-muted-foreground uppercase">
              ab
            </span>
            <span className="font-heading text-lg font-bold">
              {formatPrice(offer.min_price)}
            </span>
          </span>
        </div>
      </div>
    </article>
  )
}

export function OfferCardSkeleton() {
  return (
    <div className="h-full overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-[16/10] animate-pulse bg-muted" />
      <div className="grid gap-3 p-4">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-8 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
