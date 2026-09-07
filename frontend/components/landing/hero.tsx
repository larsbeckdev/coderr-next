"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const FACES = [
  "/img/person-1.png",
  "/img/person-2.png",
  "/img/person-3.png",
  "/img/person-4.png",
]

const SUGGESTIONS = ["Frontend", "Django", "API", "Datenbank", "UI Design"]

export function LandingHero() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")

  function search(term: string) {
    const trimmed = term.trim()
    router.push(
      trimmed ? `/offers?search=${encodeURIComponent(trimmed)}` : "/offers"
    )
  }

  return (
    <section className="hero-surface relative overflow-hidden">
      <Image
        src="/img/hero-bg.png"
        alt=""
        aria-hidden
        fill
        priority
        className="pointer-events-none object-cover opacity-20 mix-blend-luminosity"
      />

      <div className="relative mx-auto grid w-full max-w-[1440px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:py-24">
        <div className="max-w-2xl text-white">
          <h1 className="font-heading text-4xl leading-tight font-bold sm:text-5xl">
            Finde professionelle IT-Talente für dein Unternehmen
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/85">
            Feste Pakete statt vager Angebote: Preis, Lieferzeit und
            Überarbeitungen stehen fest, bevor du buchst.
          </p>

          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              search(query)
            }}
            className="mt-8 flex w-full max-w-xl gap-2 rounded-xl bg-white/95 p-2 shadow-lg dark:bg-card"
          >
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Wonach suchst du?"
                aria-label="Angebote durchsuchen"
                className="h-11 w-full rounded-lg bg-transparent pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Button type="submit" size="xl">
              Suchen
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/80">
            <span>Beliebt:</span>
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => search(suggestion)}
                className="rounded-full border border-white/40 px-3 py-1 transition-colors hover:bg-white/15"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div aria-hidden className="hidden shrink-0 grid-cols-2 gap-4 lg:grid">
          {FACES.map((face, index) => (
            <Image
              key={face}
              src={face}
              alt=""
              width={168}
              height={168}
              priority={index < 2}
              className="size-36 rounded-2xl object-cover shadow-xl ring-2 ring-white/25 xl:size-40"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
