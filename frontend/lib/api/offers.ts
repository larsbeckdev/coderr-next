import { emptyResponseSchema, request, toQueryString } from "@/lib/api/client"
import {
  offerDetailSchema,
  offerRetrieveSchema,
  offerSchema,
  offerWriteResponseSchema,
  paginatedSchema,
} from "@/lib/api/types"
import type {
  Offer,
  OfferPackage,
  OfferRetrieve,
  OfferType,
  Paginated,
} from "@/lib/api/types"

/** The API sorts by these two fields only; the minus prefix reverses them. */
export const OFFER_ORDERINGS = [
  "-updated_at",
  "updated_at",
  "min_price",
  "-min_price",
] as const

export type OfferOrdering = (typeof OFFER_ORDERINGS)[number]

export type OfferListParams = {
  page?: number
  page_size?: number
  search?: string
  creator_id?: number
  min_price?: number
  max_delivery_time?: number
  ordering?: OfferOrdering
}

export type OfferPackageInput = {
  title: string
  revisions: number
  delivery_time_in_days: number
  price: number
  features: string[]
  offer_type: OfferType
}

export type OfferCreatePayload = {
  title: string
  description: string
  details: OfferPackageInput[]
}

export type OfferUpdatePayload = {
  title?: string
  description?: string
  details?: OfferPackageInput[]
}

export function listOffers(
  params: OfferListParams = {}
): Promise<Paginated<Offer>> {
  return request(
    `/offers/${toQueryString(params)}`,
    paginatedSchema(offerSchema),
    { anonymous: true }
  )
}

export function getOffer(offerId: number): Promise<OfferRetrieve> {
  return request(`/offers/${offerId}/`, offerRetrieveSchema)
}

export function getOfferPackage(packageId: number): Promise<OfferPackage> {
  return request(`/offerdetails/${packageId}/`, offerDetailSchema)
}

/**
 * The retrieve endpoint links to the packages instead of embedding them, so
 * a usable detail view always needs the three follow-up requests. Bundling
 * them here keeps that away from every caller.
 */
export async function getOfferWithPackages(offerId: number): Promise<{
  offer: OfferRetrieve
  packages: OfferPackage[]
}> {
  const offer = await getOffer(offerId)
  const packages = await Promise.all(
    offer.details.map((link) => getOfferPackage(link.id))
  )
  return { offer, packages }
}

export function createOffer(payload: OfferCreatePayload) {
  return request("/offers/", offerWriteResponseSchema, {
    method: "POST",
    body: payload,
  })
}

export function updateOffer(offerId: number, payload: OfferUpdatePayload) {
  return request(`/offers/${offerId}/`, offerWriteResponseSchema, {
    method: "PATCH",
    body: payload,
  })
}

/**
 * Uploading the picture is a separate PATCH: the write serializer takes the
 * three packages as nested JSON, which cannot travel in the same multipart
 * request as the file.
 */
export function updateOfferImage(offerId: number, image: File) {
  const formData = new FormData()
  formData.append("image", image)
  return request(`/offers/${offerId}/`, offerWriteResponseSchema, {
    method: "PATCH",
    formData,
  })
}

export function deleteOffer(offerId: number): Promise<void> {
  return request(`/offers/${offerId}/`, emptyResponseSchema, {
    method: "DELETE",
  })
}
