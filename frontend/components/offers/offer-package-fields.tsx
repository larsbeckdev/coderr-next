"use client"

import type { UseFormReturn } from "react-hook-form"

import { FeatureListInput } from "@/components/offers/feature-list-input"
import { Field } from "@/components/forms/field"
import { Input } from "@/components/ui/input"
import type { OfferType } from "@/lib/api/types"
import { OFFER_TYPE_LABELS } from "@/lib/offer-meta"
import type { OfferFormValues } from "@/lib/offer-form"

type OfferPackageFieldsProps = {
  form: UseFormReturn<OfferFormValues>
  index: number
  offerType: OfferType
}

/** One of the three packages an offer must carry, always in the same order. */
export function OfferPackageFields({
  form,
  index,
  offerType,
}: OfferPackageFieldsProps) {
  const errors = form.formState.errors.details?.[index]
  const features = form.watch(`details.${index}.features`)

  return (
    <fieldset className="grid gap-4 rounded-xl border border-border bg-card p-5">
      <legend className="px-2 font-heading text-sm font-bold text-primary">
        {OFFER_TYPE_LABELS[offerType]}
      </legend>

      <Field
        label="Pakettitel"
        htmlFor={`details.${index}.title`}
        error={errors?.title?.message}
      >
        <Input
          id={`details.${index}.title`}
          placeholder="z. B. Landingpage"
          className="h-9 text-sm"
          {...form.register(`details.${index}.title`)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Preis (€)"
          htmlFor={`details.${index}.price`}
          error={errors?.price?.message}
        >
          <Input
            id={`details.${index}.price`}
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            className="h-9 text-sm"
            {...form.register(`details.${index}.price`)}
          />
        </Field>

        <Field
          label="Lieferzeit (Tage)"
          htmlFor={`details.${index}.delivery_time_in_days`}
          error={errors?.delivery_time_in_days?.message}
        >
          <Input
            id={`details.${index}.delivery_time_in_days`}
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            className="h-9 text-sm"
            {...form.register(`details.${index}.delivery_time_in_days`)}
          />
        </Field>

        <Field
          label="Überarbeitungen"
          htmlFor={`details.${index}.revisions`}
          hint="-1 für unbegrenzt"
          error={errors?.revisions?.message}
        >
          <Input
            id={`details.${index}.revisions`}
            type="number"
            min={-1}
            step={1}
            inputMode="numeric"
            className="h-9 text-sm"
            {...form.register(`details.${index}.revisions`)}
          />
        </Field>
      </div>

      <Field
        label="Enthaltene Leistungen"
        htmlFor={`details.${index}.features`}
        error={errors?.features?.message}
      >
        <FeatureListInput
          id={`details.${index}.features`}
          value={features}
          onChange={(next) =>
            form.setValue(`details.${index}.features`, next, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      </Field>
    </fieldset>
  )
}
