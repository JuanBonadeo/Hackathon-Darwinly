'use client'

import { useEffect } from 'react'
import { useSearchData } from '@/hooks/use-search-data'
import { Darwinly3DChartWrapper } from './darwinly-3d-chart-wrapper'
import { DarwinlyTimeline } from './DarwinlyTimeline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, ArrowLeft, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ArtifactItem } from '@/types/api'

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
  const {
    data,
    deepDive,
    artifacts,
    chartData,
    loading,
    insightsLoading,
    artifactsLoading,
    error,
    insightsError,
    artifactsError,
    fetchSearchData,
  } = useSearchData()

  const renderArtifactList = (title: string, items: ArtifactItem[]) => (
    <div className="space-y-2">
      <h4 className="font-semibold text-base">{title}</h4>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No data available.</p>
      )}
      {items.map((item) => (
        <div key={`${title}-${item.title}-${item.year}`} className="rounded-md border p-3">
          <p className="font-medium leading-snug">{item.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {item.author ? `${item.author} · ` : ''}
            {item.year} · score {Math.round(item.score).toLocaleString()}
          </p>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
            >
              Open source
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      ))}
    </div>
  )

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
          className="h-11 min-w-42 px-5 gap-2 shrink-0 rounded-full bg-card/60 hover:bg-card cursor-pointer"
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
            zScaleMode="source_log_relative"
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

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">Deep Dive</CardTitle>
              <CardDescription className="text-base sm:text-lg leading-relaxed">
                Narrative summary generated from cross-source trends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {insightsLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading deep-dive insights...
                </div>
              )}

              {!insightsLoading && insightsError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{insightsError}</AlertDescription>
                </Alert>
              )}

              {!insightsLoading && deepDive && (
                <div className="space-y-3">
                  <p className="text-lg font-semibold">{deepDive.report.hook}</p>
                  <p className="text-sm text-muted-foreground">{deepDive.report.oneLiner}</p>
                  <p className="text-sm leading-relaxed">{deepDive.report.genesis}</p>
                  <p className="text-sm leading-relaxed">{deepDive.report.trajectory}</p>
                  <p className="text-sm leading-relaxed">{deepDive.report.currentState}</p>
                  <p className="text-sm leading-relaxed italic">{deepDive.report.didYouKnow}</p>
                  <div className="text-xs text-muted-foreground">
                    Inflection point:{' '}
                    {deepDive.report.inflectionPoint.year ?? 'N/A'} -{' '}
                    {deepDive.report.inflectionPoint.explanation}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">Key Artifacts</CardTitle>
              <CardDescription className="text-base sm:text-lg leading-relaxed">
                Representative books, papers, and movies for this topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              {artifactsLoading && (
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading artifacts...
                </div>
              )}

              {!artifactsLoading && artifactsError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{artifactsError}</AlertDescription>
                </Alert>
              )}

              {!artifactsLoading && artifacts && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {renderArtifactList('Books', artifacts.books)}
                  {renderArtifactList('Papers', artifacts.papers)}
                  {renderArtifactList('Movies', artifacts.movies)}
                </div>
              )}
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
              <p className="text-muted-foreground">Searching for {query}...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
