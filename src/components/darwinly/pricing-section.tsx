"use client"

import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "10 searches/day",
      "All 9 data sources",
      "AI narrative",
      "Search history"
    ],
    cta: "Get Started",
    popular: true
  },
  {
    name: "Pro",
    price: "$9",
    period: "month",
    features: [
      "Unlimited searches",
      "Compare two concepts",
      "Export data",
      "Priority API",
      "Early access to new sources"
    ],
    cta: "Coming Soon",
    popular: false
  }
]

export function PricingSection() {
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
    <section ref={sectionRef} id="pricing" className="px-6 py-28">
      <div className="section-shell overflow-visible! max-w-5xl mx-auto px-6 py-12 sm:px-10 sm:py-14">
        <div className="mb-14">
          <span className="section-kicker">Plans</span>

          <h2
            className={cn(
              "mt-5 max-w-2xl text-3xl sm:text-4xl font-semibold text-foreground transition-all duration-1200 ease-out",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Simple, transparent pricing
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                "feature-card relative flex flex-col p-8 pt-12 transition-all duration-1100 ease-out",
                plan.popular
                  ? "border-foreground/30 ring-1 ring-foreground/10"
                  : "border-border",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: isVisible ? `${index * 160}ms` : "0ms" }}
            >
              <div className="absolute left-1/2 top-3 -translate-x-1/2 h-6">
                {plan.popular && (
                  <span className="bg-foreground text-background text-xs font-medium px-3 py-1 rounded-full">
                    Most popular
                  </span>
                )}
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    / {plan.period}
                  </span>
                </div>
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 shrink-0 text-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                className="w-full border-border hover:bg-secondary"
                disabled={plan.name === "Pro"}
                onClick={plan.name !== "Pro" ? () => window.scrollTo({ top: 0, behavior: "smooth" }) : undefined}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
