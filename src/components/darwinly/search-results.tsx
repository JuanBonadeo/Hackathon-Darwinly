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
  openlibrary:     '📚 Book',
  semanticscholar: '📄 Paper',
  tmdb:            '🎬 Movie',
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

  const report      = deepDive?.report
  const enabled     = !!report

  const streamedHook                  = useSimulatedStreaming(report?.hook,                         enabled, 25).displayedText
  const streamedOneLiner              = useSimulatedStreaming(report?.oneLiner,                     enabled, 20).displayedText
  const streamedDidYouKnow            = useSimulatedStreaming(report?.didYouKnow,                   enabled, 15).displayedText
  const streamedGenesis               = useSimulatedStreaming(report?.genesis,                      enabled, 18).displayedText
  const streamedTrajectory            = useSimulatedStreaming(report?.trajectory,                   enabled, 18).displayedText
  const streamedCurrentState          = useSimulatedStreaming(report?.currentState,                 enabled, 18).displayedText
  const streamedInflectionExplanation = useSimulatedStreaming(report?.inflectionPoint.explanation,  enabled, 15).displayedText

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
    if (query) fetchSearchData(query)
  }, [query, fetchSearchData])

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-20 pb-16 space-y-8">

      {/* 1. Header */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          className="h-11 px-5 gap-2 shrink-0 rounded-full bg-card/60 hover:bg-card cursor-pointer"
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

      {/* 2. Article skeleton while loading */}
      {loading && (
        <Card>
          <CardContent className="pt-6 space-y-6 pb-8">
            <Skeleton className="h-12 w-4/5" />
            <Skeleton className="h-6 w-3/5" />
            <div className="border-l-4 border-yellow-400 bg-yellow-400/10 pl-4 py-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5 mt-2" />
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      )}

      {/* 2. Main article card */}
      {deepDive && data && (
        <Card>
          <CardContent className="pt-6 pb-8 space-y-6">

            {/* Hook — article title */}
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              {streamedHook}
            </h2>

            {/* OneLiner — subtitle / standfirst */}
            <p className="text-lg sm:text-xl text-muted-foreground italic leading-relaxed">
              {streamedOneLiner}
            </p>

            {/* Did You Know — callout */}
            <div className="border-l-4 border-yellow-400 bg-yellow-400/10 pl-4 py-3">
              <p className="text-sm flex items-start gap-2">
                <span className="text-base shrink-0">💡</span>
                <span className="leading-relaxed">{streamedDidYouKnow}</span>
              </p>
            </div>

            {/* Genesis — first body paragraph */}
            <p className="text-base leading-relaxed">
              {streamedGenesis}
            </p>

            {/* Timeline — embedded chart */}
            <div className="my-8">
              <h3 className="text-xl font-semibold mb-4">Timeline</h3>
              <DarwinlyTimeline
                data={data}
                inflectionYear={deepDive.report.inflectionPoint.year}
                inflectionExplanation={deepDive.report.inflectionPoint.explanation}
              />
            </div>

            {/* Trajectory — continues the narrative */}
            <p className="text-base leading-relaxed">
              {streamedTrajectory}
            </p>

            {/* Evolution Map — embedded 3D chart */}
            <div className="my-8">
              <h3 className="text-xl font-semibold mb-4">Evolution Map</h3>
              <Darwinly3DChartWrapper
                data={data}
                barSize={8}
                autoRotate={true}
                rotateSpeed={4}
                zScaleMode="source_relative"
              />
            </div>

            {/* Current State — article close */}
            <p className="text-base leading-relaxed">
              {streamedCurrentState}
            </p>

            {/* Inflection point — footnote */}
            {deepDive.report.inflectionPoint.year !== null && (
              <div className="border-t border-border pt-4 mt-6">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Inflection point:</span>{' '}
                  {deepDive.report.inflectionPoint.year} —{' '}
                  {streamedInflectionExplanation}
                </p>
              </div>
            )}

          </CardContent>
        </Card>
      )}

      {/* 3. Sources */}
      {data && !loading && (
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
      )}

      {/* 4. Key Resources */}
      {mixedArtifacts.length > 0 && !loading && (
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

    </div>
  )
}
