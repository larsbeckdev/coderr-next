"use client"

import * as React from "react"
import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type RatingInputProps = {
  name: string
  value: number
  onChange: (rating: number) => void
}

const LABELS = ["Sehr schlecht", "Schlecht", "In Ordnung", "Gut", "Sehr gut"]

/**
 * Radio buttons under the stars, so the rating is reachable with the
 * keyboard and announced as a group instead of five unlabelled buttons.
 */
export function RatingInput({ name, value, onChange }: RatingInputProps) {
  const [hovered, setHovered] = React.useState<number | null>(null)
  const shown = hovered ?? value

  return (
    <div className="flex items-center gap-3">
      <div
        role="radiogroup"
        aria-label="Bewertung"
        className="flex gap-1"
        onMouseLeave={() => setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((rating) => (
          <label
            key={rating}
            onMouseEnter={() => setHovered(rating)}
            className="cursor-pointer p-0.5"
          >
            <input
              type="radio"
              name={name}
              value={rating}
              checked={value === rating}
              onChange={() => onChange(rating)}
              className="peer sr-only"
            />
            <span className="sr-only">
              {rating} von 5 – {LABELS[rating - 1]}
            </span>
            <StarIcon
              aria-hidden
              className={cn(
                "size-7 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring/40",
                rating <= shown
                  ? "fill-rating text-rating"
                  : "text-muted-foreground/40"
              )}
            />
          </label>
        ))}
      </div>

      <span className="text-sm text-muted-foreground">
        {shown > 0 ? LABELS[shown - 1] : "Noch nicht bewertet"}
      </span>
    </div>
  )
}
