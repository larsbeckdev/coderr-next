import Link from "next/link"
import { CheckIcon } from "lucide-react"

import { FeaturedOffers } from "@/components/landing/featured-offers"
import { LandingHero } from "@/components/landing/hero"
import { PlatformStats } from "@/components/landing/platform-stats"
import { Button } from "@/components/ui/button"

const BENEFITS = [
  "Klare und transparente Preise. Bezahlung pro Projekt – du siehst Preis, Lieferzeit und Überarbeitungen, bevor du buchst.",
  "Qualitativ hochwertige Arbeit, schneller erledigt. Filtere nach Budget und Lieferzeit und finde in Minuten die passende Person.",
  "Bewertungen von echten Aufträgen. Jede Bewertung stammt von einem Kundenkonto, ein Konto kann einen Anbieter genau einmal bewerten.",
]

export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <PlatformStats />

      <section className="bg-brand-soft">
        <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
          <h2 className="font-heading text-3xl leading-tight font-bold text-brand-soft-foreground">
            Kompetente Programmierer für jeden Bereich – nur einen Klick
            entfernt
          </h2>

          <ul className="grid gap-5">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckIcon className="size-3.5" aria-hidden />
                </span>
                <p className="text-sm leading-relaxed text-brand-soft-foreground">
                  {benefit}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FeaturedOffers />

      <section className="brand-glow border-t border-border">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-bold">
            Du programmierst selbst?
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Lege ein Anbieterkonto an, veröffentliche dein erstes Angebot mit
            Basic-, Standard- und Premium-Paket und nimm Aufträge entgegen.
          </p>
          <Button size="xl" render={<Link href="/register" />}>
            Anbieter werden
          </Button>
        </div>
      </section>
    </>
  )
}
