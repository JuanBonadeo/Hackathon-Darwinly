"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 lg:left-[260px] z-40 transition-all duration-300",
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-b border-border" 
          : "bg-transparent"
      )}
    >
      <div className="flex items-center justify-end h-14 px-6">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="border-border">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}
