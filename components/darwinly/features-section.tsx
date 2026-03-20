"use client"

import { useEffect, useRef, useState } from "react"
import { BookOpen, FlaskConical, Newspaper, Film, Globe, Sparkles } from "lucide-react"
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
  }
]

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="features" className="py-24 px-6 bg-secondary/30">
      <div className="max-w-5xl mx-auto">
        <h2 
          className={cn(
            "text-3xl sm:text-4xl font-semibold text-center text-accent-foreground mb-16 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          One search. Six dimensions of knowledge.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                "p-6 rounded-xl bg-card border border-border transition-all duration-700 hover:scale-[1.02]",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: isVisible ? `${index * 100}ms` : "0ms" }}
            >
              <div className="mb-4">
                <feature.icon className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {feature.description}
              </p>
              <p className="text-xs text-muted-foreground/60 font-light">
                {feature.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
