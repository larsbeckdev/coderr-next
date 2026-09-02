import type { OfferType, OrderStatus, ProfileType } from "@/lib/api/types"

export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  in_progress: "In Bearbeitung",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
}

/** Token driven so the badge follows the theme instead of hard coded hexes. */
export const ORDER_STATUS_CLASSES: Record<OrderStatus, string> = {
  in_progress: "bg-status-in-progress/12 text-status-in-progress",
  completed: "bg-status-completed/12 text-status-completed",
  cancelled: "bg-status-cancelled/12 text-status-cancelled",
}

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  customer: "Kunde",
  business: "Anbieter",
}
