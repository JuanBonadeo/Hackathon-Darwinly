'use client'

import { useState, useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Button } from '@/components/ui/button'

// Types
type ScaleMode = 'linear' | 'log' | 'normalized'
type SourceKey = 'wikipedia' | 'books' | 'papers' | 'movies' | 'news'

interface YearEntry {
  year: number
  count: number
}

interface DarwinlyData {
  query: string
  sources: Record<SourceKey, YearEntry[]>
}

interface ChartDataPoint {
  year: string
  [key: string]: number | string | undefined
}

interface DarwinlyLineChartProps {
  data: DarwinlyData
}

// Chart configuration with fixed Darwinly colors
const chartConfig = {
  wikipedia: { label: 'Wikipedia', color: '#38bdf8' },
  books: { label: 'Books', color: '#6de3b0' },
  papers: { label: 'Papers', color: '#a78bfa' },
  movies: { label: 'Movies', color: '#ffd166' },
  news: { label: 'News', color: '#ff6b6b' },
} satisfies ChartConfig

const SOURCE_KEYS: SourceKey[] = ['wikipedia', 'books', 'papers', 'movies', 'news']

/**
 * Format large numbers for axis labels (1.2M, 500K, etc.)
 */
function formatAxisValue(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + 'K'
  }
  return value.toFixed(0)
}

/**
 * Get all unique years from data sources, sorted ascending
 */
function extractYears(sources: Record<SourceKey, YearEntry[]>): number[] {
  const yearsSet = new Set<number>()

  Object.values(sources).forEach((entries) => {
    entries.forEach((entry) => {
      yearsSet.add(entry.year)
    })
  })

  return Array.from(yearsSet).sort((a, b) => a - b)
}

/**
 * Transform raw data to Recharts format
 */
function transformData(
  sources: Record<SourceKey, YearEntry[]>,
  scaleMode: ScaleMode
): ChartDataPoint[] {
  const years = extractYears(sources)

  // Create a map for quick lookup
  const sourceMap: Record<SourceKey, Map<number, number>> = {} as any
  const maxValues: Record<SourceKey, number> = {} as any

  // Build source maps and calculate max values
  SOURCE_KEYS.forEach((source) => {
    sourceMap[source] = new Map(sources[source].map((e) => [e.year, e.count]))
    const validCounts = sources[source].map((e) => e.count).filter((c) => c > 0)
    maxValues[source] = Math.max(...validCounts, 1)
  })

  // Transform data based on scale mode
  const chartData = years.map((year) => {
    const point: ChartDataPoint = { year: year.toString() }

    SOURCE_KEYS.forEach((source) => {
      const count = sourceMap[source].get(year)

      if (count === undefined) {
        point[source] = undefined
        return
      }

      if (scaleMode === 'linear') {
        point[source] = count
      } else if (scaleMode === 'log') {
        point[source] = count === 0 ? undefined : parseFloat(Math.log10(count).toFixed(2))
      } else if (scaleMode === 'normalized') {
        point[source] = parseFloat(((count / maxValues[source]) * 100).toFixed(1))
      }
    })

    return point
  })

  return chartData
}

/**
 * Calculate growth ratio (last value / first value)
 */
function calculateGrowth(
  entries: YearEntry[]
): { sourceKey: SourceKey; growth: number; startYear: number; endYear: number } | null {
  if (!entries || entries.length === 0) return null

  const sorted = [...entries].sort((a, b) => a.year - b.year)
  const firstValue = sorted[0].count
  const lastValue = sorted[sorted.length - 1].count

  if (firstValue === 0) return null

  return {
    sourceKey: 'wikipedia', // This will be overwritten
    growth: lastValue / firstValue,
    startYear: sorted[0].year,
    endYear: sorted[sorted.length - 1].year,
  }
}

/**
 * Find source with highest growth
 */
function findHighestGrowthSource(
  sources: Record<SourceKey, YearEntry[]>
): { source: SourceKey; growth: number; startYear: number; endYear: number } | null {
  let highest: any = null

  SOURCE_KEYS.forEach((source) => {
    const growth = calculateGrowth(sources[source])
    if (growth && (!highest || growth.growth > highest.growth)) {
      highest = { source, ...growth }
    }
  })

  return highest
}

export function DarwinlyLineChart({ data }: DarwinlyLineChartProps) {
  const [scale, setScale] = useState<ScaleMode>('linear')

  // Transform data based on scale
  const chartData = useMemo(() => transformData(data.sources, scale), [data.sources, scale])

  // Calculate growth statistics
  const highestGrowth = useMemo(
    () => findHighestGrowthSource(data.sources),
    [data.sources]
  )

  // Get formatter based on scale
  const yFormatter = (value: number | string) => {
    if (typeof value === 'string') return value
    if (scale === 'linear') return formatAxisValue(value)
    if (scale === 'log') return value.toFixed(1)
    return `${value}%`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{data.query}</CardTitle>
        <CardDescription>Evolución por fuente</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Scale selector */}
        <div className="flex gap-2">
          {(['linear', 'log', 'normalized'] as const).map((mode) => (
            <Button
              key={mode}
              variant={scale === mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScale(mode)}
              className="capitalize"
            >
              {mode === 'log' ? 'Logarítmica' : mode === 'normalized' ? 'Normalizada %' : 'Lineal'}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData} margin={{ left: 16, right: 16, top: 10, bottom: 10 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={yFormatter}
              width={52}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value: any) => {
                    if (typeof value !== 'number') return value
                    if (scale === 'linear') return formatAxisValue(value)
                    if (scale === 'log') return value.toFixed(2)
                    return `${value}%`
                  }}
                />
              }
              cursor={true}
            />
            <ChartLegend content={<ChartLegendContent />} />

            {/* Render lines for each source */}
            {SOURCE_KEYS.map((source) => (
              <Line
                key={source}
                dataKey={source}
                type="monotone"
                stroke={chartConfig[source].color}
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={true}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>

      {/* Footer with growth statistics */}
      {highestGrowth && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex w-full items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" style={{ color: chartConfig[highestGrowth.source].color }} />
            <span>
              <strong>{chartConfig[highestGrowth.source].label}</strong> creció{' '}
              <strong>{highestGrowth.growth.toFixed(1)}x</strong> entre{' '}
              {highestGrowth.startYear} y {highestGrowth.endYear}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
