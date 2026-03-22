"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button type="button" className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-accent transition-colors hover:brightness-95 cursor-pointer">
        <Sun className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="sr-only">Toggle theme</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-accent transition-colors hover:brightness-95 cursor-pointer"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-3.5 w-3.5 text-muted-foreground rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-3.5 w-3.5 text-muted-foreground rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
