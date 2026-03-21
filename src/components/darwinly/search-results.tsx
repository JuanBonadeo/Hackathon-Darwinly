'use client'

import { useEffect } from 'react'
import { useSearchData } from '@/hooks/use-search-data'
import { useSimulatedStreaming } from '@/hooks/use-simulated-streaming'
import { Darwinly3DChartWrapper } from './darwinly-3d-chart-wrapper'
import { DarwinlyTimeline } from './DarwinlyTimeline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SearchResultsProps {
  query: string
  onBack: () => void
}

const SOURCE_BREAKDOWN_CONFIG = {
  wikipedia: { label: 'Wikipedia', color: '#0F172A' },
  books:     { label: 'Books',     color: '#1E3A8A' },
  papers:    { label: 'Papers',    color: '#1D4ED8' },
  movies:    { label: 'Movies',    color: '#3B82F6' },
  news:      { label: 'News',      color: '#60A5FA' },
}

const ARTIFACT_BADGE: Record<string, string> = {
  openlibrary:      '📚 Book',
  semanticscholar:  '📄 Paper',
  tmdb:             '🎬 Movie',
}

function formatTotal(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function SearchResults({ query, onBack }: SearchResultsProps) {
  const {
    data,
    deepDive,
    artifacts,
    chartData,
    loading,
    error,
    fetchSearchData,
  } = useSearchData()

  const report = deepDive?.report
  const streamEnabled = !!report

  const streamedHook         = useSimulatedStreaming(report?.hook,         streamEnabled, 20).displayedText
  const streamedDidYouKnow   = useSimulatedStreaming(report?.didYouKnow,   streamEnabled, 12).displayedText
  const streamedGenesis      = useSimulatedStreaming(report?.genesis,      streamEnabled, 15).displayedText
  const streamedTrajectory   = useSimulatedStreaming(report?.trajectory,   streamEnabled, 15).displayedText
  const streamedCurrentState = useSimulatedStreaming(report?.currentState, streamEnabled, 15).displayedText

  const getSourceTotal = (key: string) => {
    const values = chartData
      .filter((d) => d[key as keyof typeof d] !== undefined)
      .map((d) => d[key as keyof typeof d] as number)
    return values.reduce((acc, v) => acc + v, 0)
  }

  const mixedArtifacts = artifacts
    ? [...artifacts.books, ...artifacts.papers, ...artifacts.movies].slice(0, 3)
    : []

  useEffect(() => {
    if (query) {
      fetchSearchData(query)
    }
  }, [query, fetchSearchData])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-20 pb-8 space-y-6">

      {/* 1. Header */}
      <div className="relative z-10 flex items-center gap-4 mb-8">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          className="h-11 min-w-42 px-5 gap-2 shrink-0 rounded-full bg-card/60 hover:bg-card cursor-pointer"
          aria-label="Back to Home"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">{query}</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading skeletons */}
      {loading && (
        <>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
          </Card>
          <div className="border-l-4 border-yellow-400 bg-yellow-400/10 rounded-r-lg p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-10/12 mt-2" />
          </div>
          <Card>
            <CardHeader><Skeleton className="h-6 w-24" /></CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-10/12" />
            </CardContent>
          </Card>
        </>
      )}

      {/* 2. Hook */}
      {deepDive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold">
              {streamedHook}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* 3. Did You Know */}
      {deepDive && (
        <div className="border-l-4 border-yellow-400 bg-yellow-400/10 rounded-r-lg p-4 flex items-start gap-2">
          <span className="shrink-0 text-base">💡</span>
          <p className="text-sm leading-relaxed">{streamedDidYouKnow}</p>
        </div>
      )}

      {/* 4. Genesis */}
      {deepDive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">Origin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{streamedGenesis}</p>
          </CardContent>
        </Card>
      )}

      {data && !loading && (
        <>
          {/* 5. Timeline */}
          <DarwinlyTimeline
            data={data}
            inflectionYear={deepDive?.report.inflectionPoint.year ?? null}
            inflectionExplanation={deepDive?.report.inflectionPoint.explanation ?? null}
          />

          {/* 6. Trajectory */}
          {deepDive && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl">Evolution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{streamedTrajectory}</p>
              </CardContent>
            </Card>
          )}

          {/* 7. Evolution Map (3D) */}
          <Darwinly3DChartWrapper
            data={data}
            barSize={8}
            autoRotate={true}
            rotateSpeed={4}
            zScaleMode="source_relative"
          />

          {/* 8. Current State */}
          {deepDive && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl">Today</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{streamedCurrentState}</p>
              </CardContent>
            </Card>
          )}

          {/* 9. Source Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                {Object.entries(SOURCE_BREAKDOWN_CONFIG).map(([key, config], i, arr) => (
                  <span key={key} className="flex items-center gap-2">
                    <span className="font-bold text-sm" style={{ color: config.color }}>
                      {formatTotal(getSourceTotal(key))}
                    </span>
                    <span className="text-sm text-muted-foreground">{config.label}</span>
                    {i < arr.length - 1 && (
                      <span className="text-muted-foreground select-none">|</span>
                    )}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 10. Key Resources */}
          {mixedArtifacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl">Key Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mixedArtifacts.map((item, i) => (
                    <div
                      key={`${item.source}-${item.title}-${i}`}
                      className="rounded-lg border overflow-hidden flex flex-col"
                    >
                      {/* Image */}
                      <div className="h-40 bg-muted flex items-center justify-center overflow-hidden relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl">
                            {ARTIFACT_BADGE[item.source]?.split(' ')[0]}
                          </span>
                        )}
                        <span className="absolute top-2 right-2 text-xs bg-background/90 border rounded px-1.5 py-0.5">
                          {ARTIFACT_BADGE[item.source] ?? item.source}
                        </span>
                      </div>
                      {/* Info */}
                      <div className="p-3 flex flex-col gap-1 flex-1">
                        <p className="font-semibold text-sm leading-snug line-clamp-2">{item.title}</p>
                        {item.author && (
                          <p className="text-xs text-muted-foreground truncate">{item.author}</p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <span className="text-xs text-muted-foreground">{item.year}</span>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              View <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
