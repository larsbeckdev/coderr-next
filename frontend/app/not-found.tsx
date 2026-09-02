import Image from "next/image"
import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="brand-glow flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo href="/" width={140} />
      <Image
        src="/img/nothing-found.png"
        alt=""
        aria-hidden
        width={220}
        height={220}
        className="opacity-90"
      />
      <p className="font-heading text-5xl font-bold text-primary">404</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Diese Seite gibt es nicht. Vielleicht wurde das Angebot inzwischen
        entfernt.
      </p>
      <Button size="lg" className="h-10" render={<Link href="/offers" />}>
        Zu den Angeboten
      </Button>
    </div>
  )
}
