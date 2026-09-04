"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckIcon,
  ClockIcon,
  LogInIcon,
  PencilIcon,
  RefreshCwIcon,
  ShoppingCartIcon,
} from "lucide-react"
import { toast } from "sonner"

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
import { useCreateOrder } from "@/hooks/use-orders"
import { ApiError } from "@/lib/api/client"
import type { OfferPackage, OfferRetrieve } from "@/lib/api/types"
import { OFFER_TYPES } from "@/lib/api/types"
import { useSession } from "@/lib/auth/use-session"
import { formatDeliveryTime, formatPrice, formatRevisions } from "@/lib/format"
import { OFFER_TYPE_LABELS } from "@/lib/offer-meta"
import { cn } from "@/lib/utils"

type OfferPackagesProps = {
  offer: OfferRetrieve
  packages: OfferPackage[]
}

/** Cheapest first, whatever order the API returned the packages in. */
function sortPackages(packages: OfferPackage[]): OfferPackage[] {
  return [...packages].sort(
    (a, b) => OFFER_TYPES.indexOf(a.offer_type) - OFFER_TYPES.indexOf(b.offer_type)
  )
}

export function OfferPackages({ offer, packages }: OfferPackagesProps) {
  const router = useRouter()
  const session = useSession()
  const createOrder = useCreateOrder()
  const sorted = sortPackages(packages)

  const [selectedId, setSelectedId] = React.useState(sorted[0]?.id)
  const [isConfirming, setIsConfirming] = React.useState(false)
  const selected = sorted.find((entry) => entry.id === selectedId) ?? sorted[0]

  if (!selected) {
    return (
      <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Zu diesem Angebot sind noch keine Pakete hinterlegt.
      </p>
    )
  }

  const isOwner = session?.userId === offer.user

  async function confirmOrder() {
    try {
      await createOrder.mutateAsync(selected.id)
      setIsConfirming(false)
      toast.success("Auftrag erteilt", {
        description: `${selected.title} · ${formatPrice(selected.price)}`,
        action: { label: "Zu den Aufträgen", onClick: () => router.push("/orders") },
      })
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Der Auftrag konnte nicht angelegt werden."
      toast.error(message)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div
        role="tablist"
        aria-label="Paket wählen"
        className="grid grid-cols-3 border-b border-border"
      >
        {sorted.map((entry) => {
          const isActive = entry.id === selected.id
          return (
            <button
              key={entry.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setSelectedId(entry.id)}
              className={cn(
                "border-b-2 px-3 py-3 text-sm font-semibold transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {OFFER_TYPE_LABELS[entry.offer_type]}
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-heading text-lg font-semibold">{selected.title}</h2>
          <p className="font-heading text-2xl font-bold whitespace-nowrap">
            {formatPrice(selected.price)}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ClockIcon className="size-4" aria-hidden />
            {formatDeliveryTime(selected.delivery_time_in_days)}
          </span>
          <span className="flex items-center gap-1.5">
            <RefreshCwIcon className="size-4" aria-hidden />
            {formatRevisions(selected.revisions)}
          </span>
        </div>

        {selected.features.length > 0 ? (
          <ul className="grid gap-2 border-t border-border pt-4">
            {selected.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <CheckIcon
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                {feature}
              </li>
            ))}
          </ul>
        ) : null}

        <OrderAction
          isOwner={isOwner}
          offerId={offer.id}
          canOrder={session?.type === "customer"}
          isSignedIn={session !== null}
          price={selected.price}
          onOrder={() => setIsConfirming(true)}
        />
      </div>

      <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Auftrag verbindlich erteilen?</AlertDialogTitle>
            <AlertDialogDescription>
              {selected.title} für {formatPrice(selected.price)}, Lieferung in{" "}
              {formatDeliveryTime(selected.delivery_time_in_days)}. Der Anbieter
              sieht den Auftrag sofort und setzt den Status selbst.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createOrder.isPending}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={createOrder.isPending}
              onClick={() => void confirmOrder()}
            >
              {createOrder.isPending ? "Wird gesendet…" : "Auftrag erteilen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

type OrderActionProps = {
  isOwner: boolean
  offerId: number
  canOrder: boolean
  isSignedIn: boolean
  price: number
  onOrder: () => void
}

/** One button per situation, so nobody is offered an action the API rejects. */
function OrderAction({
  isOwner,
  offerId,
  canOrder,
  isSignedIn,
  price,
  onOrder,
}: OrderActionProps) {
  if (isOwner) {
    return (
      <Button
        size="xl"
        variant="outline"
        className="w-full"
        render={<Link href={`/offers/${offerId}/edit`} />}
      >
        <PencilIcon data-icon="inline-start" />
        Angebot bearbeiten
      </Button>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="grid gap-2">
        <Button size="xl" className="w-full" render={<Link href="/login" />}>
          <LogInIcon data-icon="inline-start" />
          Anmelden und buchen
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Buchen ist nur mit einem Kundenkonto möglich.
        </p>
      </div>
    )
  }

  if (!canOrder) {
    return (
      <p className="rounded-lg bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
        Aufträge können nur Kundenkonten erteilen.
      </p>
    )
  }

  return (
    <Button size="xl" className="w-full" onClick={onOrder}>
      <ShoppingCartIcon data-icon="inline-start" />
      Für {formatPrice(price)} beauftragen
    </Button>
  )
}
