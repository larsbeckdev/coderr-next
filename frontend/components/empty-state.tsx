import Image from "next/image"

import { cn } from "@/lib/utils"

type EmptyStateProps = {
  title: string
  description?: string
  /** Usually a Button that offers the way out of the empty state. */
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-dashed border-border px-6 py-16 text-center",
        className
      )}
    >
      <Image
        src="/img/nothing-found.png"
        alt=""
        aria-hidden
        width={160}
        height={160}
        className="opacity-80"
      />
      <div className="grid gap-1">
        <p className="font-heading text-lg font-semibold">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
