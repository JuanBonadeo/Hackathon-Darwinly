"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/darwinly/sidebar"
import { Navbar } from "@/components/darwinly/navbar"
import { HeroSection } from "@/components/darwinly/hero-section"
import { HowItWorksSection } from "@/components/darwinly/how-it-works-section"
import { FeaturesSection } from "@/components/darwinly/features-section"
import { UseCasesSection } from "@/components/darwinly/use-cases-section"
import { PricingSection } from "@/components/darwinly/pricing-section"
import { Footer } from "@/components/darwinly/footer"
import { cn } from "@/lib/utils"

const SEARCH_HISTORY_KEY = "darwinly-search-history"
const MAX_HISTORY_ITEMS = 10

export default function HomePage() {
  const router = useRouter()
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (stored) {
      try {
        setSearchHistory(JSON.parse(stored))
      } catch {
        setSearchHistory([])
      }
    }
  }, [])

  const saveHistory = (history: string[]) => {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
    setSearchHistory(history)
  }

  const handleSearch = (term: string) => {
    const newHistory = [term, ...searchHistory.filter((t) => t !== term)].slice(0, MAX_HISTORY_ITEMS)
    saveHistory(newHistory)
    router.push(`/discover/${encodeURIComponent(term)}`)
  }

  const handleDeleteSearchHistory = (term: string) => {
    const newHistory = searchHistory.filter((item) => item !== term)
    saveHistory(newHistory)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        searchHistory={searchHistory}
        onSearchHistoryClick={handleSearch}
        onDeleteSearchHistory={handleDeleteSearchHistory}
        onLogoClick={() => {}}
        isDesktopExpanded={isDesktopSidebarExpanded}
        onDesktopExpandedChange={setIsDesktopSidebarExpanded}
      />

      <div
        className={cn(
          "transition-[margin-left] duration-420 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          "lg:ml-30",
          isDesktopSidebarExpanded && "lg:ml-65"
        )}
      >
        <Navbar isDesktopSidebarExpanded={isDesktopSidebarExpanded} />

        <main>
          <HeroSection onSearch={handleSearch} />
          <HowItWorksSection />
          <FeaturesSection />
          <UseCasesSection />
          <PricingSection />
        </main>

        <Footer />
      </div>
    </div>
  )
}
