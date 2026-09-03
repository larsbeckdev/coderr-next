"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LogInIcon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { PasswordInput } from "@/components/auth/password-input"
import { Field } from "@/components/forms/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import { GUEST_ACCOUNTS, signIn } from "@/lib/auth/sign-in"

const loginSchema = z.object({
  username: z.string().min(1, "Bitte gib deinen Benutzernamen ein."),
  password: z.string().min(1, "Bitte gib dein Passwort ein."),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [guestPending, setGuestPending] = React.useState<string | null>(null)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })

  async function onSubmit(values: LoginValues) {
    try {
      await signIn(values)
      router.replace("/dashboard")
    } catch (error) {
      if (error instanceof ApiError) {
        form.setError("password", { message: error.message })
        return
      }
      toast.error("Die Anmeldung ist fehlgeschlagen. Bitte versuche es erneut.")
    }
  }

  async function signInAsGuest(username: string, password: string) {
    setGuestPending(username)
    try {
      await signIn({ username, password })
      router.replace("/dashboard")
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Der Gastzugang ist nicht erreichbar."
      toast.error(message, {
        description:
          "Die Demokonten legt das Backend mit `manage.py create_guest_users` an.",
      })
    } finally {
      setGuestPending(null)
    }
  }

  const isBusy = form.formState.isSubmitting || guestPending !== null

  return (
    <div className="grid gap-5">
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <Field
          label="Benutzername"
          htmlFor="username"
          error={form.formState.errors.username?.message}
        >
          <Input
            id="username"
            autoComplete="username"
            placeholder="z. B. andrey"
            className="h-10 text-sm"
            aria-invalid={Boolean(form.formState.errors.username)}
            {...form.register("username")}
          />
        </Field>

        <Field
          label="Passwort"
          htmlFor="password"
          error={form.formState.errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
        </Field>

        <Button type="submit" size="lg" disabled={isBusy} className="h-11 w-full">
          <LogInIcon data-icon="inline-start" />
          {form.formState.isSubmitting ? "Anmelden…" : "Anmelden"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        oder ohne Konto ausprobieren
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {GUEST_ACCOUNTS.map((guest) => (
          <Button
            key={guest.username}
            type="button"
            variant="outline"
            size="lg"
            className="h-11"
            disabled={isBusy}
            onClick={() => void signInAsGuest(guest.username, guest.password)}
          >
            {guestPending === guest.username ? "Anmelden…" : guest.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
