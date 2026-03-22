"use client"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

const TRENDING_CONCEPTS = [
  "Artificial Intelligence",
  "Avalanche Crypto",
  "Bitcoin",
  "Blockchain",
  "Climate Change",
  "Donald Trump",
  "Elon Musk",
  "Javier Milei",
  "Racism",
  "Ukraine War",
  "World War III",

]

interface HeroSectionProps {
  onSearch: (term: string) => void
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchValue, setSearchValue] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [skipAnim, setSkipAnim] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("hero-anim-played")
    if (hasPlayed) setSkipAnim(true)
    else sessionStorage.setItem("hero-anim-played", "1")
    const frame = window.requestAnimationFrame(() => setIsVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const submitSearch = (rawTerm: string) => {
    const term = rawTerm.trim()
    if (!term) return
    onSearch(term)
    setSearchValue("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitSearch(searchValue)
  }

  const activeConcept = TRENDING_CONCEPTS.find(
    (concept) => concept.toLowerCase() === searchValue.trim().toLowerCase()
  )

  const titleWords = "See how any idea evolved across human knowledge.".split(" ")
  // Last word delay + buffer before next element
  const subtitleDelay  = titleWords.length * 100 + 100
  const searchDelay    = subtitleDelay + 420
  const labelDelay     = searchDelay + 320
  const pillBaseDelay  = labelDelay + 80
  const footerDelay    = pillBaseDelay + TRENDING_CONCEPTS.length * 45 + 100

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-[12%] h-64 w-64 rounded-full bg-foreground/5 blur-3xl" />
        <div className="absolute bottom-8 right-[8%] h-72 w-72 rounded-full bg-muted/60 blur-3xl" />
      </div>

      {isVisible && (
        <div className="max-w-3xl text-left">

          {/* Headline — word by word */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            {titleWords.map((word, i) => (
              <span
                key={i}
                className={cn("inline-block mr-[0.28em] last:mr-0", !skipAnim && "animate-word-in")}
                style={!skipAnim ? { animationDelay: `${i * 100}ms` } : undefined}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Subheadline — slides up */}
          <p
            className={cn("mt-5 text-lg sm:text-xl text-muted-foreground", !skipAnim && "animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both")}
            style={!skipAnim ? { animationDelay: `${subtitleDelay}ms` } : undefined}
          >
            Cross-reference books, science, news, movies, and public interest to reveal the full timeline of any concept — powered by AI.
          </p>

          {/* Search Bar — materializes */}
          <form
            onSubmit={handleSubmit}
            className={cn("mt-8 w-full", !skipAnim && "animate-materialize")}
            style={!skipAnim ? { animationDelay: `${searchDelay}ms` } : undefined}
          >
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={isMobile ? 'Try "artificial intelligence"...' : 'Try "artificial intelligence" or "climate change"...'}
                className="w-full h-14 pl-5 pr-14 rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all text-base shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.04)]"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8">
              <p
                className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider mb-3 animate-in fade-in duration-500 fill-mode-both"
                style={{ animationDelay: `${labelDelay}ms` }}
              >
                Trending Concepts
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {TRENDING_CONCEPTS.map((concept, i) => {
                  const isActive = activeConcept === concept
                  return (
                    <button
                      key={concept}
                      type="button"
                      onClick={() => {
                        setSearchValue(concept)
                        submitSearch(concept)
                      }}
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap animate-pop-in",
                        "transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-out",
                        "bg-muted/35 text-muted-foreground border-border/50",
                        "hover:-translate-y-0.5 hover:bg-card hover:text-foreground hover:border-foreground/30",
                        "hover:shadow-[0_10px_25px_-14px_rgba(56,189,248,0.65)]",
                        "active:translate-y-0 active:shadow-none",
                        isActive && "border-foreground/50 bg-foreground/12 text-foreground shadow-[0_8px_22px_-14px_rgba(56,189,248,0.7)]"
                      )}
                      style={{ animationDelay: `${pillBaseDelay + i * 45}ms` }}
                      aria-label={`Search ${concept}`}
                    >
                      {concept}
                    </button>
                  )
                })}
              </div>
            </div>
          </form>

          <p
            className="mt-5 text-sm text-muted-foreground/60 font-light animate-in fade-in duration-500 fill-mode-both"
            style={{ animationDelay: `${footerDelay}ms` }}
          >
            Free to use · No sign-up required
          </p>
        </div>
      )}
    </section>
  )
}
