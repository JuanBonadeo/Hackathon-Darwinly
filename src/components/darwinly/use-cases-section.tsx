"use client"

import { useEffect, useRef, useState } from "react"
import { GraduationCap, Newspaper, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

const useCases = [
  {
    icon: GraduationCap,
    persona: "Students & Researchers",
    description: "Discover when a field emerged, find seminal papers and books, understand the intellectual timeline of any topic."
  },
  {
    icon: Newspaper,
    persona: "Journalists & Writers",
    description: 'Find the origin story of any trend. When did "burnout" become a medical diagnosis? When did the press start covering AI?'
  },
  {
    icon: Lightbulb,
    persona: "Founders & Investors",
    description: "Spot cultural inflection points before they become markets. Understand when public attention shifts — and why."
  }
]

export function UseCasesSection() {
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
    <section ref={sectionRef} id="use-cases" className="py-24 px-6">
      <div className="section-shell-alt max-w-6xl mx-auto px-6 py-12 sm:px-10 sm:py-14">
        <div className="text-center">
          <span className="section-kicker">Who uses it</span>
        </div>

        <h2 
          className={cn(
            "mt-5 text-3xl sm:text-4xl font-semibold text-center text-foreground mb-14 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          Built for the curious
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={useCase.persona}
              className={cn(
                "feature-card p-8 transition-all duration-700",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: isVisible ? `${index * 100}ms` : "0ms" }}
            >
              <div className="mb-4">
                <useCase.icon className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {useCase.persona}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
