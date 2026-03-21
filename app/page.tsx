"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/darwinly/sidebar"
import { Navbar } from "@/components/darwinly/navbar"
import { HeroSection } from "@/components/darwinly/hero-section"
import { HowItWorksSection } from "@/components/darwinly/how-it-works-section"
import { FeaturesSection } from "@/components/darwinly/features-section"
import { UseCasesSection } from "@/components/darwinly/use-cases-section"
import { PricingSection } from "@/components/darwinly/pricing-section"
import { Footer } from "@/components/darwinly/footer"
import { SearchResults } from "@/components/darwinly/search-results"
import { cn } from "@/lib/utils"

const SEARCH_HISTORY_KEY = "darwinly-search-history"
const MAX_HISTORY_ITEMS = 10

export default function HomePage() {
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(false)
    const [activeQuery, setActiveQuery] = useState<string | null>(null)

  // Load search history from localStorage on mount
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

  // Save search history to localStorage
  const saveHistory = (history: string[]) => {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
    setSearchHistory(history)
  }

  const handleSearch = (term: string) => {
    // Add to history (avoid duplicates, keep most recent first)
    const newHistory = [term, ...searchHistory.filter((t) => t !== term)].slice(
      0,
      MAX_HISTORY_ITEMS
    )
    saveHistory(newHistory)
    
      // Set active query to show results
      setActiveQuery(term)
  }

  const handleSearchHistoryClick = (term: string) => {
    handleSearch(term)
  }

    const handleBackToHome = () => {
      setActiveQuery(null)
    }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        searchHistory={searchHistory} 
        onSearchHistoryClick={handleSearchHistoryClick}
        isDesktopExpanded={isDesktopSidebarExpanded}
        onDesktopExpandedChange={setIsDesktopSidebarExpanded}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "transition-[margin-left] duration-300",
          "lg:ml-[120px]",
          isDesktopSidebarExpanded && "lg:ml-[260px]"
        )}
      >
        {/* Navbar */}
        <Navbar isDesktopSidebarExpanded={isDesktopSidebarExpanded} />

        {/* Main Content */}
        <main>
            {!activeQuery ? (
              <>
                <HeroSection onSearch={handleSearch} />
                <HowItWorksSection />
                <FeaturesSection />
                <UseCasesSection />
                <PricingSection />
              </>
            ) : (
              <SearchResults query={activeQuery} onBack={handleBackToHome} />
            )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
