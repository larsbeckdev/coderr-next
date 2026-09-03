import type { Metadata } from "next"
import Link from "next/link"

import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Registrieren",
}

export default function RegisterPage() {
  return (
    <div className="grid gap-8">
      <header className="grid gap-2">
        <h1 className="font-heading text-3xl font-bold">Konto erstellen</h1>
        <p className="text-sm text-muted-foreground">
          Die Rolle legt fest, was du auf Coderr tun kannst – sie lässt sich
          später nicht mehr wechseln.
        </p>
      </header>

      <RegisterForm />

      <p className="text-sm text-muted-foreground">
        Schon registriert?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Anmelden
        </Link>
      </p>
    </div>
  )
}
