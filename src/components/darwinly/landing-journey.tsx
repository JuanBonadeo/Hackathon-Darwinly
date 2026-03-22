"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

type JourneySection = {
  id: string
  label: string
  shortLabel: string
}

const sections: JourneySection[] = [
  { id: "hero", label: "Discover", shortLabel: "Start" },
  { id: "how-it-works", label: "How it Works", shortLabel: "Flow" },
  { id: "features", label: "Knowledge Lenses", shortLabel: "Lenses" },
  { id: "use-cases", label: "Use Cases", shortLabel: "Who" },
  { id: "pricing", label: "Pricing", shortLabel: "Plans" }
]

export function LandingJourney() {
  const [activeSection, setActiveSection] = useState(sections[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id)
        }
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.15, 0.35, 0.55, 0.75]
      }
    )

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const activeIndex = useMemo(
    () => sections.findIndex((section) => section.id === activeSection),
    [activeSection]
  )

  const progress = Math.max(0, ((activeIndex + 1) / sections.length) * 100)

  const scrollTo = (id: string) => {
    const target = document.getElementById(id)
    if (!target) return

    target.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const nextSection =
    activeIndex >= 0 && activeIndex < sections.length - 1
      ? sections[activeIndex + 1]
      : sections[0]

  return (
    <>
      <div className="pointer-events-none fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
        <div className="pointer-events-auto rounded-full border border-border/70 bg-background/75 px-3 py-4 backdrop-blur">
          <div className="relative flex flex-col items-center gap-3">
            <div className="absolute left-1/2 top-2 h-[calc(100%-1rem)] w-px -translate-x-1/2 bg-border/70" />
            <div
              className="absolute left-1/2 top-2 w-px -translate-x-1/2 bg-foreground/75 transition-[height] duration-500"
              style={{ height: `calc((100% - 1rem) * ${progress / 100})` }}
            />

            {sections.map((section, index) => {
              const isActive = section.id === activeSection

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollTo(section.id)}
                  className={cn(
                    "group relative z-10 h-3.5 w-3.5 rounded-full border transition-all duration-300",
                    isActive
                      ? "scale-125 border-foreground bg-foreground"
                      : "border-border bg-background hover:scale-110 hover:border-foreground/60"
                  )}
                  aria-label={`Go to ${section.label}`}
                >
                  <span className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-border/70 bg-background/95 px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm group-hover:block">
                    {index + 1}. {section.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-30 px-4 hidden">
        <div className="mx-auto flex w-full max-w-xs items-center justify-between rounded-full border border-border/80 bg-background/80 px-4 py-2.5 shadow-[0_8px_30px_-22px_rgba(0,0,0,0.55)] backdrop-blur">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">Journey</p>
            <p className="truncate text-sm font-medium text-foreground">
              {sections[activeIndex]?.shortLabel ?? sections[0].shortLabel}
              <span className="ml-2 text-xs text-muted-foreground">
                {Math.max(activeIndex + 1, 1)}/{sections.length}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => scrollTo(nextSection.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
            aria-label={`Go to ${nextSection.label}`}
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )
}
