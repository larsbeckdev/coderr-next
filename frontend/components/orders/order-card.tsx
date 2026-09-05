"use client"

import Link from "next/link"
import {
  CheckIcon,
  ClockIcon,
  RefreshCwIcon,
  StarIcon,
  XIcon,
} from "lucide-react"

import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import type { Order, ProfileType } from "@/lib/api/types"
import { formatDate, formatDeliveryTime, formatPrice, formatRevisions } from "@/lib/format"
import { ORDER_STATUS_CLASSES, ORDER_STATUS_LABELS } from "@/lib/offer-meta"
import { cn } from "@/lib/utils"

export type OrderCounterpart = {
  id: number
  name: string
  file: string | null
}

type OrderCardProps = {
  order: Order
  /** The side the signed-in user is on, which decides the actions. */
  role: ProfileType
  counterpart?: OrderCounterpart
  hasReview: boolean
  isUpdating: boolean
  onComplete: () => void
  onCancel: () => void
  onReview: () => void
}

export function OrderCard({
  order,
  role,
  counterpart,
  hasReview,
  isUpdating,
  onComplete,
  onCancel,
  onReview,
}: OrderCardProps) {
  const isOpen = order.status === "in_progress"
  const canMoveStatus = role === "business" && isOpen
  const canReview = role === "customer" && order.status === "completed"

  return (
    <li className="grid gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-heading text-base font-semibold">{order.title}</h3>
          <p className="text-xs text-muted-foreground">
            Beauftragt am {formatDate(order.created_at)} · Paket{" "}
            {order.offer_type}
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
      </div>

      {counterpart ? (
        <Link
          href={`/profile/${counterpart.id}`}
          className="flex w-fit items-center gap-2 text-sm hover:text-primary"
        >
          <UserAvatar name={counterpart.name} src={counterpart.file} size="sm" />
          <span>
            <span className="text-muted-foreground">
              {role === "customer" ? "Anbieter: " : "Kunde: "}
            </span>
            {counterpart.name}
          </span>
        </Link>
      ) : null}

      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ClockIcon className="size-4" aria-hidden />
          <dt className="sr-only">Lieferzeit</dt>
          <dd>{formatDeliveryTime(order.delivery_time_in_days)}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <RefreshCwIcon className="size-4" aria-hidden />
          <dt className="sr-only">Überarbeitungen</dt>
          <dd>{formatRevisions(order.revisions)}</dd>
        </div>
        <div className="ml-auto">
          <dt className="sr-only">Preis</dt>
          <dd className="font-heading text-lg font-bold text-foreground">
            {formatPrice(order.price)}
          </dd>
        </div>
      </dl>

      {order.features.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {order.features.map((feature) => (
            <li
              key={feature}
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {feature}
            </li>
          ))}
        </ul>
      ) : null}

      {canMoveStatus || canReview ? (
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {canMoveStatus ? (
            <>
              <Button size="md" disabled={isUpdating} onClick={onComplete}>
                <CheckIcon data-icon="inline-start" />
                Als abgeschlossen markieren
              </Button>
              <Button
                variant="destructive"
                size="md"
                disabled={isUpdating}
                onClick={onCancel}
              >
                <XIcon data-icon="inline-start" />
                Stornieren
              </Button>
            </>
          ) : null}

          {canReview ? (
            <Button variant="outline" size="md" onClick={onReview}>
              <StarIcon data-icon="inline-start" />
              {hasReview ? "Bewertung bearbeiten" : "Anbieter bewerten"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}
