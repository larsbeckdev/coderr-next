import { z } from "zod"

/** A profile is either the side that buys or the side that sells. */
export const PROFILE_TYPES = ["customer", "business"] as const

/** The three packages every offer has to carry, cheapest first. */
export const OFFER_TYPES = ["basic", "standard", "premium"] as const

export const ORDER_STATUSES = ["in_progress", "completed", "cancelled"] as const

export const profileTypeSchema = z.enum(PROFILE_TYPES)
export const offerTypeSchema = z.enum(OFFER_TYPES)
export const orderStatusSchema = z.enum(ORDER_STATUSES)

/**
 * Registration and login answer with the token and the account, but not with
 * the profile type - that one costs a second request against /profile/{id}/.
 */
export const authResponseSchema = z.object({
  token: z.string(),
  username: z.string(),
  email: z.string(),
  user_id: z.number(),
})

export const profileSchema = z.object({
  user: z.number(),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  file: z.string().nullable(),
  location: z.string(),
  tel: z.string(),
  description: z.string(),
  working_hours: z.string(),
  type: profileTypeSchema,
  email: z.string(),
  created_at: z.string(),
})

export const businessProfileSchema = z.object({
  user: z.number(),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  file: z.string().nullable(),
  location: z.string(),
  tel: z.string(),
  description: z.string(),
  working_hours: z.string(),
  type: profileTypeSchema,
})

export const customerProfileSchema = z.object({
  user: z.number(),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  file: z.string().nullable(),
  uploaded_at: z.string(),
  type: profileTypeSchema,
})

export const offerDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  revisions: z.number(),
  delivery_time_in_days: z.number(),
  price: z.number(),
  features: z.array(z.string()),
  offer_type: offerTypeSchema,
})

/** The list and retrieve endpoints only link to the packages. */
export const offerDetailLinkSchema = z.object({
  id: z.number(),
  url: z.string(),
})

const offerBaseSchema = z.object({
  id: z.number(),
  user: z.number(),
  title: z.string(),
  image: z.string().nullable(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  details: z.array(offerDetailLinkSchema),
  /** Null while an offer has no packages at all. */
  min_price: z.number().nullable(),
  min_delivery_time: z.number().nullable(),
})

export const offerSchema = offerBaseSchema.extend({
  user_details: z.object({
    first_name: z.string(),
    last_name: z.string(),
    username: z.string(),
  }),
})

export const offerRetrieveSchema = offerBaseSchema

/** POST and PATCH answer with the packages expanded instead of linked. */
export const offerWriteResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  image: z.string().nullable(),
  description: z.string(),
  details: z.array(offerDetailSchema),
})

export const orderSchema = z.object({
  id: z.number(),
  customer_user: z.number(),
  business_user: z.number(),
  title: z.string(),
  revisions: z.number(),
  delivery_time_in_days: z.number(),
  price: z.number(),
  features: z.array(z.string()),
  offer_type: z.string(),
  status: orderStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
})

export const reviewSchema = z.object({
  id: z.number(),
  business_user: z.number(),
  reviewer: z.number(),
  rating: z.number(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const baseInfoSchema = z.object({
  review_count: z.number(),
  average_rating: z.number(),
  business_profile_count: z.number(),
  offer_count: z.number(),
})

export const orderCountSchema = z.object({ order_count: z.number() })
export const completedOrderCountSchema = z.object({
  completed_order_count: z.number(),
})

/** DRF page number pagination, used by the offer list only. */
export function paginatedSchema<S extends z.ZodTypeAny>(item: S) {
  return z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(item),
  })
}

export type ProfileType = z.infer<typeof profileTypeSchema>
export type OfferType = z.infer<typeof offerTypeSchema>
export type OrderStatus = z.infer<typeof orderStatusSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type Profile = z.infer<typeof profileSchema>
export type BusinessProfile = z.infer<typeof businessProfileSchema>
export type CustomerProfile = z.infer<typeof customerProfileSchema>
export type OfferPackage = z.infer<typeof offerDetailSchema>
export type Offer = z.infer<typeof offerSchema>
export type OfferRetrieve = z.infer<typeof offerRetrieveSchema>
export type Order = z.infer<typeof orderSchema>
export type Review = z.infer<typeof reviewSchema>
export type BaseInfo = z.infer<typeof baseInfoSchema>

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
