"use client"

import * as React from "react"
import { toast } from "sonner"

import { RatingInput } from "@/components/reviews/rating-input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field } from "@/components/forms/field"
import { Textarea } from "@/components/ui/textarea"
import { useCreateReview, useUpdateReview } from "@/hooks/use-reviews"
import { ApiError } from "@/lib/api/client"
import type { Review } from "@/lib/api/types"

type ReviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  businessUserId: number
  businessUserName: string
  /** Present when an existing review is being edited. */
  review?: Review | null
}

/**
 * Mount this only while it is open. The form state is seeded from the review
 * prop, and remounting is what resets it for the next provider - cheaper and
 * less error prone than copying props into state from an effect.
 */

export function ReviewDialog({
  open,
  onOpenChange,
  businessUserId,
  businessUserName,
  review,
}: ReviewDialogProps) {
  const createReview = useCreateReview()
  const updateReview = useUpdateReview()
  const [rating, setRating] = React.useState(review?.rating ?? 5)
  const [description, setDescription] = React.useState(
    review?.description ?? ""
  )
  const [error, setError] = React.useState<string | null>(null)

  const isPending = createReview.isPending || updateReview.isPending

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    try {
      if (review) {
        await updateReview.mutateAsync({
          reviewId: review.id,
          rating,
          description: description.trim(),
        })
        toast.success("Bewertung aktualisiert")
      } else {
        await createReview.mutateAsync({
          business_user: businessUserId,
          rating,
          description: description.trim(),
        })
        toast.success("Danke für deine Bewertung!")
      }
      onOpenChange(false)
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : "Die Bewertung konnte nicht gespeichert werden."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>
              {review ? "Bewertung bearbeiten" : `${businessUserName} bewerten`}
            </DialogTitle>
            <DialogDescription>
              Pro Anbieter ist eine Bewertung möglich. Du kannst sie später
              jederzeit ändern.
            </DialogDescription>
          </DialogHeader>

          <RatingInput name="rating" value={rating} onChange={setRating} />

          <Field
            label="Dein Kommentar"
            htmlFor="review-description"
            hint="Optional, hilft aber anderen bei der Auswahl."
          >
            <Textarea
              id="review-description"
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="text-sm"
            />
          </Field>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="md"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" size="md" disabled={isPending}>
              {isPending ? "Wird gespeichert…" : "Bewertung speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
