'use client'

import { useEffect } from 'react'
import { useSearchData } from '@/hooks/use-search-data'
import { Darwinly3DChartWrapper } from './darwinly-3d-chart-wrapper'
import { DarwinlyTimeline } from './DarwinlyTimeline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
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
    color: '#38BDF8',
  },
  books: {
    label: 'Books',
    color: '#60A5FA',
  },
  papers: {
    label: 'Papers',
    color: '#3B82F6',
  },
  movies: {
    label: 'Movies',
    color: '#6366F1',
  },
  news: {
    label: 'News',
    color: '#1D4ED8',
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

  const getSourceTotal = (key: string) => {
    const sourceData = chartData
      .filter((d) => d[key as keyof typeof d] !== undefined)
      .map((d) => d[key as keyof typeof d] as number)
    return {
      total: sourceData.reduce((acc, val) => acc + val, 0),
      years: sourceData.length,
    }
  }

  const renderArtifactList = (title: string, emoji: string, items: ArtifactItem[]) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-base">{emoji} {title}</h4>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No data available.</p>
      )}
      {items.map((item) => (
        <div
          key={`${title}-${item.title}-${item.year}`}
          className="flex gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
        >
          {/* Thumbnail */}
          <div className="shrink-0 w-14 h-20 rounded overflow-hidden bg-muted flex items-center justify-center">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">{emoji}</span>
            )}
          </div>
          {/* Info */}
          <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
            <div>
              <p className="font-medium text-sm leading-snug line-clamp-2">{item.title}</p>
              {item.author && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{item.author}</p>
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">{item.year}</span>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  useEffect(() => {
    if (query) {
      fetchSearchData(query)
    }
  }, [query, fetchSearchData])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-20 pb-8 space-y-6">
      {/* Header */}
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

      {/* Hero Narrative */}
      {insightsLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      )}
      {!insightsLoading && insightsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{insightsError}</AlertDescription>
        </Alert>
      )}
      {!insightsLoading && deepDive && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">{deepDive.report.hook}</CardTitle>
            <CardDescription className="text-base sm:text-lg leading-relaxed italic">
              {deepDive.report.oneLiner}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-l-4 border-yellow-400 pl-4 flex items-start gap-2">
              <span>💡</span>
              <p className="text-sm leading-relaxed">{deepDive.report.didYouKnow}</p>
            </div>
          </CardContent>
        </Card>
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

      {data && !loading && (
        <>
          {/* Timeline Signals */}
          <DarwinlyTimeline data={data} />

          {/* Deep Dive narrative — entre los dos gráficos */}
          {!insightsLoading && deepDive && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl">Deep Dive</CardTitle>
                <CardDescription className="text-base sm:text-lg leading-relaxed">
                  Narrative summary generated from cross-source trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{deepDive.report.genesis}</p>
                <p className="text-sm leading-relaxed">{deepDive.report.trajectory}</p>
                <p className="text-sm leading-relaxed">{deepDive.report.currentState}</p>
                <div className="text-xs text-muted-foreground border-t pt-3">
                  Inflection point:{' '}
                  {deepDive.report.inflectionPoint.year ?? 'N/A'} —{' '}
                  {deepDive.report.inflectionPoint.explanation}
                </div>
              </CardContent>
            </Card>
          )}
          {insightsLoading && (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-10/12" />
              </CardContent>
            </Card>
          )}

          {/* 3D Evolution Map */}
          <Darwinly3DChartWrapper
            data={data}
            barSize={8}
            autoRotate={true}
            rotateSpeed={4}
            zScaleMode="source_relative"
          />

          {/* Source Breakdown — Tabs */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">Source Breakdown</CardTitle>
              <CardDescription className="text-base sm:text-lg leading-relaxed">
                Totals by source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="wikipedia">
                <TabsList className="grid grid-cols-5 w-full">
                  {Object.entries(SOURCE_BREAKDOWN_CONFIG).map(([key, config]) => {
                    const { total } = getSourceTotal(key)
                    return (
                      <TabsTrigger key={key} value={key} className="text-xs">
                        {config.label} ({total.toLocaleString()})
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
                {Object.entries(SOURCE_BREAKDOWN_CONFIG).map(([key, config]) => {
                  const { total, years } = getSourceTotal(key)
                  return (
                    <TabsContent key={key} value={key}>
                      <div
                        className="p-6 rounded-lg border mt-2"
                        style={{
                          borderColor: config.color,
                          background: `${config.color}10`,
                        }}
                      >
                        <div className="text-3xl font-bold" style={{ color: config.color }}>
                          {total.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {config.label} · {years} years of data
                        </div>
                      </div>
                    </TabsContent>
                  )
                })}
              </Tabs>
            </CardContent>
          </Card>

          {/* Most Famous Resources */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">Most Famous Resources</CardTitle>
              <CardDescription className="text-base sm:text-lg leading-relaxed">
                Top books, papers and movies related to this topic
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderArtifactList('Books', '📚', artifacts.books)}
                  {renderArtifactList('Papers', '📄', artifacts.papers)}
                  {renderArtifactList('Movies', '🎬', artifacts.movies)}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
