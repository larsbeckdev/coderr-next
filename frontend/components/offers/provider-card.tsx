"use client"

import {
  ClockIcon,
  MapPinIcon,
  PackageCheckIcon,
  PhoneIcon,
} from "lucide-react"

import { RatingStars } from "@/components/offers/rating-stars"
import { LinkButton } from "@/components/ui/link-button"
import { UserAvatar } from "@/components/user-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessRatings } from "@/hooks/use-business-ratings"
import { useOrderCounts } from "@/hooks/use-orders"
import { useProfile } from "@/hooks/use-profiles"
import { displayName } from "@/lib/auth/use-session"
import { formatRating } from "@/lib/format"

/**
 * Everything about a provider that helps decide whether to book them, pulled
 * from the three endpoints that carry it: the profile, the reviews and the
 * two order counters.
 */
export function ProviderCard({ userId }: { userId: number }) {
  const { data: profile, isPending } = useProfile(userId)
  const { data: ratings } = useBusinessRatings()
  const { data: counts } = useOrderCounts(userId)
  const rating = ratings?.get(userId)

  if (isPending) {
    return (
      <div className="grid gap-3 rounded-xl border border-border bg-card p-5">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const name = displayName(
    profile.first_name,
    profile.last_name,
    profile.username
  )

  return (
    <aside className="grid gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <UserAvatar name={name} src={profile.file} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-heading font-semibold">{name}</p>
          <p className="truncate text-xs text-muted-foreground">
            @{profile.username}
          </p>
        </div>
      </div>

      {rating ? (
        <div className="flex items-center gap-2 text-sm">
          <RatingStars value={rating.average} />
          <span className="font-semibold">{formatRating(rating.average)}</span>
          <span className="text-muted-foreground">
            ({rating.count} {rating.count === 1 ? "Bewertung" : "Bewertungen"})
          </span>
        </div>
      ) : null}

      {profile.description ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {profile.description}
        </p>
      ) : null}

      <dl className="grid gap-2 border-t border-border pt-4 text-sm">
        {profile.location ? (
          <ProviderFact
            icon={MapPinIcon}
            label="Ort"
            value={profile.location}
          />
        ) : null}
        {profile.working_hours ? (
          <ProviderFact
            icon={ClockIcon}
            label="Arbeitszeiten"
            value={profile.working_hours}
          />
        ) : null}
        {profile.tel ? (
          <ProviderFact icon={PhoneIcon} label="Telefon" value={profile.tel} />
        ) : null}
        {counts ? (
          <ProviderFact
            icon={PackageCheckIcon}
            label="Aufträge"
            value={`${counts.completed} abgeschlossen · ${counts.inProgress} laufend`}
          />
        ) : null}
      </dl>

      <LinkButton
        variant="outline"
        size="md"
        className="w-full"
        href={`/profile/${userId}`}
      >
        Profil ansehen
      </LinkButton>
    </aside>
  )
}

function ProviderFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPinIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <dt className="sr-only">{label}</dt>
      <dd className="text-muted-foreground">{value}</dd>
    </div>
  )
}
