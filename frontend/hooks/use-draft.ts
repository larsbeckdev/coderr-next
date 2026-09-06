"use client"

import * as React from "react"

/**
 * Local editing state that follows an external value without an effect.
 *
 * Search and price inputs are typed into freely and only applied on submit,
 * but they still have to catch up when the URL changes from somewhere else -
 * the header search, a reset link, the back button. React's own answer to
 * "adjust state when a prop changes" is to compare during render and set
 * immediately, which re-renders before the browser paints. Doing it in an
 * effect instead paints the stale value first and costs a second render.
 */
export function useDraft<T>(external: T): [T, (next: T) => void] {
  const [draft, setDraft] = React.useState(external)
  const [lastExternal, setLastExternal] = React.useState(external)

  if (lastExternal !== external) {
    setLastExternal(external)
    setDraft(external)
  }

  return [draft, setDraft]
}
