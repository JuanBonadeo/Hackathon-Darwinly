'use client'

import { useEffect } from 'react'
import { useSearchData } from '@/hooks/use-search-data'
import { useSimulatedStreaming } from '@/hooks/use-simulated-streaming'
import { Darwinly3DChartWrapper } from './darwinly-3d-chart-wrapper'
import { DarwinlyTimeline } from './DarwinlyTimeline'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SearchResultsProps {
  query: string
  onBack: () => void
}

const SOURCE_CONFIG = {
  wikipedia: { label: 'Wikipedia', color: '#0F172A' },
  books:     { label: 'Books',     color: '#1E3A8A' },
  papers:    { label: 'Papers',    color: '#1D4ED8' },
  movies:    { label: 'Movies',    color: '#3B82F6' },
  news:      { label: 'News',      color: '#60A5FA' },
}

const ARTIFACT_CONFIG: Record<string, { label: string; accent: string; emoji: string }> = {
  openlibrary:     { label: 'Book',  accent: '#1E3A8A', emoji: '📚' },
  semanticscholar: { label: 'Paper', accent: '#1D4ED8', emoji: '📄' },
  tmdb:            { label: 'Movie', accent: '#3B82F6', emoji: '🎬' },
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

  const report        = deepDive?.report
  const shouldAnimate = !deepDive?.fromCache && !!report

  // Streaming hooks — only active when shouldAnimate = true (fresh search)
  const hookS       = useSimulatedStreaming(report?.hook,                        shouldAnimate,                       10, 130)
  const oneLinerS   = useSimulatedStreaming(report?.oneLiner,                    shouldAnimate && hookS.isDone,       12, 115)
  const dykS        = useSimulatedStreaming(report?.didYouKnow,                  shouldAnimate && oneLinerS.isDone,   11, 115)
  const genesisS    = useSimulatedStreaming(report?.genesis,                     shouldAnimate && dykS.isDone,        12, 110)
  const trajectoryS = useSimulatedStreaming(report?.trajectory,                  shouldAnimate && genesisS.isDone,    12, 110)
  const currentS    = useSimulatedStreaming(report?.currentState,                shouldAnimate && trajectoryS.isDone, 12, 110)

  const hasInflection = !!report && report.inflectionPoint.year !== null
  const inflectionS   = useSimulatedStreaming(
    report?.inflectionPoint.explanation,
    shouldAnimate && currentS.isDone && hasInflection,
    10, 115,
  )

  // Display text — streamed when animating, direct from report when cached
  const hookText       = shouldAnimate ? hookS.displayedText       : (report?.hook ?? '')
  const oneLinerText   = shouldAnimate ? oneLinerS.displayedText   : (report?.oneLiner ?? '')
  const dykText        = shouldAnimate ? dykS.displayedText        : (report?.didYouKnow ?? '')
  const genesisText    = shouldAnimate ? genesisS.displayedText    : (report?.genesis ?? '')
  const trajectoryText = shouldAnimate ? trajectoryS.displayedText : (report?.trajectory ?? '')
  const currentText    = shouldAnimate ? currentS.displayedText    : (report?.currentState ?? '')
  const inflectionText = shouldAnimate ? inflectionS.displayedText : (report?.inflectionPoint.explanation ?? '')

  // Visibility gates — sequential when animating, all true immediately when cached
  const showOneLiner    = !shouldAnimate || hookS.isDone
  const showDyk         = !shouldAnimate || oneLinerS.isDone
  const showGenesis     = !shouldAnimate || dykS.isDone
  const showTimeline    = !shouldAnimate || genesisS.isDone
  const showTrajectory  = !shouldAnimate || showTimeline
  const showEvolution   = !shouldAnimate || trajectoryS.isDone
  const showCurrentState = !shouldAnimate || showEvolution
  const showInflection  = !shouldAnimate || (hasInflection && currentS.isDone)
  const showFooter      = !shouldAnimate || (hasInflection ? inflectionS.isDone : currentS.isDone)

  // Staggered delay for cached results (elements mount simultaneously)
  const d = (n: number) =>
    shouldAnimate ? {} : { animationDelay: `${n * 80}ms` }

  const getSourceTotal = (key: string) =>
    chartData
      .filter((d) => d[key as keyof typeof d] !== undefined)
      .map((d) => d[key as keyof typeof d] as number)
      .reduce((acc, v) => acc + v, 0)

  const mixedArtifacts = artifacts ?? []

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

      {/* Article card */}
      {deepDive && data && (
        <Card>
          <CardContent className="pt-6 pb-8 space-y-6">

            {/* Hook — always visible first */}
            <h2 className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-3xl sm:text-4xl font-bold leading-tight min-h-10">
              {hookText}
            </h2>

            {/* OneLiner */}
            {showOneLiner && (
              <p className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-lg sm:text-xl text-muted-foreground italic leading-relaxed min-h-7" style={d(1)}>
                {oneLinerText}
              </p>
            )}

            {/* Did You Know callout */}
            {showDyk && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-600 border-l-4 border-yellow-400 bg-yellow-400/10 pl-4 py-3" style={d(2)}>
                <p className="text-sm flex items-start gap-2">
                  <span className="text-base shrink-0">💡</span>
                  <span className="leading-relaxed">{dykText}</span>
                </p>
              </div>
            )}

            {/* Genesis */}
            {showGenesis && (
              <p className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-base leading-relaxed" style={d(3)}>
                {genesisText}
              </p>
            )}

            {/* Timeline — appears after genesis finishes */}
            {showTimeline && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 my-8" style={d(4)}>
                <DarwinlyTimeline
                  data={data}
                  inflectionYear={deepDive.report.inflectionPoint.year}
                  inflectionExplanation={deepDive.report.inflectionPoint.explanation}
                />
              </div>
            )}

            {/* Trajectory */}
            {showTrajectory && (
              <p className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-base leading-relaxed" style={d(5)}>
                {trajectoryText}
              </p>
            )}

            {/* Evolution Map — appears after trajectory finishes */}
            {showEvolution && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 my-8" style={d(6)}>
                <Darwinly3DChartWrapper
                  data={data}
                  barSize={8}
                  autoRotate={true}
                  rotateSpeed={4}
                  zScaleMode="source_relative"
                />
              </div>
            )}

            {/* Current State */}
            {showCurrentState && (
              <p className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-base leading-relaxed" style={d(7)}>
                {currentText}
              </p>
            )}

            {/* Inflection footnote */}
            {showInflection && hasInflection && (
              <div className="animate-in fade-in duration-500 border-t border-border pt-4 mt-6" style={d(8)}>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Inflection point:</span>{' '}
                  {deepDive.report.inflectionPoint.year} —{' '}
                  {inflectionText}
                </p>
              </div>
            )}

            {/* Data sources — appears after all text is done */}
            {showFooter && (
              <div className="animate-in fade-in duration-500 border-t border-border pt-5 mt-2" style={d(9)}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Data sources
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => (
                    <span key={key} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                      <span className="text-xs text-muted-foreground">
                        <span className="font-semibold" style={{ color: cfg.color }}>
                          {formatTotal(getSourceTotal(key))}
                        </span>
                        {' '}{cfg.label}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      )}

      {/* Key Resources — appears after article is fully revealed */}
      {mixedArtifacts.length > 0 && !loading && showFooter && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4 px-1" style={d(10)}>
          <h2 className="text-xl font-bold">Key Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mixedArtifacts.map((item, i) => {
              const cfg = ARTIFACT_CONFIG[item.source]
              return item.imageUrl ? (
                <div
                  key={`${item.source}-${item.title}-${i}`}
                  className="group rounded-xl border overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                    <span className="absolute top-2 left-2 text-xs bg-black/60 text-white rounded-full px-2 py-0.5 font-medium">
                      {cfg?.emoji} {cfg?.label}
                    </span>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-semibold text-sm leading-snug line-clamp-2">{item.title}</p>
                      <p className="text-white/70 text-xs mt-0.5">{item.year}</p>
                    </div>
                  </div>
                  {item.url && (
                    <div className="px-3 py-2.5 border-t">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  key={`${item.source}-${item.title}-${i}`}
                  className="group rounded-xl border overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
                >
                  <div className="h-1" style={{ background: cfg?.accent ?? '#1D4ED8' }} />
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {cfg?.emoji} {cfg?.label}
                    </span>
                    <p className="font-semibold text-sm leading-snug line-clamp-3">{item.title}</p>
                    {item.author && (
                      <p className="text-xs text-muted-foreground truncate">{item.author}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3">
                      <span className="text-xs text-muted-foreground">{item.year}</span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
