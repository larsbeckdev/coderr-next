"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { useIsHydrated } from "@/hooks/use-is-hydrated"

/**
 * The resolved theme is only known in the browser, so the button renders a
 * neutral placeholder on the server and swaps in the real icon after
 * hydration. Rendering the icon straight away would mismatch.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isHydrated = useIsHydrated()
  const isDark = resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={
        isDark ? "Zum hellen Design wechseln" : "Zum dunklen Design wechseln"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isHydrated && isDark ? <MoonIcon /> : <SunIcon />}
    </Button>
  )
}
