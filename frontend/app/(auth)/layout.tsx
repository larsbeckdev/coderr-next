import Image from "next/image"

import { SessionGate } from "@/components/auth/session-gate"
import { Logo } from "@/components/brand/logo"
import { SiteFooter } from "@/components/layout/site-footer"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionGate expects="guest" redirectTo="/dashboard">
      <div className="flex min-h-dvh flex-col">
        <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
          <section className="hero-surface relative hidden overflow-hidden lg:flex lg:flex-col lg:p-12">
            <Image
              src="/img/hero-bg.png"
              alt=""
              aria-hidden
              fill
              priority
              className="pointer-events-none object-cover opacity-20 mix-blend-luminosity"
            />
            <div className="relative">
              <Logo href="/" width={148} className="[&_img]:brightness-0 [&_img]:invert" />
            </div>

            <div className="relative my-auto max-w-md text-white">
              <h1 className="font-heading text-4xl leading-tight font-bold">
                Entwicklung buchen,
                <br />
                ohne Umwege.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/85">
                Coderr bringt Auftraggeber und IT-Freelancer zusammen: feste
                Pakete, klare Preise, Lieferzeit und Bewertungen auf einen
                Blick.
              </p>
            </div>
          </section>

          <main className="flex flex-col justify-center px-4 py-10 sm:px-10">
            <div className="mx-auto w-full max-w-sm">
              <Logo href="/" className="mb-8 lg:hidden" />
              {children}
            </div>
          </main>
        </div>
        <SiteFooter />
      </div>
    </SessionGate>
  )
}
