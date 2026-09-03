import type { Metadata } from "next"
import Link from "next/link"

import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Anmelden",
}

export default function LoginPage() {
  return (
    <div className="grid gap-8">
      <header className="grid gap-2">
        <h1 className="font-heading text-3xl font-bold">Willkommen zurück</h1>
        <p className="text-sm text-muted-foreground">
          Melde dich an, um Angebote zu buchen oder deine Aufträge zu verwalten.
        </p>
      </header>

      <LoginForm />

      <p className="text-sm text-muted-foreground">
        Noch kein Konto?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Jetzt registrieren
        </Link>
      </p>
    </div>
  )
}
