"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createOffer,
  deleteOffer,
  getOfferWithPackages,
  listOffers,
  updateOffer,
  updateOfferImage,
} from "@/lib/api/offers"
import type {
  OfferCreatePayload,
  OfferListParams,
  OfferUpdatePayload,
} from "@/lib/api/offers"
import { queryKeys } from "@/lib/api/query-keys"

export function useOffers(params: OfferListParams) {
  return useQuery({
    queryKey: queryKeys.offers(params),
    queryFn: () => listOffers(params),
    /** Keeps the previous page visible while the next one loads. */
    placeholderData: (previous) => previous,
  })
}

export function useOffer(offerId: number) {
  return useQuery({
    queryKey: queryKeys.offer(offerId),
    queryFn: () => getOfferWithPackages(offerId),
    enabled: Number.isFinite(offerId),
  })
}

/**
 * Creating an offer is two requests when a picture is picked: the packages
 * have to go as nested JSON, the file as multipart. The mutation hides that
 * so the form has a single success path.
 */
export function useCreateOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      payload,
      image,
    }: {
      payload: OfferCreatePayload
      image?: File | null
    }) => {
      const offer = await createOffer(payload)
      if (image) {
        return updateOfferImage(offer.id, image)
      }
      return offer
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["offers"] })
    },
  })
}

export function useUpdateOffer(offerId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      payload,
      image,
    }: {
      payload: OfferUpdatePayload
      image?: File | null
    }) => {
      const offer = await updateOffer(offerId, payload)
      if (image) {
        return updateOfferImage(offerId, image)
      }
      return offer
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["offers"] })
    },
  })
}

export function useDeleteOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (offerId: number) => deleteOffer(offerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["offers"] })
    },
  })
}
