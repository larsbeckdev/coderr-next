"use client"

import * as React from "react"
import { ImagePlusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ImagePickerProps = {
  id: string
  /** URL of the picture already stored on the server, if there is one. */
  currentUrl?: string | null
  file: File | null
  onChange: (file: File | null) => void
  className?: string
}

const MAX_BYTES = 5 * 1024 * 1024

export function ImagePicker({
  id,
  currentUrl,
  file,
  onChange,
  className,
}: ImagePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [error, setError] = React.useState<string | null>(null)

  // An object URL holds the picked file in memory until it is revoked, so the
  // preview is torn down together with the file it belongs to.
  const previewUrl = React.useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  )

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function handleFiles(files: FileList | null) {
    const picked = files?.[0]
    if (!picked) {
      return
    }
    if (!picked.type.startsWith("image/")) {
      setError("Bitte wähle eine Bilddatei.")
      return
    }
    if (picked.size > MAX_BYTES) {
      setError("Das Bild darf höchstens 5 MB groß sein.")
      return
    }
    setError(null)
    onChange(picked)
  }

  function clear() {
    onChange(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const shownUrl = previewUrl ?? currentUrl ?? null

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="relative overflow-hidden rounded-xl border border-dashed border-border bg-muted">
        {shownUrl ? (
          <>
            {/* Either a blob: URL or an API URL whose host is only known at
                runtime - next/image can handle neither. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shownUrl}
              alt=""
              className="aspect-[16/9] w-full object-cover"
            />
            {file ? (
              <Button
                type="button"
                variant="outline"
                size="icon-md"
                aria-label="Auswahl verwerfen"
                onClick={clear}
                className="absolute top-2 right-2 bg-background"
              >
                <XIcon />
              </Button>
            ) : null}
          </>
        ) : (
          <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImagePlusIcon className="size-6" aria-hidden />
            <p className="text-xs">Noch kein Bild ausgewählt</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <Button
        type="button"
        variant="outline"
        size="md"
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlusIcon data-icon="inline-start" />
        {shownUrl ? "Bild ersetzen" : "Bild auswählen"}
      </Button>

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          JPG oder PNG, höchstens 5 MB.
        </p>
      )}
    </div>
  )
}
