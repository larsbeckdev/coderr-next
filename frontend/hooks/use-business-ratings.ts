"use client"

import { useQuery } from "@tanstack/react-query"

import { listReviews } from "@/lib/api/reviews"
import { useSession } from "@/lib/auth/use-session"

export type BusinessRating = {
  average: number
  count: number
}

/**
 * There is no per-offer rating in the API, only reviews per business user and
 * only for signed-in callers. One unpaginated request covers every card on a
 * page, which beats a request per offer; signed-out visitors simply see no
 * ratings.
 */
export function useBusinessRatings() {
  const session = useSession()

  return useQuery({
    queryKey: ["reviews", "by-business"],
    enabled: session !== null,
    staleTime: 60_000,
    queryFn: async (): Promise<Map<number, BusinessRating>> => {
      const reviews = await listReviews()
      const totals = new Map<number, { sum: number; count: number }>()
      for (const review of reviews) {
        const current = totals.get(review.business_user) ?? { sum: 0, count: 0 }
        totals.set(review.business_user, {
          sum: current.sum + review.rating,
          count: current.count + 1,
        })
      }
      return new Map(
        [...totals].map(([userId, { sum, count }]) => [
          userId,
          { average: sum / count, count },
        ])
      )
    },
  })
}
