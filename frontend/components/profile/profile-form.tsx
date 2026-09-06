"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SaveIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Field } from "@/components/forms/field"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateProfile, useUpdateProfilePicture } from "@/hooks/use-profiles"
import { ApiError } from "@/lib/api/client"
import type { Profile } from "@/lib/api/types"
import { displayName } from "@/lib/auth/use-session"

const profileSchema = z.object({
  first_name: z.string().trim().max(150),
  last_name: z.string().trim().max(150),
  email: z
    .string()
    .trim()
    .min(1, "Bitte gib eine E-Mail-Adresse an.")
    .email("Das sieht nicht nach einer E-Mail-Adresse aus."),
  location: z.string().trim().max(255),
  tel: z.string().trim().max(50),
  working_hours: z.string().trim().max(100),
  description: z.string().trim(),
})

type ProfileValues = z.infer<typeof profileSchema>

export function ProfileForm({ profile }: { profile: Profile }) {
  const updateProfile = useUpdateProfile(profile.user)
  const updatePicture = useUpdateProfilePicture(profile.user)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const isBusiness = profile.type === "business"

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      location: profile.location,
      tel: profile.tel,
      working_hours: profile.working_hours,
      description: profile.description,
    },
  })

  async function onSubmit(values: ProfileValues) {
    try {
      await updateProfile.mutateAsync(values)
      toast.success("Profil gespeichert")
      form.reset(values)
    } catch (error) {
      if (error instanceof ApiError) {
        const emailError = error.fieldErrors.email?.[0]
        if (emailError) {
          form.setError("email", { message: emailError })
          return
        }
        toast.error(error.message)
        return
      }
      toast.error("Das Profil konnte nicht gespeichert werden.")
    }
  }

  async function uploadPicture(file: File | undefined) {
    if (!file) {
      return
    }
    try {
      await updatePicture.mutateAsync(file)
      toast.success("Profilbild aktualisiert")
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Das Bild konnte nicht hochgeladen werden."
      )
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const name = displayName(profile.first_name, profile.last_name, profile.username)

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8">
      <section className="flex flex-wrap items-center gap-5 rounded-xl border border-border bg-card p-5">
        <UserAvatar name={name} src={profile.file} size="lg" className="size-16" />
        <div className="grid gap-1">
          <p className="font-heading font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">
            @{profile.username} · {isBusiness ? "Anbieter" : "Kunde"}
          </p>
        </div>

        <input
          ref={fileInputRef}
          id="profile-picture"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => void uploadPicture(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="md"
          className="ml-auto"
          disabled={updatePicture.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon data-icon="inline-start" />
          {updatePicture.isPending ? "Wird hochgeladen…" : "Profilbild ändern"}
        </Button>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Vorname"
          htmlFor="first_name"
          error={form.formState.errors.first_name?.message}
        >
          <Input id="first_name" className="h-10 text-sm" {...form.register("first_name")} />
        </Field>

        <Field
          label="Nachname"
          htmlFor="last_name"
          error={form.formState.errors.last_name?.message}
        >
          <Input id="last_name" className="h-10 text-sm" {...form.register("last_name")} />
        </Field>

        <Field
          label="E-Mail"
          htmlFor="email"
          className="sm:col-span-2"
          error={form.formState.errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            className="h-10 text-sm"
            {...form.register("email")}
          />
        </Field>
      </section>

      {isBusiness ? (
        <section className="grid gap-5">
          <h2 className="font-heading text-lg font-bold">Angaben für Kunden</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ort" htmlFor="location">
              <Input
                id="location"
                placeholder="z. B. Berlin"
                className="h-10 text-sm"
                {...form.register("location")}
              />
            </Field>

            <Field label="Telefon" htmlFor="tel">
              <Input id="tel" type="tel" className="h-10 text-sm" {...form.register("tel")} />
            </Field>

            <Field
              label="Arbeitszeiten"
              htmlFor="working_hours"
              className="sm:col-span-2"
              hint="z. B. Mo–Fr, 9–17 Uhr"
            >
              <Input
                id="working_hours"
                className="h-10 text-sm"
                {...form.register("working_hours")}
              />
            </Field>
          </div>

          <Field
            label="Über dich"
            htmlFor="description"
            hint="Erscheint auf deinem Profil und neben jedem deiner Angebote."
          >
            <Textarea
              id="description"
              rows={6}
              className="text-sm"
              {...form.register("description")}
            />
          </Field>
        </section>
      ) : null}

      <div>
        <Button
          type="submit"
          size="xl"
          disabled={updateProfile.isPending || !form.formState.isDirty}
        >
          <SaveIcon data-icon="inline-start" />
          {updateProfile.isPending ? "Wird gespeichert…" : "Änderungen speichern"}
        </Button>
      </div>
    </form>
  )
}
