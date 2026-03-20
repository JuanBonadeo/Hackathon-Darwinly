"use client"

import { useEffect, useState } from "react"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"

interface NavbarProps {
  isDesktopSidebarExpanded: boolean
}

export function Navbar({ isDesktopSidebarExpanded }: NavbarProps) {
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
        "fixed top-0 right-0 left-0 z-40 transition-all duration-300 lg:left-[120px]",
        isDesktopSidebarExpanded && "lg:left-[260px]",
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-b border-border" 
          : "bg-transparent"
      )}
    >
      <div className="flex items-center justify-end h-14 px-6">
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
