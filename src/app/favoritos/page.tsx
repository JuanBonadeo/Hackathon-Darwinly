"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/darwinly/navbar"
import { Sidebar } from "@/components/darwinly/sidebar"
import { cn } from "@/lib/utils"

const SEARCH_HISTORY_KEY = "darwinly-search-history"
const MAX_HISTORY_ITEMS = 10

export default function StarredPage() {
  const router = useRouter()
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return []
    }

    const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (!stored) {
      return []
    }

    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  })
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(false)

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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        searchHistory={searchHistory}
        onSearchHistoryClick={handleSearch}
        onDeleteSearchHistory={handleDeleteSearchHistory}
        onLogoClick={() => {
          router.push("/")
        }}
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

        <main className="px-6 py-20">
          <div className="mx-auto max-w-4xl space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Starred</h1>
            <p className="text-muted-foreground">
              This page will list the searches you marked as starred.
            </p>

            <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
              You do not have any starred searches yet.
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
