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
    <section ref={sectionRef} id="how-it-works" className="py-24 px-6">
      <div className="section-shell-alt max-w-6xl mx-auto px-6 py-12 sm:px-10 sm:py-14">
        <div className="text-center">
          <span className="section-kicker">Process</span>
        </div>

        <h2 
          className={cn(
            "mt-5 text-3xl sm:text-4xl font-semibold text-center text-foreground mb-14 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          From curiosity to insight in seconds
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={cn(
                "feature-card p-6 transition-all duration-700",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: isVisible ? `${index * 100}ms` : "0ms" }}
            >
              <div className="mb-4">
                <step.icon className="h-6 w-6 text-foreground" />
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
