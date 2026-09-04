"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { withOfferParam } from "@/lib/offer-search-params"

type PaginationBarProps = {
  page: number
  pageCount: number
}

/**
 * DRF answers with next/previous URLs, but those point at the API host. The
 * page number is derived from the total count instead, so the links stay
 * inside the app and remain shareable.
 */
export function PaginationBar({ page, pageCount }: PaginationBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (pageCount <= 1) {
    return null
  }

  function goTo(target: number) {
    const value = target <= 1 ? "" : String(target)
    router.push(`${pathname}${withOfferParam(searchParams, "page", value)}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <nav
      aria-label="Seiten"
      className="flex items-center justify-center gap-2 pt-4"
    >
      <Button
        variant="outline"
        size="md"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
      >
        <ChevronLeftIcon data-icon="inline-start" />
        Zurück
      </Button>

      <span className="px-3 text-sm text-muted-foreground">
        Seite {page} von {pageCount}
      </span>

      <Button
        variant="outline"
        size="md"
        disabled={page >= pageCount}
        onClick={() => goTo(page + 1)}
      >
        Weiter
        <ChevronRightIcon data-icon="inline-end" />
      </Button>
    </nav>
  )
}
