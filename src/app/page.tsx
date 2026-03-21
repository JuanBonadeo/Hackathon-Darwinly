"use client"

import { useState, useEffect, useRef } from "react"
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
  const [pendingQuery, setPendingQuery] = useState<string | null>(null)
  const [isTransitioningToResults, setIsTransitioningToResults] = useState(false)
  const transitionStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transitionEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

    return () => {
      if (transitionStartTimerRef.current) {
        clearTimeout(transitionStartTimerRef.current)
      }
      if (transitionEndTimerRef.current) {
        clearTimeout(transitionEndTimerRef.current)
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

    if (activeQuery) {
      setActiveQuery(term)
      return
    }

    if (transitionStartTimerRef.current) {
      clearTimeout(transitionStartTimerRef.current)
    }
    if (transitionEndTimerRef.current) {
      clearTimeout(transitionEndTimerRef.current)
    }

    setPendingQuery(term)
    setIsTransitioningToResults(true)

    transitionStartTimerRef.current = setTimeout(() => {
      setActiveQuery(term)
      window.scrollTo({ top: 0, behavior: "auto" })
    }, 680)

    transitionEndTimerRef.current = setTimeout(() => {
      setIsTransitioningToResults(false)
      setPendingQuery(null)
    }, 1320)
  }

  const handleSearchHistoryClick = (term: string) => {
    handleSearch(term)
  }

  const handleDeleteSearchHistory = (term: string) => {
    const newHistory = searchHistory.filter((item) => item !== term)
    saveHistory(newHistory)
  }

  const handleBackToHome = () => {
    if (transitionStartTimerRef.current) {
      clearTimeout(transitionStartTimerRef.current)
    }
    if (transitionEndTimerRef.current) {
      clearTimeout(transitionEndTimerRef.current)
    }
    setIsTransitioningToResults(false)
    setPendingQuery(null)
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
        onDeleteSearchHistory={handleDeleteSearchHistory}
        onLogoClick={handleBackToHome}
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
        <main className="relative">
          <div
            className={cn(
              "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isTransitioningToResults && "scale-[0.997] opacity-65 blur-[1px] pointer-events-none"
            )}
          >
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
          </div>

          {isTransitioningToResults && (
            <div className="search-transition-overlay" aria-hidden="true">
              <div className="search-transition-backdrop" />
              <div className="search-transition-glow" />

              <div className="search-transition-content">
                <div className="search-transition-rings">
                  <span className="search-transition-ring search-transition-ring-lg" />
                  <span className="search-transition-ring search-transition-ring-md" />
                  <span className="search-transition-ring search-transition-ring-sm" />
                  <span className="search-transition-core" />
                </div>

                <div className="search-transition-label">
                  Analyzing <strong>{pendingQuery ?? "your query"}</strong>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
