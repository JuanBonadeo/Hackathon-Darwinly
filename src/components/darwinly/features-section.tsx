"use client"

import { useEffect, useRef, useState } from "react"
import { BookOpen, FlaskConical, Newspaper, Film, Globe, Sparkles, Github, TrendingUp, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: BookOpen,
    title: "Books",
    description: "Track when a concept entered published literature, sorted by editions.",
    source: "Open Library"
  },
  {
    icon: FlaskConical,
    title: "Science",
    description: "Millions of academic papers indexed by year. See when researchers started studying a topic.",
    source: "CORE API"
  },
  {
    icon: Newspaper,
    title: "News",
    description: "170+ years of journalism. See when the press picked up the story.",
    source: "New York Times"
  },
  {
    icon: Film,
    title: "Movies",
    description: "Hollywood as a cultural mirror. Track when filmmakers turned concepts into stories.",
    source: "TMDB"
  },
  {
    icon: Globe,
    title: "Public Interest",
    description: "Real-time attention data from Wikipedia. When did people start caring?",
    source: "Wikipedia"
  },
  {
    icon: Github,
    title: "Developer Activity",
    description: "Track when developers started building around a concept — commits, repos, and open-source momentum over time.",
    source: "GitHub API"
  },
  {
    icon: TrendingUp,
    title: "Crypto Markets",
    description: "Price history, market cap, and trading volume. See when a concept became a financial phenomenon.",
    source: "CoinMarketCap"
  },
  {
    icon: BarChart2,
    title: "Macro Economics",
    description: "World Bank indicators — GDP, inflation, and development data tied to when concepts reshaped economies.",
    source: "World Bank"
  }
]

const Source = ({ label }: { label: string }) => (
  <span className="self-start text-[10px] font-light tracking-wider text-muted-foreground/50 border border-border/40 px-2 py-0.5 rounded-full uppercase">
    {label}
  </span>
)

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.02, rootMargin: "0px 0px -8% 0px" }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const anim = (i: number) => ({
    className: cn(
      "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.34,1.1,0.64,1)]",
      isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.94]"
    ),
    style: { transitionDelay: isVisible ? `${i * 70}ms` : "0ms" }
  })

  return (
    <section ref={sectionRef} id="features" className="px-6 py-28">
      <div className="section-shell max-w-6xl mx-auto px-6 py-14 sm:px-10 sm:py-16">

        <div className="mb-10">
          <span className="section-kicker">Knowledge lenses</span>
          <h2
            className={cn(
              "mt-5 max-w-2xl text-3xl sm:text-4xl font-semibold text-foreground transition-all duration-1200 ease-out",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            One search. Nine dimensions of knowledge.
          </h2>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground">
            Each lens captures a different signal — science, culture, media, markets, and collective attention.
          </p>
        </div>

        {/* ── Mobile / tablet: simple 2-col grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
          {[{ icon: Sparkles, title: "AI Narrative", description: "AI writes a historical narrative connecting all the data — key moments, paradoxes, and hidden patterns.", source: "Claude AI" }, ...features].map((f, i) => (
            <div key={f.title} {...anim(i)} className={cn(anim(i).className, "feature-card p-5 flex flex-col gap-3")}>
              <f.icon className="h-5 w-5 text-foreground" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
              <Source label={f.source} />
            </div>
          ))}
        </div>

        {/* ── Desktop: wild 6-col bento ── */}
        <div
          className="hidden lg:grid grid-cols-6 gap-3"
          style={{ gridTemplateRows: "repeat(3, minmax(110px, auto)) minmax(100px, auto)" }}
        >

          {/* AI Narrative — hero, col 1-3 × row 1-3 */}
          <div
            {...anim(0)}
            className={cn(
              anim(0).className,
              "feature-card relative overflow-hidden col-start-1 col-span-3 row-start-1 row-span-3 p-8 flex flex-col justify-between"
            )}
          >
            {/* Floating decorations */}
            <Sparkles className="animate-float absolute -right-8 -bottom-8 h-44 w-44 text-foreground/[0.035] pointer-events-none" />
            <Sparkles className="animate-float-reverse absolute right-16 top-6 h-16 w-16 text-foreground/5 pointer-events-none" />
            <Sparkles className="h-8 w-8 text-foreground relative z-10" />
            <div>
              <h3 className="text-3xl font-semibold text-foreground tracking-tight mb-3">AI Narrative</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-5">
                AI writes a historical narrative connecting all the data — key moments, paradoxes, and hidden patterns.
              </p>
              <Source label="Claude AI" />
            </div>
          </div>

          {/* Books — col 4-5, row 1 */}
          <div {...anim(1)} className={cn(anim(1).className, "feature-card col-start-4 col-span-2 row-start-1 p-5 flex flex-col justify-between gap-3")}>
            <BookOpen className="h-5 w-5 text-foreground" />
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">Books</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Track when a concept entered published literature, sorted by editions.</p>
            </div>
            <Source label="Open Library" />
          </div>

          {/* Science — col 6, row 1 — compact, no desc */}
          <div {...anim(2)} className={cn(anim(2).className, "feature-card col-start-6 col-span-1 row-start-1 p-5 flex flex-col justify-between gap-2")}>
            <FlaskConical className="h-5 w-5 text-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Science</h3>
            <Source label="CORE API" />
          </div>

          {/* News — col 4-5, row 2 */}
          <div {...anim(3)} className={cn(anim(3).className, "feature-card col-start-4 col-span-2 row-start-2 p-5 flex flex-col justify-between gap-3")}>
            <Newspaper className="h-5 w-5 text-foreground" />
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">News</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">170+ years of journalism. See when the press picked up the story.</p>
            </div>
            <Source label="New York Times" />
          </div>

          {/* Movies — col 6, row 2 — compact */}
          <div {...anim(4)} className={cn(anim(4).className, "feature-card col-start-6 col-span-1 row-start-2 p-5 flex flex-col justify-between gap-2")}>
            <Film className="h-5 w-5 text-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Movies</h3>
            <Source label="TMDB" />
          </div>

          {/* Public Interest — col 4-6, row 3 — wide landscape */}
          <div {...anim(5)} className={cn(anim(5).className, "feature-card col-start-4 col-span-3 row-start-3 p-5 flex flex-row items-center gap-5")}>
            <Globe className="h-6 w-6 text-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground mb-0.5">Public Interest</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Real-time attention data from Wikipedia. When did people start caring?</p>
            </div>
            <Source label="Wikipedia" />
          </div>

          {/* Developer Activity — col 1-2, row 4 */}
          <div {...anim(6)} className={cn(anim(6).className, "feature-card col-start-1 col-span-2 row-start-4 p-5 flex flex-row items-center gap-4")}>
            <Github className="h-5 w-5 text-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-0.5">Developer Activity</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">Commits, repos, and open-source momentum over time.</p>
            </div>
            <Source label="GitHub API" />
          </div>

          {/* Crypto — col 3-4, row 4 */}
          <div {...anim(7)} className={cn(anim(7).className, "feature-card col-start-3 col-span-2 row-start-4 p-5 flex flex-row items-center gap-4")}>
            <TrendingUp className="h-5 w-5 text-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-0.5">Crypto Markets</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">Price, market cap, and volume. When did it become financial?</p>
            </div>
            <Source label="CoinMarketCap" />
          </div>

          {/* World Bank — col 5-6, row 4 */}
          <div {...anim(8)} className={cn(anim(8).className, "feature-card col-start-5 col-span-2 row-start-4 p-5 flex flex-row items-center gap-4")}>
            <BarChart2 className="h-5 w-5 text-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-0.5">Macro Economics</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">GDP, inflation, and development data. World Bank indicators.</p>
            </div>
            <Source label="World Bank" />
          </div>

        </div>
      </div>
    </section>
  )
}
