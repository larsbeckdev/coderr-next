import type { OfferListParams } from "@/lib/api/offers"
import type { ReviewListParams } from "@/lib/api/reviews"

export const queryKeys = {
  baseInfo: ["base-info"] as const,
  offers: (params: OfferListParams) => ["offers", params] as const,
  offer: (offerId: number) => ["offers", offerId] as const,
  profile: (userId: number) => ["profiles", userId] as const,
  businessProfiles: ["profiles", "business"] as const,
  customerProfiles: ["profiles", "customer"] as const,
  orders: ["orders"] as const,
  orderCounts: (businessUserId: number) =>
    ["orders", "counts", businessUserId] as const,
  reviews: (params: ReviewListParams) => ["reviews", params] as const,
}
