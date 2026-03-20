"use client"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
  onSearch: (term: string) => void
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchValue, setSearchValue] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      onSearch(searchValue.trim())
      setSearchValue("")
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <div 
        className={cn(
          "max-w-3xl mx-auto text-center transition-all duration-700 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance max-w-[700px] mx-auto">
          See how any idea evolved across human knowledge.
        </h1>

        {/* Subheadline */}
        <p className="mt-5 text-lg sm:text-xl text-muted-foreground max-w-[600px] mx-auto text-balance">
          Cross-reference books, science, news, movies, and public interest to reveal the full timeline of any concept — powered by AI.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="mt-8 max-w-[560px] mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={'Try "artificial intelligence" or "climate change"...'}
              className="w-full h-14 pl-5 pr-14 rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-transparent transition-all text-base"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Free to use label */}
        <p className="mt-4 text-sm text-muted-foreground/60 font-light">
          Free to use · No sign-up required
        </p>
      </div>
    </section>
  )
}
