"use client"

import { useEffect, useRef, useState } from "react"
import { Search, Layers, LineChart, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    icon: Search,
    title: "Search",
    description: "Type any concept — a technology, a movement, a cultural phenomenon."
  },
  {
    icon: Layers,
    title: "Cross-reference",
    description: "6+ data sources queried simultaneously in under 15 seconds."
  },
  {
    icon: LineChart,
    title: "Visualize",
    description: "An interactive timeline with one curve per source, showing when each domain started paying attention."
  },
  {
    icon: Sparkles,
    title: "Understand",
    description: "AI reads across all sources and writes the narrative: spikes, absences, and hidden patterns."
  }
]

export function HowItWorksSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.02, rootMargin: "0px 0px -8% 0px" }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="how-it-works" className="px-6 py-20 sm:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <span className="section-kicker">Process</span>
            <h2
              className={cn(
                "mt-5 text-3xl sm:text-4xl font-semibold text-foreground transition-all duration-[1020ms] ease-in",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              From curiosity to insight in seconds
            </h2>
          </div>
          <p
            className={cn(
              "max-w-md text-sm leading-relaxed text-muted-foreground lg:justify-self-end",
              "transition-all duration-1063 ease-in",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            A compact flow that keeps context while moving fast from search to interpretation.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">

          {/* ── Desktop: horizontal line ── */}
          <div className="hidden lg:block absolute top-5.5 left-0 right-0 h-px bg-border/50" />
          <div
            className="hidden lg:block absolute top-5.5 left-0 h-px bg-foreground/50 transition-[width] duration-2176 ease-in"
            style={{ width: isVisible ? "100%" : "0%" }}
          />

          {/* ── Mobile: vertical line ── */}
          <div className="lg:hidden absolute left-5.5 top-0 bottom-0 w-px bg-border/50" />
          <div
            className="lg:hidden absolute left-5.5 top-0 w-px bg-foreground/50 transition-[height] duration-2176 ease-in"
            style={{ height: isVisible ? "100%" : "0%" }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-6">
            {steps.map((step, index) => {
              // Line is 1600ms linear across 4 equal columns.
              // Each dot center sits at (index + 0.5) / 4 of the total width.
              const lineDuration = 2176
              const dotDelay    = Math.round(lineDuration * (index + 0.5) / steps.length)
              const contentDelay = dotDelay + 110

              return (
                <div
                  key={step.title}
                  className="relative flex lg:flex-col items-start gap-5 lg:gap-0 pl-14 lg:pl-0"
                >
                  {/* Dot — pops in when the line reaches it */}
                  <div
                    className={cn(
                      "absolute left-0 lg:relative lg:left-auto lg:mb-6 lg:mx-auto",
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                      "border border-border bg-background",
                      "transition-[opacity,transform] duration-425 ease-[cubic-bezier(0.34,1.3,0.64,1)]",
                      isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
                    )}
                    style={{ transitionDelay: isVisible ? `${dotDelay}ms` : "0ms" }}
                  >
                    <step.icon className="h-4.5 w-4.5 text-foreground" />
                  </div>

                  {/* Content — fades in just after the dot */}
                  <div
                    className={cn(
                      "lg:text-center lg:px-1 pt-0.5 lg:pt-0",
                      "transition-[opacity,transform] duration-425 ease-in",
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    )}
                    style={{ transitionDelay: isVisible ? `${contentDelay}ms` : "0ms" }}
                  >
                    <p className="text-[11px] font-mono text-muted-foreground/50 mb-1 tracking-widest">
                      0{index + 1}
                    </p>
                    <h3 className="text-base font-semibold text-foreground mb-1.5 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
