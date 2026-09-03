"use client"

import { BriefcaseIcon, MessageSquareIcon, PackageIcon, StarIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { useBaseInfo } from "@/hooks/use-base-info"
import { formatRating } from "@/lib/format"

export function PlatformStats() {
  const { data, isPending } = useBaseInfo()

  const stats = [
    { label: "Angebote", value: data?.offer_count, icon: PackageIcon },
    { label: "Bewertungen", value: data?.review_count, icon: MessageSquareIcon },
    { label: "Anbieter", value: data?.business_profile_count, icon: BriefcaseIcon },
    {
      label: "Zufriedenheit",
      value: data ? formatRating(data.average_rating) : undefined,
      icon: StarIcon,
    },
  ]

  return (
    <section className="mx-auto grid w-full max-w-[1440px] grid-cols-2 gap-4 px-4 py-12 sm:px-6 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-6 text-center"
        >
          <stat.icon className="mx-auto size-5 text-primary" aria-hidden />
          {isPending ? (
            <Skeleton className="mx-auto mt-3 h-8 w-16" />
          ) : (
            <p className="mt-3 font-heading text-3xl font-bold text-primary">
              {stat.value ?? "–"}
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </section>
  )
}
