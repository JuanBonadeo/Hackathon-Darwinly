'use client'

import { useEffect } from 'react'
import { useSearchData } from '@/hooks/use-search-data'
import { Darwinly3DChartWrapper } from './darwinly-3d-chart-wrapper'
import { DarwinlyTimeline } from './DarwinlyTimeline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SearchResultsProps {
  query: string
  onBack: () => void
}

const SOURCE_BREAKDOWN_CONFIG = {
  wikipedia: {
    label: 'Wikipedia',
    color: '#00A3FF',
  },
  books: {
    label: 'Books',
    color: '#00C46A',
  },
  papers: {
    label: 'Papers',
    color: '#7A42FF',
  },
  movies: {
    label: 'Movies',
    color: '#FFB300',
  },
  news: {
    label: 'News',
    color: '#FF3B30',
  },
}

export function SearchResults({ query, onBack }: SearchResultsProps) {
  const { data, chartData, loading, error, fetchSearchData } = useSearchData()

  // Auto-fetch when query prop changes
  useEffect(() => {
    if (query) {
      fetchSearchData(query)
    }
  }, [query, fetchSearchData])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-20 pb-8 space-y-6">
      {/* Back Button and Title */}
      <div className="relative z-10 flex items-center gap-4 mb-8">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          className="h-11 min-w-[168px] px-5 gap-2 shrink-0 rounded-full bg-card/60 hover:bg-card cursor-pointer"
          aria-label="Back to Home"
          title="Back to Home"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">{query}</h1>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Charts */}
      {data && !loading && (
        <>
          <DarwinlyTimeline data={data} />

          <Darwinly3DChartWrapper 
            data={data}
            barSize={8}
            autoRotate={true}
            rotateSpeed={4}
            zScaleMode="source_relative"
          />

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">Source Breakdown</CardTitle>
              <CardDescription className="text-base sm:text-lg leading-relaxed">
                Totals by source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(SOURCE_BREAKDOWN_CONFIG).map(([key, config]) => {
                  const sourceData = chartData
                    .filter((d) => d[key as keyof typeof d] !== undefined)
                    .map((d) => d[key as keyof typeof d] as number)
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
        </>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex justify-center items-center h-96">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Searching for "{query}"...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
