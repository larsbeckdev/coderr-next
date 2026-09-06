import type { LucideIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"

type StatCardProps = {
  label: string
  value: string | number | undefined
  icon: LucideIcon
  hint?: string
}

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <div className="grid gap-2 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 text-primary" aria-hidden />
        {label}
      </div>
      {value === undefined ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <p className="font-heading text-2xl font-bold">{value}</p>
      )}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
