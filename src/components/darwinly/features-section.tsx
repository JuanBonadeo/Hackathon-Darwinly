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
    icon: Sparkles,
    title: "AI Narrative",
    description: "AI writes a historical narrative connecting all the data — key moments, paradoxes, and hidden patterns.",
    source: "Claude AI"
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
    source: "CoinGecko"
  },
  {
    icon: BarChart2,
    title: "Macro Economics",
    description: "World Bank indicators — GDP, inflation, and development data tied to when concepts reshaped economies.",
    source: "World Bank"
  }
]

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.02, rootMargin: "0px 0px -8% 0px" }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="features" className="px-6 py-28">
      <div className="section-shell max-w-6xl mx-auto px-6 py-14 sm:px-10 sm:py-16">
        <div className="text-center">
          <span className="section-kicker">Knowledge lenses</span>
        </div>

        <h2 
          className={cn(
            "mx-auto mt-5 max-w-2xl text-3xl sm:text-4xl font-semibold text-center text-foreground mb-6 transition-all duration-1200 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          One search. Nine dimensions of knowledge.
        </h2>

        <p className="mx-auto mb-14 max-w-2xl text-center text-sm text-muted-foreground">
          Each lens captures a different signal, so the same concept can be read as science, culture, media and collective attention.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                "feature-card p-6 transition-all duration-1100 ease-out",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: isVisible ? `${index * 140}ms` : "0ms" }}
            >
              <div className="mb-4">
                <feature.icon className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {feature.description}
              </p>
              <p className="text-xs text-muted-foreground/70 font-light tracking-wide">
                {feature.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
