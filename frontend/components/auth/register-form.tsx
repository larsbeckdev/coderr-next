"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { BriefcaseIcon, SearchIcon, UserPlusIcon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { PasswordInput } from "@/components/auth/password-input"
import { Field } from "@/components/forms/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import { signUp } from "@/lib/auth/sign-in"
import { cn } from "@/lib/utils"

const registerSchema = z
  .object({
    type: z.enum(["customer", "business"]),
    username: z
      .string()
      .min(3, "Der Benutzername braucht mindestens 3 Zeichen.")
      .max(150, "Der Benutzername ist zu lang."),
    email: z
      .string()
      .min(1, "Bitte gib deine E-Mail-Adresse ein.")
      .email("Das sieht nicht nach einer E-Mail-Adresse aus."),
    password: z.string().min(8, "Das Passwort braucht mindestens 8 Zeichen."),
    repeated_password: z.string().min(1, "Bitte wiederhole das Passwort."),
  })
  .refine((values) => values.password === values.repeated_password, {
    path: ["repeated_password"],
    message: "Die Passwörter stimmen nicht überein.",
  })

type RegisterValues = z.infer<typeof registerSchema>

const ROLE_OPTIONS = [
  {
    value: "customer",
    label: "Ich suche Unterstützung",
    hint: "Angebote buchen und bewerten",
    icon: SearchIcon,
  },
  {
    value: "business",
    label: "Ich biete Leistungen an",
    hint: "Angebote veröffentlichen und Aufträge annehmen",
    icon: BriefcaseIcon,
  },
] as const

export function RegisterForm() {
  const router = useRouter()
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      type: "customer",
      username: "",
      email: "",
      password: "",
      repeated_password: "",
    },
  })

  const selectedType = form.watch("type")

  async function onSubmit(values: RegisterValues) {
    try {
      await signUp(values)
      toast.success("Willkommen bei Coderr!")
      router.replace(values.type === "business" ? "/profile" : "/offers")
    } catch (error) {
      if (error instanceof ApiError) {
        // DRF answers with one entry per rejected field, so the message lands
        // on the input that caused it instead of in a generic banner.
        const fields: (keyof RegisterValues)[] = [
          "username",
          "email",
          "password",
          "repeated_password",
        ]
        let handled = false
        for (const field of fields) {
          const message = error.fieldErrors[field]?.[0]
          if (message) {
            form.setError(field, { message })
            handled = true
          }
        }
        if (!handled) {
          toast.error(error.message)
        }
        return
      }
      toast.error("Die Registrierung ist fehlgeschlagen.")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm text-muted-foreground">
          Wie möchtest du Coderr nutzen?
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ROLE_OPTIONS.map((option) => {
            const isActive = selectedType === option.value
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  isActive
                    ? "border-primary bg-brand-soft text-brand-soft-foreground"
                    : "border-border hover:border-primary/40 hover:bg-muted/60"
                )}
              >
                <input
                  type="radio"
                  value={option.value}
                  className="sr-only"
                  {...form.register("type")}
                />
                <option.icon
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className="grid gap-0.5">
                  <span className="text-sm font-semibold">{option.label}</span>
                  <span className="text-xs opacity-80">{option.hint}</span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <Field
        label="Benutzername"
        htmlFor="username"
        error={form.formState.errors.username?.message}
      >
        <Input
          id="username"
          autoComplete="username"
          className="h-10 text-sm"
          aria-invalid={Boolean(form.formState.errors.username)}
          {...form.register("username")}
        />
      </Field>

      <Field
        label="E-Mail"
        htmlFor="email"
        error={form.formState.errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="du@example.com"
          className="h-10 text-sm"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register("email")}
        />
      </Field>

      <Field
        label="Passwort"
        htmlFor="password"
        hint="Mindestens 8 Zeichen."
        error={form.formState.errors.password?.message}
      >
        <PasswordInput
          id="password"
          autoComplete="new-password"
          aria-invalid={Boolean(form.formState.errors.password)}
          {...form.register("password")}
        />
      </Field>

      <Field
        label="Passwort wiederholen"
        htmlFor="repeated_password"
        error={form.formState.errors.repeated_password?.message}
      >
        <PasswordInput
          id="repeated_password"
          autoComplete="new-password"
          aria-invalid={Boolean(form.formState.errors.repeated_password)}
          {...form.register("repeated_password")}
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        disabled={form.formState.isSubmitting}
        className="h-11 w-full"
      >
        <UserPlusIcon data-icon="inline-start" />
        {form.formState.isSubmitting ? "Konto wird erstellt…" : "Konto erstellen"}
      </Button>
    </form>
  )
}
