"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/empty-state"
import { OfferForm } from "@/components/offers/offer-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeleteOffer, useOffer } from "@/hooks/use-offers"
import { ApiError } from "@/lib/api/client"
import { useSession } from "@/lib/auth/use-session"
import { offerValuesFrom } from "@/lib/offer-form"

export function OfferEditView({ offerId }: { offerId: number }) {
  const router = useRouter()
  const session = useSession()
  const { data, isPending, isError, error } = useOffer(offerId)
  const deleteOffer = useDeleteOffer()
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false)

  if (isPending) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Angebot nicht gefunden"
        description={error?.message}
        action={
          <LinkButton variant="outline" size="md" href="/offers">
            Zurück zu den Angeboten
          </LinkButton>
        }
      />
    )
  }

  // The API enforces this too, but showing an editor that cannot save is a
  // worse answer than saying so up front.
  if (session?.userId !== data.offer.user) {
    return (
      <EmptyState
        title="Das ist nicht dein Angebot"
        description="Bearbeiten kann ein Angebot nur das Anbieterkonto, das es veröffentlicht hat."
        action={
          <LinkButton variant="outline" size="md" href={`/offers/${offerId}`}>
            Angebot ansehen
          </LinkButton>
        }
      />
    )
  }

  async function confirmDelete() {
    try {
      await deleteOffer.mutateAsync(offerId)
      toast.success("Angebot gelöscht")
      router.push("/dashboard")
    } catch (deleteError) {
      toast.error(
        deleteError instanceof ApiError
          ? deleteError.message
          : "Das Angebot konnte nicht gelöscht werden."
      )
    }
  }

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="font-heading text-3xl font-bold">
            Angebot bearbeiten
          </h1>
          <p className="text-sm text-muted-foreground">
            Änderungen an den Paketen gelten nur für neue Aufträge – bereits
            erteilte Aufträge behalten ihre Konditionen.
          </p>
        </div>

        <Button
          variant="destructive"
          size="md"
          onClick={() => setIsConfirmingDelete(true)}
        >
          <Trash2Icon data-icon="inline-start" />
          Löschen
        </Button>
      </header>

      <OfferForm
        offerId={offerId}
        currentImageUrl={data.offer.image}
        defaultValues={offerValuesFrom(data.offer, data.packages)}
      />

      <AlertDialog
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Angebot löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{data.offer.title}“ und alle drei Pakete werden entfernt. Das
              lässt sich nicht rückgängig machen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteOffer.isPending}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteOffer.isPending}
              onClick={() => void confirmDelete()}
            >
              {deleteOffer.isPending ? "Wird gelöscht…" : "Endgültig löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
