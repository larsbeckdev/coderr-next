import type { Metadata } from "next"

import { SessionGate } from "@/components/auth/session-gate"
import { OfferForm } from "@/components/offers/offer-form"

export const metadata: Metadata = {
  title: "Neues Angebot",
}

export default function NewOfferPage() {
  return (
    <SessionGate expects="user" requires="business" redirectTo="/offers">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <header className="mb-8 grid gap-1">
          <h1 className="font-heading text-3xl font-bold">Neues Angebot</h1>
          <p className="text-sm text-muted-foreground">
            Beschreibe deine Leistung und lege die drei Pakete fest, zwischen
            denen Kunden wählen können.
          </p>
        </header>

        <OfferForm />
      </div>
    </SessionGate>
  )
}
