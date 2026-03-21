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
    <section ref={sectionRef} id="how-it-works" className="px-6 py-20 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <span className="section-kicker">Process</span>

            <h2
              className={cn(
                "mt-5 text-3xl sm:text-4xl font-semibold text-foreground transition-all duration-1200 ease-out",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              From curiosity to insight in seconds
            </h2>
          </div>

          <p
            className={cn(
              "max-w-md text-sm leading-relaxed text-muted-foreground lg:justify-self-end",
              "transition-all duration-1250 ease-out",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            A compact flow that keeps context while moving fast from search to interpretation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={cn(
                "p-6 transition-all duration-1100 ease-out rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 hover:-translate-y-1",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: isVisible ? `${index * 140}ms` : "0ms" }}
            >
              <div className="mb-4">
                <step.icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
