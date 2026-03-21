'use client'

import { ChartData } from '@/types/api'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SearchChartsProps {
  data: ChartData[]
  query: string
}

const chartConfig = {
  wikipedia: {
    label: 'Wikipedia',
    color: '#3b82f6',
  },
  books: {
    label: 'Books',
    color: '#ef4444',
  },
  papers: {
    label: 'Papers',
    color: '#10b981',
  },
  movies: {
    label: 'Movies',
    color: '#f59e0b',
  },
  news: {
    label: 'News',
    color: '#8b5cf6',
  },
}

export function SearchCharts({ data, query }: SearchChartsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available for the search query.
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full">
      {/* Line Chart */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Search Results Over Time (Line Chart)</CardTitle>
          <CardDescription>Showing results for: {query}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-96 w-full">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="wikipedia"
                stroke="var(--color-wikipedia)"
                name="Wikipedia"
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="books"
                stroke="var(--color-books)"
                name="Books"
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="papers"
                stroke="var(--color-papers)"
                name="Papers"
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="movies"
                stroke="var(--color-movies)"
                name="Movies"
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="news"
                stroke="var(--color-news)"
                name="News"
                isAnimationActive={true}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Search Results Comparison (Bar Chart)</CardTitle>
          <CardDescription>Year-by-year comparison across all sources</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-96 w-full">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="wikipedia" fill="var(--color-wikipedia)" name="Wikipedia" />
              <Bar dataKey="books" fill="var(--color-books)" name="Books" />
              <Bar dataKey="papers" fill="var(--color-papers)" name="Papers" />
              <Bar dataKey="movies" fill="var(--color-movies)" name="Movies" />
              <Bar dataKey="news" fill="var(--color-news)" name="News" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Source Summary */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Source Breakdown</CardTitle>
          <CardDescription>Statistics by source type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(chartConfig).map(([key, config]) => {
              const sourceData = data
                .filter((d) => d[key as keyof ChartData] !== undefined)
                .map((d) => d[key as keyof ChartData] as number)
              const total = sourceData.reduce((acc, val) => acc + val, 0)

              return (
                <div
                  key={key}
                  className="p-4 rounded-lg border"
                  style={{
                    borderColor: config.color,
                    background: `${config.color}10`,
                  }}
                >
                  <div className="text-sm font-medium text-muted-foreground">
                    {config.label}
                  </div>
                  <div className="text-2xl font-bold mt-2" style={{ color: config.color }}>
                    {total.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {sourceData.length} years
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
