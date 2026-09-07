"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SaveIcon } from "lucide-react"
import { toast } from "sonner"

import { Field } from "@/components/forms/field"
import { ImagePicker } from "@/components/forms/image-picker"
import { OfferPackageFields } from "@/components/offers/offer-package-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LinkButton } from "@/components/ui/link-button"
import { Textarea } from "@/components/ui/textarea"
import { useCreateOffer, useUpdateOffer } from "@/hooks/use-offers"
import { ApiError } from "@/lib/api/client"
import { OFFER_TYPES } from "@/lib/api/types"
import {
  emptyOfferValues,
  offerFormSchema,
  toPackagePayload,
} from "@/lib/offer-form"
import type { OfferFormValues } from "@/lib/offer-form"

type OfferFormProps = {
  /** Absent when a new offer is being created. */
  offerId?: number
  currentImageUrl?: string | null
  defaultValues?: OfferFormValues
}

export function OfferForm({
  offerId,
  currentImageUrl,
  defaultValues,
}: OfferFormProps) {
  const router = useRouter()
  const [image, setImage] = React.useState<File | null>(null)
  const createOffer = useCreateOffer()
  const updateOffer = useUpdateOffer(offerId ?? 0)
  const isEditing = typeof offerId === "number"

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: defaultValues ?? emptyOfferValues(),
  })

  async function onSubmit(values: OfferFormValues) {
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      details: toPackagePayload(values.details),
    }

    try {
      if (isEditing) {
        await updateOffer.mutateAsync({ payload, image })
        toast.success("Angebot aktualisiert")
        router.push(`/offers/${offerId}`)
        return
      }
      const created = await createOffer.mutateAsync({ payload, image })
      toast.success("Angebot veröffentlicht")
      router.push(`/offers/${created.id}`)
    } catch (error) {
      if (error instanceof ApiError) {
        const detailError = error.fieldErrors.details?.[0]
        form.setError("root", { message: detailError ?? error.message })
        toast.error(detailError ?? error.message)
        return
      }
      toast.error("Das Angebot konnte nicht gespeichert werden.")
    }
  }

  const isPending = createOffer.isPending || updateOffer.isPending

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="grid gap-5">
          <Field
            label="Titel des Angebots"
            htmlFor="title"
            error={form.formState.errors.title?.message}
          >
            <Input
              id="title"
              placeholder="z. B. Moderne Landingpage mit Next.js"
              className="h-10 text-sm"
              {...form.register("title")}
            />
          </Field>

          <Field
            label="Beschreibung"
            htmlFor="description"
            hint="Was bekommt der Kunde, wie läuft die Zusammenarbeit ab?"
            error={form.formState.errors.description?.message}
          >
            <Textarea
              id="description"
              rows={8}
              className="text-sm"
              {...form.register("description")}
            />
          </Field>
        </div>

        <Field label="Titelbild" htmlFor="image">
          <ImagePicker
            id="image"
            currentUrl={currentImageUrl}
            file={image}
            onChange={setImage}
          />
        </Field>
      </section>

      <section className="grid gap-5">
        <div>
          <h2 className="font-heading text-xl font-bold">Pakete</h2>
          <p className="text-sm text-muted-foreground">
            Jedes Angebot braucht genau ein Basic-, Standard- und Premium-Paket.
          </p>
        </div>

        <div className="grid gap-5">
          {OFFER_TYPES.map((offerType, index) => (
            <OfferPackageFields
              key={offerType}
              form={form}
              index={index}
              offerType={offerType}
            />
          ))}
        </div>
      </section>

      {form.formState.errors.root ? (
        <p role="alert" className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="xl" disabled={isPending}>
          <SaveIcon data-icon="inline-start" />
          {isPending
            ? "Wird gespeichert…"
            : isEditing
              ? "Änderungen speichern"
              : "Angebot veröffentlichen"}
        </Button>
        <LinkButton
          type="button"
          variant="ghost"
          size="xl"
          href={isEditing ? `/offers/${offerId}` : "/offers"}
        >
          Abbrechen
        </LinkButton>
      </div>
    </form>
  )
}
