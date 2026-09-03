import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"

/**
 * The public shell. Pages inside decide for themselves whether they need a
 * session, because the marketplace is browsable while signed out but the
 * offer detail, orders and profiles are not.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  )
}
