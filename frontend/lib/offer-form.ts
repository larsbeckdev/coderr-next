import { z } from "zod"

import type { OfferPackageInput } from "@/lib/api/offers"
import { OFFER_TYPES } from "@/lib/api/types"
import type { OfferPackage } from "@/lib/api/types"

const packageSchema = z.object({
  offer_type: z.enum(OFFER_TYPES),
  title: z.string().trim().min(1, "Bitte gib dem Paket einen Titel."),
  // The number inputs hand over strings, so the value is coerced before the
  // range checks run.
  price: z.coerce
    .number({ invalid_type_error: "Bitte gib einen Preis ein." })
    .min(0, "Der Preis darf nicht negativ sein."),
  delivery_time_in_days: z.coerce
    .number({ invalid_type_error: "Bitte gib eine Lieferzeit ein." })
    .int("Bitte gib ganze Tage an.")
    .min(1, "Mindestens ein Tag."),
  revisions: z.coerce
    .number({ invalid_type_error: "Bitte gib eine Zahl ein." })
    .int("Bitte gib eine ganze Zahl an.")
    .min(-1, "-1 steht für unbegrenzt."),
  features: z.array(z.string()).min(1, "Nenne mindestens eine Leistung."),
})

export const offerFormSchema = z.object({
  title: z.string().trim().min(1, "Bitte gib dem Angebot einen Titel."),
  description: z.string().trim().min(1, "Beschreibe kurz, was du anbietest."),
  // A fixed-length array rather than a tuple: react-hook-form derives its
  // field paths from the type, and a tuple narrows them to details.0.title
  // and friends, which no shared field component can address.
  details: z.array(packageSchema).length(OFFER_TYPES.length),
})

export type OfferFormValues = z.infer<typeof offerFormSchema>

const PLACEHOLDER_PRICES = [50, 120, 250]
const PLACEHOLDER_DELIVERY = [7, 5, 3]

/**
 * A new offer starts with all three packages already laid out, cheapest to
 * most expensive: the API rejects anything else, so an empty form that could
 * be filled in the wrong shape would only produce a late error.
 */
export function emptyOfferValues(): OfferFormValues {
  return {
    title: "",
    description: "",
    details: OFFER_TYPES.map((offerType, index) => ({
      offer_type: offerType,
      title: "",
      price: PLACEHOLDER_PRICES[index],
      delivery_time_in_days: PLACEHOLDER_DELIVERY[index],
      revisions: index + 1,
      features: [],
    })),
  }
}

export function offerValuesFrom(
  offer: { title: string; description: string },
  packages: OfferPackage[]
): OfferFormValues {
  return {
    title: offer.title,
    description: offer.description,
    details: OFFER_TYPES.map((offerType, index) => {
      const existing = packages.find((entry) => entry.offer_type === offerType)
      return {
        offer_type: offerType,
        title: existing?.title ?? "",
        price: existing?.price ?? PLACEHOLDER_PRICES[index],
        delivery_time_in_days:
          existing?.delivery_time_in_days ?? PLACEHOLDER_DELIVERY[index],
        revisions: existing?.revisions ?? index + 1,
        features: existing?.features ?? [],
      }
    }),
  }
}

export function toPackagePayload(
  details: OfferFormValues["details"]
): OfferPackageInput[] {
  return details.map((entry) => ({
    title: entry.title.trim(),
    revisions: entry.revisions,
    delivery_time_in_days: entry.delivery_time_in_days,
    price: entry.price,
    features: entry.features,
    offer_type: entry.offer_type,
  }))
}
