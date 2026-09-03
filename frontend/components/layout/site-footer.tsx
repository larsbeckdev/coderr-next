import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { cn } from "@/lib/utils"

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-border bg-surface-sunken", className)}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Logo width={112} />

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Coderr. Alle Rechte vorbehalten.
        </p>

        <nav aria-label="Rechtliches" className="flex items-center gap-6 text-xs">
          <Link
            href="/privacy"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Datenschutz
          </Link>
          <Link
            href="/imprint"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Impressum
          </Link>
        </nav>
      </div>
    </footer>
  )
}
