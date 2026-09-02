import { format, formatDistanceToNow, isValid, parseISO } from "date-fns"
import { de } from "date-fns/locale"

const currency = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
})

const decimal = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatPrice(value: number | null | undefined): string {
  return typeof value === "number" ? currency.format(value) : "–"
}

export function formatRating(value: number): string {
  return decimal.format(value)
}

export function formatDate(value: string): string {
  const date = parseISO(value)
  return isValid(date) ? format(date, "dd.MM.yyyy", { locale: de }) : value
}

export function formatDateTime(value: string): string {
  const date = parseISO(value)
  return isValid(date) ? format(date, "dd.MM.yyyy, HH:mm", { locale: de }) : value
}

/** "vor 3 Tagen" - short enough for a review card headline. */
export function formatRelative(value: string): string {
  const date = parseISO(value)
  if (!isValid(date)) {
    return value
  }
  return formatDistanceToNow(date, { addSuffix: true, locale: de })
}

export function formatDeliveryTime(days: number | null | undefined): string {
  if (typeof days !== "number") {
    return "–"
  }
  return days === 1 ? "1 Tag" : `${days} Tage`
}

export function formatRevisions(revisions: number): string {
  if (revisions < 0) {
    return "Unbegrenzte Überarbeitungen"
  }
  return revisions === 1 ? "1 Überarbeitung" : `${revisions} Überarbeitungen`
}
