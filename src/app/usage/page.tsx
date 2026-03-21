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

export default function UsagePage() {
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
          "transition-[margin-left] duration-300",
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

            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Usage</h1>
            <p className="text-muted-foreground">
              This page will show your usage metrics, including total searches, deep dives, and recent activity.
            </p>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total searches</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">-</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Deep dives</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">-</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Last 7 days</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">-</p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
