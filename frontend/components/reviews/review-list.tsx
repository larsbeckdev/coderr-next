"use client"

import { RatingStars } from "@/components/offers/rating-stars"
import { UserAvatar } from "@/components/user-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useCustomerProfiles } from "@/hooks/use-profiles"
import { useReviews } from "@/hooks/use-reviews"
import type { Review } from "@/lib/api/types"
import { displayName } from "@/lib/auth/use-session"
import { formatRating, formatRelative } from "@/lib/format"

type ReviewListProps = {
  businessUserId: number
  /** Rendered above the list, e.g. the form for writing a review. */
  children?: React.ReactNode
}

export function ReviewList({ businessUserId, children }: ReviewListProps) {
  const { data: reviews, isPending } = useReviews({
    business_user_id: businessUserId,
    ordering: "-updated_at",
  })

  const average =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null

  return (
    <section className="grid gap-5">
      <header className="flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-xl font-bold">Bewertungen</h2>
        {average !== null ? (
          <span className="flex items-center gap-2 text-sm">
            <RatingStars value={average} />
            <span className="font-semibold">{formatRating(average)}</span>
            <span className="text-muted-foreground">
              ({reviews?.length ?? 0})
            </span>
          </span>
        ) : null}
      </header>

      {children}

      {isPending ? (
        <div className="grid gap-4">
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : !reviews || reviews.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Noch keine Bewertungen.
        </p>
      ) : (
        <ul className="grid gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ul>
      )}
    </section>
  )
}

function ReviewCard({ review }: { review: Review }) {
  // Reviews carry the reviewer id only. The customer profile list is one
  // cached request and covers every reviewer on the page.
  const { data: customers } = useCustomerProfiles()
  const reviewer = customers?.find((profile) => profile.user === review.reviewer)
  const name = reviewer
    ? displayName(reviewer.first_name, reviewer.last_name, reviewer.username)
    : "Kunde"

  return (
    <li className="grid gap-3 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <UserAvatar name={name} src={reviewer?.file} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">
            {formatRelative(review.updated_at)}
          </p>
        </div>
        <RatingStars value={review.rating} />
      </div>

      {review.description ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {review.description}
        </p>
      ) : null}
    </li>
  )
}
