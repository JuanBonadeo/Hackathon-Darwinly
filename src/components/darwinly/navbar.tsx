"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
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
          ? "bg-background/80 backdrop-blur-md" 
          : "bg-transparent"
      )}
    >
      <div className="flex items-center justify-end h-14 px-4 gap-2">
        <ThemeToggle />
        <Link
          href="/"
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-accent transition-colors hover:brightness-95"
          aria-label="Home"
        >
          <Image src="/logo.svg" alt="Darwinly" width={25} height={25} className="h-6.25 w-6.25 object-contain" />
        </Link>
      </div>
    </header>
  )
}
