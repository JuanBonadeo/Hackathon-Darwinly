"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/darwinly/sidebar"
import { Navbar } from "@/components/darwinly/navbar"
import { SearchResults } from "@/components/darwinly/search-results"
import { Footer } from "@/components/darwinly/footer"
import { cn } from "@/lib/utils"

const SEARCH_HISTORY_KEY = "darwinly-search-history"
const MAX_HISTORY_ITEMS = 10

export default function DiscoverPage({ params }: { params: Promise<{ q: string }> }) {
  const { q } = use(params)
  const query = decodeURIComponent(q)
  const router = useRouter()

  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
    let history: string[] = []
    if (stored) {
      try {
        history = JSON.parse(stored)
      } catch {
        history = []
      }
    }
    // Add current query to history if not already present
    const newHistory = [query, ...history.filter((t) => t !== query)].slice(0, MAX_HISTORY_ITEMS)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
    setSearchHistory(newHistory)
  }, [query])

  const saveHistory = (history: string[]) => {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
    setSearchHistory(history)
  }

  const handleSearchHistoryClick = (term: string) => {
    router.push(`/discover/${encodeURIComponent(term)}`)
  }

  const handleDeleteSearchHistory = (term: string) => {
    const newHistory = searchHistory.filter((item) => item !== term)
    saveHistory(newHistory)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        searchHistory={searchHistory}
        onSearchHistoryClick={handleSearchHistoryClick}
        onDeleteSearchHistory={handleDeleteSearchHistory}
        onLogoClick={() => {}}
        isDesktopExpanded={isDesktopSidebarExpanded}
        onDesktopExpandedChange={setIsDesktopSidebarExpanded}
      />

      <div
        className={cn(
          "transition-[margin-left] duration-300",
          "lg:ml-[120px]",
          isDesktopSidebarExpanded && "lg:ml-[260px]"
        )}
      >
        <Navbar isDesktopSidebarExpanded={isDesktopSidebarExpanded} />
        <main>
          <SearchResults query={query} />
        </main>
        <Footer />
      </div>
    </div>
  )
}
