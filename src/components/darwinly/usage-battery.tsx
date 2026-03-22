"use client"

import { useEffect, useState } from "react"
import { getUsageStatus } from "@/app/actions/usage"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface UsageState {
  used: number
  remaining: number
  limit: number
}

function BatteryIcon({ remaining, limit }: { remaining: number; limit: number }) {
  const segments = limit
  const filled = remaining

  const W = 36
  const H = 20
  const tipW = 4
  const tipH = 8
  const pad = 3
  const segGap = 1.5
  const totalGaps = segments - 1
  const availW = W - pad * 2 - totalGaps * segGap
  const segW = availW / segments

  return (
    <svg
      width={W + tipW}
      height={H}
      viewBox={`0 0 ${W + tipW} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Body outline */}
      <rect
        x={0.5} y={0.5}
        width={W - 1} height={H - 1}
        rx={3}
        stroke="currentColor"
        strokeWidth={1}
        className="text-foreground/40"
        fill="none"
      />
      {/* Tip */}
      <rect
        x={W} y={(H - tipH) / 2}
        width={tipW - 0.5} height={tipH}
        rx={1.5}
        fill="currentColor"
        className="text-foreground/30"
      />
      {/* Segments */}
      {Array.from({ length: segments }).map((_, i) => {
        const isFilled = i < filled
        const x = pad + i * (segW + segGap)
        const y = pad
        const segH = H - pad * 2
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={segW}
            height={segH}
            rx={0.75}
            fill="currentColor"
            className={isFilled ? "text-foreground/90" : "text-foreground/10"}
          />
        )
      })}
    </svg>
  )
}

function UsagePopoverContent({ usage }: { usage: UsageState }) {
  const { used, remaining, limit } = usage
  const pct = limit > 0 ? remaining / limit : 0

  return (
    <div className="w-52 space-y-3">
      <div>
        <p className="text-sm font-semibold text-foreground">Daily Usage</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {remaining === 0 ? "You've used all your requests for today" : `${remaining} request${remaining === 1 ? "" : "s"} remaining`}
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-foreground transition-all duration-500"
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{used} used</span>
          <span>{limit} / day</span>
        </div>
      </div>

      {remaining === 0 && (
        <p className="text-[10px] text-muted-foreground border-t border-border pt-2">
          Resets tomorrow at midnight
        </p>
      )}
    </div>
  )
}

interface UsageBatteryProps {
  collapsed?: boolean
}

export function UsageBattery({ collapsed = false }: UsageBatteryProps) {
  const [usage, setUsage] = useState<UsageState>({ used: 0, remaining: 10, limit: 10 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getUsageStatus().then((u) => {
      setUsage(u)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<UsageState>).detail
      if (detail) setUsage(detail)
      else getUsageStatus().then(setUsage)
    }
    window.addEventListener("darwinly:usage-update", handler)
    return () => window.removeEventListener("darwinly:usage-update", handler)
  }, [])

  if (!loaded) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {collapsed ? (
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-sidebar-accent cursor-default transition-colors hover:brightness-95">
            <BatteryIcon remaining={usage.remaining} limit={usage.limit} />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-default hover:bg-sidebar-accent transition-colors">
            <BatteryIcon remaining={usage.remaining} limit={usage.limit} />
            <span className="text-sm font-medium text-muted-foreground">Daily Usage</span>
          </div>
        )}
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={12}
        className="bg-popover text-popover-foreground border border-border shadow-lg rounded-xl px-4 py-3"
      >
        <UsagePopoverContent usage={usage} />
      </TooltipContent>
    </Tooltip>
  )
}
