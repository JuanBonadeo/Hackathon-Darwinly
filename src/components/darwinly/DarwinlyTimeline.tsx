'use client'

import { useMemo } from 'react'
import {
  CartesianGrid,
  Dot,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart'

type SourceKey = 'wikipedia' | 'books' | 'papers' | 'movies' | 'news'

interface YearEntry {
  year: number
  count: number
}

interface TimelineData {
  query: string
  sources: Partial<Record<SourceKey, YearEntry[]>>
}

interface DarwinlyTimelineProps {
  data: TimelineData
  inflectionYear?: number | null
  inflectionExplanation?: string | null
}

interface TimelineChartPoint {
  year: number
  wikipedia: number
}

const chartConfig = {
  wikipedia: {
    label: 'Wikipedia',
    color: '#38bdf8',
  },
} satisfies ChartConfig

function formatAxisValue(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

export function DarwinlyTimeline({ data, inflectionYear = null, inflectionExplanation = null }: DarwinlyTimelineProps) {
  const wikipediaSeries = useMemo(
    () => [...(data.sources.wikipedia ?? [])].sort((a, b) => a.year - b.year),
    [data.sources.wikipedia]
  )

  const chartData = useMemo<TimelineChartPoint[]>(
    () => wikipediaSeries.map((item) => ({ year: item.year, wikipedia: item.count })),
    [wikipediaSeries]
  )

  const peakYears = useMemo(() => {
    const counts = wikipediaSeries.map((item) => item.count)
    if (counts.length === 0) return new Set<number>()

    const mean = counts.reduce((acc, v) => acc + v, 0) / counts.length
    const variance = counts.reduce((acc, v) => acc + (v - mean) ** 2, 0) / counts.length
    const threshold = mean + 1.2 * Math.sqrt(variance)

    return new Set<number>(
      wikipediaSeries.filter((item) => item.count > threshold).map((item) => item.year)
    )
  }, [wikipediaSeries])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl">Timeline</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <LineChart data={chartData} margin={{ left: 12, right: 12, top: 24, bottom: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => formatAxisValue(Number(value))}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const isInflection = Number(label) === inflectionYear

                return (
                  <div className="bg-popover border rounded-lg shadow-lg p-3 max-w-xs">
                    <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                      {isInflection && <span>📍</span>}
                      Year: {label}
                    </p>

                    {payload.map((entry) => (
                      <div key={entry.dataKey as string} className="text-xs flex justify-between gap-4 mb-1">
                        <span style={{ color: entry.color as string }}>{entry.name}:</span>
                        <span className="font-medium">{formatAxisValue(Number(entry.value))}</span>
                      </div>
                    ))}

                    {isInflection && inflectionExplanation && (
                      <div className="mt-3 pt-2 border-t">
                        <p className="text-xs text-yellow-400 font-semibold mb-1">Inflection Point</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {inflectionExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                )
              }}
            />

            {inflectionYear !== null && (
              <ReferenceLine
                x={inflectionYear}
                stroke="#fbbf24"
                strokeDasharray="5 3"
                strokeWidth={2}
                ifOverflow="extendDomain"
                label={{ value: '📍', position: 'top', fontSize: 20, fill: '#fbbf24' }}
              />
            )}

            <Line
              type="monotone"
              dataKey="wikipedia"
              stroke="#38bdf8"
              strokeWidth={2.5}
              connectNulls
              dot={(props) => {
                const { key, ...dotProps } = props
                const year = Number(props.payload?.year)
                if (!peakYears.has(year)) {
                  return (
                    <Dot
                      key={String(key)}
                      {...dotProps}
                      r={2}
                      fill="transparent"
                      stroke="transparent"
                    />
                  )
                }
                return (
                  <Dot
                    key={String(key)}
                    {...dotProps}
                    r={6}
                    fill="#ffd166"
                    stroke="#ffd166"
                  />
                )
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
