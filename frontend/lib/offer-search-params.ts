import type { OfferListParams, OfferOrdering } from "@/lib/api/offers"
import { OFFER_ORDERINGS } from "@/lib/api/offers"

/** Matches the page_size the backend paginator uses. */
export const OFFERS_PAGE_SIZE = 6

export const DEFAULT_ORDERING: OfferOrdering = "-updated_at"

export const ORDERING_LABELS: Record<OfferOrdering, string> = {
  "-updated_at": "Neueste zuerst",
  updated_at: "Älteste zuerst",
  min_price: "Günstigste zuerst",
  "-min_price": "Teuerste zuerst",
}

export const DELIVERY_TIME_OPTIONS = [
  { value: "", label: "Beliebige Lieferzeit" },
  { value: "1", label: "In 1 Tag" },
  { value: "3", label: "In bis zu 3 Tagen" },
  { value: "7", label: "In bis zu 7 Tagen" },
  { value: "14", label: "In bis zu 14 Tagen" },
  { value: "30", label: "In bis zu 30 Tagen" },
] as const

function toPositiveNumber(value: string | null): number | undefined {
  if (!value) {
    return undefined
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function toOrdering(value: string | null): OfferOrdering {
  return OFFER_ORDERINGS.includes(value as OfferOrdering)
    ? (value as OfferOrdering)
    : DEFAULT_ORDERING
}

/**
 * The offer list keeps its whole state in the URL, so a filtered search is
 * shareable and the browser back button steps through it. This turns those
 * parameters into the shape the API expects, dropping anything unusable
 * instead of forwarding it.
 */
export function readOfferParams(
  searchParams: URLSearchParams
): OfferListParams {
  const page = toPositiveNumber(searchParams.get("page"))

  return {
    page: page && page > 1 ? page : undefined,
    page_size: OFFERS_PAGE_SIZE,
    search: searchParams.get("search")?.trim() || undefined,
    creator_id: toPositiveNumber(searchParams.get("creator_id")),
    min_price: toPositiveNumber(searchParams.get("min_price")),
    max_delivery_time: toPositiveNumber(searchParams.get("max_delivery_time")),
    ordering: toOrdering(searchParams.get("ordering")),
  }
}

/**
 * Writes one filter back into the query string. Every change resets the page,
 * because page 4 of the old result set says nothing about the new one.
 */
export function withOfferParam(
  searchParams: URLSearchParams,
  key: string,
  value: string
): string {
  const next = new URLSearchParams(searchParams)
  if (value) {
    next.set(key, value)
  } else {
    next.delete(key)
  }
  if (key !== "page") {
    next.delete("page")
  }
  const query = next.toString()
  return query ? `?${query}` : ""
}

export function hasActiveFilters(searchParams: URLSearchParams): boolean {
  return ["search", "min_price", "max_delivery_time", "creator_id"].some((key) =>
    Boolean(searchParams.get(key))
  )
}
