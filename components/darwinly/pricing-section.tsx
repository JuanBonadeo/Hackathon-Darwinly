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
      "All 6 data sources",
      "AI narrative",
      "Search history"
    ],
    cta: "Get Started",
    popular: false
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
    cta: "Upgrade to Pro",
    popular: true
  }
]

export function PricingSection() {
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
    <section ref={sectionRef} id="pricing" className="py-24 px-6 bg-secondary/30">
      <div className="max-w-4xl mx-auto">
        <h2 
          className={cn(
            "text-3xl sm:text-4xl font-semibold text-center text-accent-foreground mb-16 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          Simple, transparent pricing
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                "relative p-8 rounded-xl bg-card border transition-all duration-700 hover:scale-[1.02]",
                plan.popular 
                  ? "border-foreground/30 ring-1 ring-foreground/10" 
                  : "border-border",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: isVisible ? `${index * 100}ms` : "0ms" }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-foreground text-background text-xs font-medium px-3 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              )}

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

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-foreground flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                variant="outline" 
                className="w-full border-border hover:bg-secondary"
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
