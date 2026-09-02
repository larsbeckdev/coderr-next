"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-keys"
import {
  createReview,
  deleteReview,
  listReviews,
  updateReview,
} from "@/lib/api/reviews"
import type { ReviewListParams } from "@/lib/api/reviews"

export function useReviews(params: ReviewListParams) {
  return useQuery({
    queryKey: queryKeys.reviews(params),
    queryFn: () => listReviews(params),
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reviews"] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.baseInfo })
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reviewId,
      rating,
      description,
    }: {
      reviewId: number
      rating: number
      description: string
    }) => updateReview(reviewId, { rating, description }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reviews"] })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reviews"] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.baseInfo })
    },
  })
}
