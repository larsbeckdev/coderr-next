import { z } from "zod"

import { emptyResponseSchema, request, toQueryString } from "@/lib/api/client"
import { reviewSchema } from "@/lib/api/types"
import type { Review } from "@/lib/api/types"

export type ReviewListParams = {
  business_user_id?: number
  reviewer_id?: number
  ordering?: "-updated_at" | "updated_at" | "rating" | "-rating"
}

export function listReviews(params: ReviewListParams = {}): Promise<Review[]> {
  return request(`/reviews/${toQueryString(params)}`, z.array(reviewSchema))
}

export function createReview(payload: {
  business_user: number
  rating: number
  description: string
}): Promise<Review> {
  return request("/reviews/", reviewSchema, { method: "POST", body: payload })
}

export function updateReview(
  reviewId: number,
  payload: { rating: number; description: string }
): Promise<Review> {
  return request(`/reviews/${reviewId}/`, reviewSchema, {
    method: "PATCH",
    body: payload,
  })
}

export function deleteReview(reviewId: number): Promise<void> {
  return request(`/reviews/${reviewId}/`, emptyResponseSchema, {
    method: "DELETE",
  })
}
