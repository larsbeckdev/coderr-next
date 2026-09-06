"use client"

import * as React from "react"
import Link from "next/link"
import { ClockIcon, MapPinIcon, PhoneIcon, StarIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { OfferCard, OfferCardSkeleton } from "@/components/offers/offer-card"
import { RatingStars } from "@/components/offers/rating-stars"
import { ReviewDialog } from "@/components/reviews/review-dialog"
import { ReviewList } from "@/components/reviews/review-list"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessRatings } from "@/hooks/use-business-ratings"
import { useOffers } from "@/hooks/use-offers"
import { useOrderCounts } from "@/hooks/use-orders"
import { useProfile } from "@/hooks/use-profiles"
import { useReviews } from "@/hooks/use-reviews"
import { displayName, useSession } from "@/lib/auth/use-session"
import { formatDate, formatRating } from "@/lib/format"
import { PROFILE_TYPE_LABELS } from "@/lib/offer-meta"

export function PublicProfileView({ userId }: { userId: number }) {
  const session = useSession()
  const { data: profile, isPending, isError, error } = useProfile(userId)
  const [isReviewing, setIsReviewing] = React.useState(false)

  if (isPending) {
    return (
      <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState title="Profil nicht gefunden" description={error?.message} />
      </div>
    )
  }

  const name = displayName(profile.first_name, profile.last_name, profile.username)
  const isBusiness = profile.type === "business"
  const isOwnProfile = session?.userId === userId
  const canReview = session?.type === "customer" && isBusiness && !isOwnProfile

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-10 px-4 py-10 sm:px-6">
      <header className="grid gap-5 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start gap-5">
          <UserAvatar name={name} src={profile.file} size="lg" className="size-20" />

          <div className="min-w-0 flex-1 grid gap-1">
            <h1 className="font-heading text-2xl font-bold">{name}</h1>
            <p className="text-sm text-muted-foreground">
              @{profile.username} · {PROFILE_TYPE_LABELS[profile.type]} · dabei
              seit {formatDate(profile.created_at)}
            </p>
            {isBusiness ? <ProviderRating userId={userId} /> : null}
          </div>

          {isOwnProfile ? (
            <Button variant="outline" size="md" render={<Link href="/profile" />}>
              Profil bearbeiten
            </Button>
          ) : canReview ? (
            <Button size="md" onClick={() => setIsReviewing(true)}>
              <StarIcon data-icon="inline-start" />
              Bewerten
            </Button>
          ) : null}
        </div>

        {profile.description ? (
          <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
            {profile.description}
          </p>
        ) : null}

        {isBusiness ? <ProviderFacts profile={profile} userId={userId} /> : null}
      </header>

      {isBusiness ? (
        <>
          <ProviderOffers userId={userId} name={name} />
          <ReviewList businessUserId={userId} />
        </>
      ) : null}

      {canReview && isReviewing ? (
        <ReviewDialogForProvider
          onOpenChange={setIsReviewing}
          userId={userId}
          name={name}
        />
      ) : null}
    </div>
  )
}

function ProviderRating({ userId }: { userId: number }) {
  const { data: ratings } = useBusinessRatings()
  const rating = ratings?.get(userId)

  if (!rating) {
    return null
  }

  return (
    <p className="flex items-center gap-2 text-sm">
      <RatingStars value={rating.average} />
      <span className="font-semibold">{formatRating(rating.average)}</span>
      <span className="text-muted-foreground">
        ({rating.count} {rating.count === 1 ? "Bewertung" : "Bewertungen"})
      </span>
    </p>
  )
}

function ProviderFacts({
  profile,
  userId,
}: {
  profile: { location: string; tel: string; working_hours: string }
  userId: number
}) {
  const { data: counts } = useOrderCounts(userId)

  const facts = [
    profile.location ? { icon: MapPinIcon, value: profile.location } : null,
    profile.working_hours
      ? { icon: ClockIcon, value: profile.working_hours }
      : null,
    profile.tel ? { icon: PhoneIcon, value: profile.tel } : null,
  ].filter((fact) => fact !== null)

  if (facts.length === 0 && !counts) {
    return null
  }

  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
      {facts.map((fact) => (
        <div key={fact.value} className="flex items-center gap-1.5">
          <fact.icon className="size-4" aria-hidden />
          <dd>{fact.value}</dd>
        </div>
      ))}
      {counts ? (
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Aufträge</dt>
          <dd>
            {counts.completed} abgeschlossen · {counts.inProgress} laufend
          </dd>
        </div>
      ) : null}
    </dl>
  )
}

function ProviderOffers({ userId, name }: { userId: number; name: string }) {
  const { data, isPending } = useOffers({ creator_id: userId, page_size: 6 })
  const offers = data?.results ?? []

  return (
    <section className="grid gap-5">
      <h2 className="font-heading text-xl font-bold">
        Angebote von {name}
        {data ? (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({data.count})
          </span>
        ) : null}
      </h2>

      {isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <OfferCardSkeleton key={index} />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Dieses Konto hat noch keine Angebote veröffentlicht.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * Loads the review this customer may already have written, so the dialog
 * edits it instead of running into the one-review-per-provider constraint.
 */
function ReviewDialogForProvider({
  onOpenChange,
  userId,
  name,
}: {
  onOpenChange: (open: boolean) => void
  userId: number
  name: string
}) {
  const session = useSession()
  const { data: ownReviews } = useReviews(
    session ? { reviewer_id: session.userId, business_user_id: userId } : {}
  )

  return (
    <ReviewDialog
      open
      onOpenChange={onOpenChange}
      businessUserId={userId}
      businessUserName={name}
      review={ownReviews?.[0] ?? null}
    />
  )
}
