"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  LayoutDashboardIcon,
  LogOutIcon,
  PackageIcon,
  PlusIcon,
  ReceiptTextIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { Logo } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { LinkButton } from "@/components/ui/link-button"
import { UserAvatar } from "@/components/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useDraft } from "@/hooks/use-draft"
import { useOwnProfile } from "@/hooks/use-profiles"
import { clearSession } from "@/lib/auth/session"
import { displayName, useSession } from "@/lib/auth/use-session"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/offers", label: "Angebote", icon: PackageIcon },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
    private: true,
  },
  { href: "/orders", label: "Aufträge", icon: ReceiptTextIcon, private: true },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const session = useSession()
  const { data: profile } = useOwnProfile()

  function handleLogout() {
    clearSession()
    queryClient.clear()
    router.replace("/login")
  }

  const navItems = NAV_ITEMS.filter((item) => session || !item.private)
  const name = profile
    ? displayName(profile.first_name, profile.last_name, profile.username)
    : (session?.username ?? "")

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-4 px-4 sm:px-6">
        <Logo />

        {/* useSearchParams opts the subtree out of static rendering, so the
            boundary keeps that scoped to the search box. */}
        <React.Suspense fallback={<div className="hidden flex-1 md:block" />}>
          <HeaderSearch className="hidden min-w-0 flex-1 md:flex" />
        </React.Suspense>

        <nav
          aria-label="Hauptnavigation"
          className="ml-auto flex items-center gap-1"
        >
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-soft text-brand-soft-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <ThemeToggle />

        {session ? (
          <div className="flex items-center gap-2">
            {session.type === "business" ? (
              <LinkButton
                size="md"
                className="hidden sm:inline-flex"
                href="/offers/new"
              >
                <PlusIcon data-icon="inline-start" />
                Angebot
              </LinkButton>
            ) : null}

            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Kontomenü"
                className="rounded-full focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              >
                <UserAvatar name={name} src={profile?.file} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-semibold">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session.type === "business" ? "Anbieter" : "Kunde"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/profile" />}>
                  <UserIcon className="size-4" />
                  Mein Profil
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/orders" />}>
                  <ReceiptTextIcon className="size-4" />
                  Aufträge
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOutIcon className="size-4" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <LinkButton variant="ghost" size="md" href="/login">
              Anmelden
            </LinkButton>
            <LinkButton size="md" href="/register">
              Registrieren
            </LinkButton>
          </div>
        )}
      </div>
    </header>
  )
}

/**
 * The search box writes to the same query parameter the offer list reads, so
 * a search from any page lands on a shareable URL instead of hidden state.
 */
function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeSearch =
    pathname === "/offers" ? (searchParams.get("search") ?? "") : ""
  const [value, setValue] = useDraft(activeSearch)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const query = value.trim()
    router.push(
      query ? `/offers?search=${encodeURIComponent(query)}` : "/offers"
    )
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("items-center", className)}
    >
      <div className="relative w-full max-w-sm">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Wonach suchst du?"
          aria-label="Angebote durchsuchen"
          className="h-9 pl-9 text-sm"
        />
      </div>
    </form>
  )
}
