"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OFFER_ORDERINGS } from "@/lib/api/offers"
import {
  DELIVERY_TIME_OPTIONS,
  DEFAULT_ORDERING,
  ORDERING_LABELS,
  hasActiveFilters,
  withOfferParam,
} from "@/lib/offer-search-params"

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

/**
 * Native selects on purpose: a filter dropdown is exactly what the platform
 * control is good at, and it brings keyboard handling and the mobile picker
 * without a component of its own.
 */
export function OfferFilters({ resultCount }: { resultCount?: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const search = searchParams.get("search") ?? ""
  const minPrice = searchParams.get("min_price") ?? ""
  const maxDeliveryTime = searchParams.get("max_delivery_time") ?? ""
  const ordering = searchParams.get("ordering") ?? DEFAULT_ORDERING

  const [searchDraft, setSearchDraft] = React.useState(search)
  const [minPriceDraft, setMinPriceDraft] = React.useState(minPrice)

  React.useEffect(() => setSearchDraft(search), [search])
  React.useEffect(() => setMinPriceDraft(minPrice), [minPrice])

  function apply(key: string, value: string) {
    router.push(`${pathname}${withOfferParam(searchParams, key, value)}`)
  }

  return (
    <section aria-label="Angebote filtern" className="grid gap-4">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          apply("search", searchDraft.trim())
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Angebote durchsuchen"
            aria-label="Angebote durchsuchen"
            className="h-11 pl-9 text-sm"
          />
        </div>
        <Button type="submit" size="xl">
          Suchen
        </Button>
      </form>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="min_price" className="text-xs text-muted-foreground">
            Mindestpreis
          </Label>
          <Input
            id="min_price"
            type="number"
            inputMode="numeric"
            min={0}
            step={10}
            value={minPriceDraft}
            placeholder="egal"
            onChange={(event) => setMinPriceDraft(event.target.value)}
            onBlur={() => apply("min_price", minPriceDraft)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                apply("min_price", minPriceDraft)
              }
            }}
            className="h-9 text-sm"
          />
        </div>

        <div className="grid gap-1.5">
          <Label
            htmlFor="max_delivery_time"
            className="text-xs text-muted-foreground"
          >
            Lieferzeit
          </Label>
          <select
            id="max_delivery_time"
            value={maxDeliveryTime}
            onChange={(event) => apply("max_delivery_time", event.target.value)}
            className={SELECT_CLASS}
          >
            {DELIVERY_TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="ordering" className="text-xs text-muted-foreground">
            Sortierung
          </Label>
          <select
            id="ordering"
            value={ordering}
            onChange={(event) => apply("ordering", event.target.value)}
            className={SELECT_CLASS}
          >
            {OFFER_ORDERINGS.map((value) => (
              <option key={value} value={value}>
                {ORDERING_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {typeof resultCount === "number"
            ? `${resultCount} ${resultCount === 1 ? "Angebot" : "Angebote"} gefunden`
            : "Angebote werden geladen…"}
        </p>

        {hasActiveFilters(searchParams) ? (
          <Button variant="ghost" size="md" onClick={() => router.push(pathname)}>
            <XIcon data-icon="inline-start" />
            Filter zurücksetzen
          </Button>
        ) : null}
      </div>
    </section>
  )
}
