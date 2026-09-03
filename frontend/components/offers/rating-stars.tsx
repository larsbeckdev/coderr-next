import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type RatingStarsProps = {
  value: number
  size?: "sm" | "md"
  className?: string
}

/**
 * Five outlined stars with a clipped overlay on top, so a 3.4 shows as 3.4
 * rather than rounding to a whole star.
 */
export function RatingStars({ value, size = "sm", className }: RatingStarsProps) {
  const clamped = Math.min(5, Math.max(0, value))
  // shrink-0 matters on the clipped overlay: its container is narrower than
  // its content, and flex would otherwise squeeze the stars instead of
  // cutting them off.
  const iconClass = cn("shrink-0", size === "sm" ? "size-3.5" : "size-5")

  return (
    <span
      className={cn("relative inline-flex", className)}
      role="img"
      aria-label={`${clamped.toFixed(1)} von 5 Sternen`}
    >
      <span className="flex gap-0.5 text-muted-foreground/40">
        {Array.from({ length: 5 }, (_, index) => (
          <StarIcon key={index} className={iconClass} aria-hidden />
        ))}
      </span>
      <span
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-rating"
        style={{ width: `${(clamped / 5) * 100}%` }}
        aria-hidden
      >
        {Array.from({ length: 5 }, (_, index) => (
          <StarIcon key={index} className={cn(iconClass, "fill-current")} />
        ))}
      </span>
    </span>
  )
}
