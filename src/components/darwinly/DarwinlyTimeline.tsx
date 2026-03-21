'use client'

import { useEffect, useMemo, useState } from 'react'
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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { explainPeak } from '@/app/actions/explain-peak'

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
  selectedYear?: number | null
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

const sourceKeys: SourceKey[] = ['wikipedia', 'books', 'papers', 'movies', 'news']

function formatAxisValue(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

export function DarwinlyTimeline({ data, selectedYear = null }: DarwinlyTimelineProps) {
  const [explanations, setExplanations] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState<Record<number, boolean>>({})
  const [selected, setSelected] = useState<number | null>(null)

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
    if (counts.length === 0) {
      return new Set<number>()
    }

    const mean = counts.reduce((acc, value) => acc + value, 0) / counts.length
    const variance =
      counts.reduce((acc, value) => acc + (value - mean) ** 2, 0) / counts.length
    const stdDev = Math.sqrt(variance)
    const threshold = mean + 1.2 * stdDev

    return new Set<number>(
      wikipediaSeries.filter((item) => item.count > threshold).map((item) => item.year)
    )
  }, [wikipediaSeries])

  const peakYearsList = useMemo(
    () => Array.from(peakYears).sort((a, b) => a - b),
    [peakYears]
  )

  const getCountsByYear = (year: number): Record<string, number> => {
    return sourceKeys.reduce<Record<string, number>>((acc, source) => {
      const value =
        data.sources[source]?.find((item) => item.year === year)?.count ?? 0
      acc[source] = value
      return acc
    }, {})
  }

  const selectPeakYear = async (year: number) => {
    setSelected(year)

    if (explanations[year] !== undefined || loading[year]) {
      return
    }

    setLoading((prev) => ({ ...prev, [year]: true }))
    const response = await explainPeak(data.query, year, getCountsByYear(year))
    setExplanations((prev) => ({ ...prev, [year]: response }))
    setLoading((prev) => ({ ...prev, [year]: false }))
  }

  useEffect(() => {
    if (selectedYear === null || Number.isNaN(selectedYear)) {
      return
    }

    void selectPeakYear(selectedYear)
  }, [selectedYear])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl">
          Timeline Signals for "{data.query}"
        </CardTitle>
        <CardDescription className="text-base sm:text-lg leading-relaxed">
          Blue line: yearly activity. Yellow points: key peak years. Click a point
          or a year badge to see a short explanation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <LineChart data={chartData} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
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
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => `Year ${label}`}
                  formatter={(value) => formatAxisValue(Number(value))}
                />
              }
            />

            {selected !== null && (
              <ReferenceLine
                x={selected}
                stroke="#ffd166"
                strokeDasharray="4 4"
                ifOverflow="extendDomain"
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
                    className="cursor-pointer"
                    onClick={() => {
                      void selectPeakYear(year)
                    }}
                  />
                )
              }}
            />
          </LineChart>
        </ChartContainer>

        <div className="border-t pt-4 space-y-3">
          <div className="font-medium text-sm text-muted-foreground">Year details</div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The dashed line marks the selected year. We then generate a brief
            explanation based on that year&apos;s source activity.
          </p>

          {selected === null ? (
            <p className="text-base text-(--color-text-secondary)">
              Select a highlighted year to view the explanation.
            </p>
          ) : loading[selected] ? (
            <div className="space-y-2">
              <div className="font-medium text-base">Selected year: {selected}</div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-10/12" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="font-medium text-base">Selected year: {selected}</div>
              <p className="text-base text-(--color-text-secondary) leading-relaxed">
                {explanations[selected] || 'Explanation not available for this year yet.'}
              </p>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Highlighted years (computed using only Wikipedia):
        </div>
        <div className="flex flex-wrap gap-2">
          {peakYearsList.map((year) => (
            <Badge
              key={year}
              variant={selected === year ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => {
                void selectPeakYear(year)
              }}
            >
              {year}
            </Badge>
          ))}
          {peakYearsList.length === 0 && (
            <span className="text-sm text-muted-foreground">
              No peaks were detected with the current threshold.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
