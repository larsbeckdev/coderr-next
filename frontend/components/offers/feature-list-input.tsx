"use client"

import * as React from "react"
import { PlusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type FeatureListInputProps = {
  id: string
  value: string[]
  onChange: (features: string[]) => void
}

/**
 * The API stores features as a plain JSON array of strings. Chips keep that
 * one-value-per-entry shape visible, where a textarea would invite a comma
 * separated list that has to be guessed apart again.
 */
export function FeatureListInput({
  id,
  value,
  onChange,
}: FeatureListInputProps) {
  const [draft, setDraft] = React.useState("")

  function add() {
    const feature = draft.trim()
    if (!feature || value.includes(feature)) {
      setDraft("")
      return
    }
    onChange([...value, feature])
    setDraft("")
  }

  function remove(feature: string) {
    onChange(value.filter((entry) => entry !== feature))
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          placeholder="z. B. Responsive Design"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              // Inside a form Enter would submit, and adding a feature is
              // almost never what someone wants to submit on.
              event.preventDefault()
              add()
            }
          }}
          className="h-9 text-sm"
        />
        <Button type="button" variant="outline" size="md" onClick={add}>
          <PlusIcon data-icon="inline-start" />
          Hinzufügen
        </Button>
      </div>

      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((feature) => (
            <li key={feature}>
              <span className="flex items-center gap-1 rounded-full bg-brand-soft py-1 pr-1 pl-3 text-xs text-brand-soft-foreground">
                {feature}
                <button
                  type="button"
                  onClick={() => remove(feature)}
                  aria-label={`${feature} entfernen`}
                  className="rounded-full p-0.5 transition-colors hover:bg-black/10"
                >
                  <XIcon className="size-3" aria-hidden />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          Noch keine Leistungen erfasst.
        </p>
      )}
    </div>
  )
}
