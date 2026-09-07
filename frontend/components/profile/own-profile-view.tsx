"use client"

import { ExternalLinkIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { ProfileForm } from "@/components/profile/profile-form"
import { LinkButton } from "@/components/ui/link-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useOwnProfile } from "@/hooks/use-profiles"

export function OwnProfileView() {
  const { data: profile, isPending, isError, error } = useOwnProfile()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="font-heading text-3xl font-bold">Mein Profil</h1>
          <p className="text-sm text-muted-foreground">
            Diese Angaben sehen andere Nutzer auf deiner Profilseite.
          </p>
        </div>

        {profile ? (
          <LinkButton
            variant="outline"
            size="md"
            href={`/profile/${profile.user}`}
          >
            <ExternalLinkIcon data-icon="inline-start" />
            Öffentliche Ansicht
          </LinkButton>
        ) : null}
      </header>

      {isPending ? (
        <div className="grid gap-6">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : isError || !profile ? (
        <EmptyState
          title="Profil konnte nicht geladen werden"
          description={error?.message}
        />
      ) : (
        <ProfileForm profile={profile} />
      )}
    </div>
  )
}
