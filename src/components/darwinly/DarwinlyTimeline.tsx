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
import type { TimelineAnnotation } from '@/types/darwinly'

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
  annotations?: TimelineAnnotation[]
}

interface TimelineChartPoint {
  year: number
  wikipedia: number
}

const ANNOTATION_COLORS: Record<TimelineAnnotation['type'], string> = {
  inflection: '#1D4ED8',
  peak: '#3B82F6',
  milestone: '#60A5FA',
}

const ANNOTATION_LABELS: Record<TimelineAnnotation['type'], string> = {
  inflection: 'Inflection',
  peak: 'Peak',
  milestone: 'Milestone',
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

export function DarwinlyTimeline({ data, annotations = [] }: DarwinlyTimelineProps) {
  const wikipediaSeries = useMemo(
    () => [...(data.sources.wikipedia ?? [])].sort((a, b) => a.year - b.year),
    [data.sources.wikipedia]
  )

  const chartData = useMemo<TimelineChartPoint[]>(
    () => wikipediaSeries.map((item) => ({ year: item.year, wikipedia: item.count })),
    [wikipediaSeries]
  )

  const annotationMap = useMemo(() => {
    const map = new Map<number, TimelineAnnotation>()
    for (const a of annotations) {
      if (!map.has(a.year)) map.set(a.year, a)
    }
    return map
  }, [annotations])

  const hasAnnotations = annotations.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl">Timeline</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Wikipedia pageviews per year — public interest over time
          {hasAnnotations && ". Hover on marked years to see what happened"}
        </p>
      </CardHeader>
      <CardContent className="px-0 pt-4 pb-4">
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <LineChart data={chartData} margin={{ left: 0, right: 12, top: 24, bottom: 8 }}>
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
                const annotation = annotationMap.get(Number(label))

                return (
                  <div className="bg-popover border rounded-lg shadow-lg p-3 max-w-xs">
                    <p className="font-semibold text-sm mb-2">Year: {label}</p>


                    {annotation && (
                      <div className="mt-3 pt-2 border-t">
                        <p
                          className="text-xs font-semibold mb-1"
                          style={{ color: ANNOTATION_COLORS[annotation.type] }}
                        >
                          {ANNOTATION_LABELS[annotation.type]}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {annotation.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )
              }}
            />

            {annotations.filter(a => Number.isFinite(a.year)).slice(0, 3).map((annotation, i) => (
              <ReferenceLine
                key={`${annotation.year}-${i}`}
                x={annotation.year}
                stroke={ANNOTATION_COLORS[annotation.type]}
                strokeDasharray="5 3"
                strokeWidth={2}
                ifOverflow="extendDomain"
              />
            ))}

            <Line
              type="monotone"
              dataKey="wikipedia"
              stroke="#38bdf8"
              strokeWidth={2.5}
              connectNulls
              dot={(props) => {
                const { key, ...dotProps } = props
                const year = Number(props.payload?.year)
                const annotation = annotationMap.get(year)

                if (annotation) {
                  const color = ANNOTATION_COLORS[annotation.type]
                  return (
                    <Dot
                      key={String(key)}
                      {...dotProps}
                      r={6}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  )
                }

                return (
                  <Dot
                    key={String(key)}
                    {...dotProps}
                    r={2}
                    fill="transparent"
                    stroke="transparent"
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
