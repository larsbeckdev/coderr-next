"use client"

import * as React from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/empty-state"
import { OrderCard } from "@/components/orders/order-card"
import type { OrderCounterpart } from "@/components/orders/order-card"
import { ReviewDialog } from "@/components/reviews/review-dialog"
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
import { LinkButton } from "@/components/ui/link-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders"
import { useBusinessProfiles, useCustomerProfiles } from "@/hooks/use-profiles"
import { useReviews } from "@/hooks/use-reviews"
import { ApiError } from "@/lib/api/client"
import type { Order, OrderStatus } from "@/lib/api/types"
import { displayName, useSession } from "@/lib/auth/use-session"
import { ORDER_STATUS_LABELS } from "@/lib/offer-meta"
import { cn } from "@/lib/utils"

const FILTERS = [
  { value: "all", label: "Alle" },
  { value: "in_progress", label: ORDER_STATUS_LABELS.in_progress },
  { value: "completed", label: ORDER_STATUS_LABELS.completed },
  { value: "cancelled", label: ORDER_STATUS_LABELS.cancelled },
] as const

type Filter = (typeof FILTERS)[number]["value"]

export function OrdersView() {
  const session = useSession()
  const role = session?.type ?? "customer"
  const { data: orders, isPending } = useOrders()
  const updateStatus = useUpdateOrderStatus()

  const [filter, setFilter] = React.useState<Filter>("all")
  const [pendingCancel, setPendingCancel] = React.useState<Order | null>(null)
  const [reviewFor, setReviewFor] = React.useState<OrderCounterpart | null>(
    null
  )

  const counterparts = useCounterparts(role)
  // Only the customer's own reviews matter here, and one request covers every
  // card: the API allows a single review per provider.
  const { data: ownReviews } = useReviews(
    role === "customer" && session ? { reviewer_id: session.userId } : {}
  )

  const visible = (orders ?? []).filter(
    (order) => filter === "all" || order.status === filter
  )

  async function moveStatus(order: Order, status: OrderStatus) {
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status })
      toast.success(
        status === "completed"
          ? "Auftrag als abgeschlossen markiert"
          : "Auftrag storniert"
      )
      setPendingCancel(null)
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Der Status konnte nicht geändert werden."
      )
    }
  }

  const reviewForCounterpart = reviewFor
    ? (ownReviews?.find((review) => review.business_user === reviewFor.id) ??
      null)
    : null

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-10 sm:px-6">
      <header className="grid gap-1">
        <h1 className="font-heading text-3xl font-bold">
          {role === "business" ? "Eingegangene Aufträge" : "Meine Aufträge"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {role === "business"
            ? "Setze den Status, sobald du eine Arbeit abgeschlossen hast."
            : "Alle Pakete, die du beauftragt hast, mit ihrem aktuellen Stand."}
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Nach Status filtern"
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((entry) => {
          const count =
            entry.value === "all"
              ? (orders?.length ?? 0)
              : (orders?.filter((order) => order.status === entry.value)
                  .length ?? 0)
          return (
            <button
              key={entry.value}
              role="tab"
              type="button"
              aria-selected={filter === entry.value}
              onClick={() => setFilter(entry.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                filter === entry.value
                  ? "border-primary bg-brand-soft text-brand-soft-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {entry.label} ({count})
            </button>
          )
        })}
      </div>

      {isPending ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title={
            filter === "all" ? "Noch keine Aufträge" : "Nichts in diesem Status"
          }
          description={
            role === "business"
              ? "Sobald jemand eines deiner Pakete bucht, erscheint der Auftrag hier."
              : "Buche ein Paket, und der Auftrag erscheint hier."
          }
          action={
            role === "customer" ? (
              <LinkButton variant="outline" size="md" href="/offers">
                Angebote durchsuchen
              </LinkButton>
            ) : null
          }
        />
      ) : (
        <ul className="grid gap-4">
          {visible.map((order) => {
            const counterpartId =
              role === "customer" ? order.business_user : order.customer_user
            const counterpart = counterparts.get(counterpartId)
            return (
              <OrderCard
                key={order.id}
                order={order}
                role={role}
                counterpart={counterpart}
                hasReview={Boolean(
                  ownReviews?.some(
                    (review) => review.business_user === order.business_user
                  )
                )}
                isUpdating={updateStatus.isPending}
                onComplete={() => void moveStatus(order, "completed")}
                onCancel={() => setPendingCancel(order)}
                onReview={() =>
                  setReviewFor(
                    counterpart ?? {
                      id: order.business_user,
                      name: "Anbieter",
                      file: null,
                    }
                  )
                }
              />
            )
          })}
        </ul>
      )}

      <AlertDialog
        open={pendingCancel !== null}
        onOpenChange={(open) => !open && setPendingCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Auftrag stornieren?</AlertDialogTitle>
            <AlertDialogDescription>
              „{pendingCancel?.title}“ wird als storniert markiert. Der Status
              lässt sich danach nicht mehr zurücksetzen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatus.isPending}>
              Zurück
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={updateStatus.isPending}
              onClick={() =>
                pendingCancel && void moveStatus(pendingCancel, "cancelled")
              }
            >
              Stornieren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {reviewFor ? (
        <ReviewDialog
          open
          onOpenChange={(open) => !open && setReviewFor(null)}
          businessUserId={reviewFor.id}
          businessUserName={reviewFor.name}
          review={reviewForCounterpart}
        />
      ) : null}
    </div>
  )
}

/**
 * Orders reference the other side by id only. Whichever profile list holds
 * that side is fetched once and cached, instead of a profile request per
 * order.
 */
function useCounterparts(role: "customer" | "business") {
  const { data: businesses } = useBusinessProfiles()
  const { data: customers } = useCustomerProfiles()
  const source = role === "customer" ? businesses : customers

  return React.useMemo(() => {
    const map = new Map<number, OrderCounterpart>()
    for (const profile of source ?? []) {
      map.set(profile.user, {
        id: profile.user,
        name: displayName(
          profile.first_name,
          profile.last_name,
          profile.username
        ),
        file: profile.file,
      })
    }
    return map
  }, [source])
}
