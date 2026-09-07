import type { Metadata } from "next"
import localFont from "next/font/local"

import "./globals.css"
import { AppProviders } from "@/components/app-providers"
import { cn } from "@/lib/utils"

const dmSans = localFont({
  variable: "--font-dm-sans",
  display: "swap",
  src: [
    {
      path: "./fonts/dm-sans-v15-latin-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/dm-sans-v15-latin-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/dm-sans-v15-latin-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/dm-sans-v15-latin-700.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/dm-sans-v15-latin-800.woff2",
      weight: "800",
      style: "normal",
    },
  ],
})

export const metadata: Metadata = {
  title: {
    default: "Coderr",
    template: "%s · Coderr",
  },
  description:
    "Coderr ist der Marktplatz für IT-Freelancer: Angebote vergleichen, direkt buchen und die Zusammenarbeit bewerten.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={cn("font-sans antialiased", dmSans.variable)}
    >
      <body className="min-h-dvh">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
