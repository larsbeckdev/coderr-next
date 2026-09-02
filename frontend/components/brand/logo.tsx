import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

type LogoProps = {
  href?: string
  className?: string
  width?: number
}

const ASPECT_RATIO = 158 / 32

/**
 * Two files instead of one: the wordmark is dark grey on light backgrounds
 * and light grey on dark ones. Swapping them with the `dark:` variant keeps
 * the choice in CSS, so the server-rendered markup already carries both and
 * there is no theme flash while next-themes hydrates.
 */
export function Logo({ href = "/", className, width = 132 }: LogoProps) {
  const height = Math.round(width / ASPECT_RATIO)

  return (
    <Link
      href={href}
      aria-label="Coderr Startseite"
      className={cn(
        "inline-flex shrink-0 rounded-md transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        className
      )}
    >
      <Image
        src="/brand/logo.svg"
        alt="Coderr"
        width={width}
        height={height}
        priority
        className="dark:hidden"
      />
      <Image
        src="/brand/logo-light.svg"
        alt="Coderr"
        width={width}
        height={height}
        priority
        className="hidden dark:block"
      />
    </Link>
  )
}
