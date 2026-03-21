'use client'

import { useEffect, useState } from 'react'
import { useSearchData } from '@/hooks/use-search-data'
import { useSimulatedStreaming } from '@/hooks/use-simulated-streaming'
import { LoadingTransition } from './loading-transition'
import { Darwinly3DChartWrapper } from './darwinly-3d-chart-wrapper'
import { DarwinlyTimeline } from './DarwinlyTimeline'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GitHubActivity } from './GitHubActivity'
import { CryptoMetrics } from './CryptoMetrics'

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

const ARTIFACT_CONFIG: Record<string, { label: string; accent: string; hasLink: boolean }> = {
  openlibrary:     { label: 'Book',  accent: '#1E3A8A', hasLink: true  },
  semanticscholar: { label: 'Paper', accent: '#1D4ED8', hasLink: false },
  tmdb:            { label: 'Movie', accent: '#3B82F6', hasLink: false },
}

function formatTotal(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function SearchResults({ query, onBack }: SearchResultsProps) {
  const [transitionDone, setTransitionDone] = useState(false)

  const {
    data,
    deepDive,
    artifacts,
    chartData,
    loading,
    error,
    fromCache,
    userSearched,
    fetchSearchData,
  } = useSearchData()

  const report = deepDive?.report
  const shouldStream = transitionDone && !!report && !(fromCache && userSearched)
  const showContent = transitionDone && !!deepDive && !!data
  
  // Determine loading state for transition animation
  let loadingState: 'first-time-no-cache' | 'first-time-with-cache' | 'cached-for-user' = 'cached-for-user'
  if (!fromCache && !userSearched) {
    loadingState = 'first-time-no-cache'
  } else if (fromCache && !userSearched) {
    loadingState = 'first-time-with-cache'
  } else {
    loadingState = 'cached-for-user'
  }

  // Streaming hooks — only active when shouldAnimate = true (fresh search)
  const hookS       = useSimulatedStreaming(report?.hook,                        shouldStream,                       10, 130)
  const oneLinerS   = useSimulatedStreaming(report?.oneLiner,                    shouldStream && hookS.isDone,       12, 115)
  const dykS        = useSimulatedStreaming(report?.didYouKnow,                  shouldStream && oneLinerS.isDone,   11, 115)
  const genesisS    = useSimulatedStreaming(report?.genesis,                     shouldStream && dykS.isDone,        12, 110)
  const trajectoryS = useSimulatedStreaming(report?.trajectory,                  shouldStream && genesisS.isDone,    12, 110)
  const currentS    = useSimulatedStreaming(report?.currentState,                shouldStream && trajectoryS.isDone, 12, 110)

  // Display text — streamed when animating, direct from report when cached
  const hookText       = shouldStream ? hookS.displayedText       : (report?.hook ?? '')
  const oneLinerText   = shouldStream ? oneLinerS.displayedText   : (report?.oneLiner ?? '')
  const dykText        = shouldStream ? dykS.displayedText        : (report?.didYouKnow ?? '')
  const genesisText    = shouldStream ? genesisS.displayedText    : (report?.genesis ?? '')
  const trajectoryText = shouldStream ? trajectoryS.displayedText : (report?.trajectory ?? '')
  const currentText    = shouldStream ? currentS.displayedText    : (report?.currentState ?? '')
  // Visibility gates — sequential when animating, all true immediately when cached
  const showOneLiner    = !shouldStream || hookS.isDone
  const showDyk         = !shouldStream || oneLinerS.isDone
  const showGenesis     = !shouldStream || dykS.isDone
  const showTimeline    = !shouldStream || genesisS.isDone
  const showTrajectory  = !shouldStream || showTimeline
  const showEvolution   = !shouldStream || trajectoryS.isDone
  const showCurrentState = !shouldStream || showEvolution
  const showFooter      = !shouldStream || currentS.isDone

  // Staggered delay for cached results (elements mount simultaneously)
  const d = (n: number) =>
    shouldStream ? {} : { animationDelay: `${n * 80}ms` }

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

      {/* Loading Transition Overlay */}
      {!transitionDone && (
        <LoadingTransition 
          state={loadingState}
          isVisible={loading}
          onHidden={() => setTransitionDone(true)}
        />
      )}

      {/* 2. Article skeleton while loading (only show for cached-for-user) */}
      {loading && loadingState === 'cached-for-user' && (
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
      {showContent && (
        <Card className={shouldStream ? '' : 'animate-in fade-in duration-300'}>
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
                  annotations={deepDive.report.annotations}
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

            {/* Data sources — appears after all text is done */}
            {showFooter && (
              <div className="animate-in fade-in duration-500 border-b border-border pb-5 mb-2" style={d(9)}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Data sources
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => (
                    <span key={key} className="flex items-center gap-2 bg-accent/30 px-2 py-1 rounded-full">
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

            {/* Current State */}
            {showCurrentState && (
              <div className="animate-in fade-in slide-in-from-bottom-3 duration-600 border-l-4 border-blue-500 bg-blue-500/10 pl-4 py-3" style={d(7)}>
                <p className="text-sm flex items-start gap-2">
                  <span className="text-base shrink-0"></span>
                  <span className="leading-relaxed">{currentText}</span>
                </p>
              </div>
            )}

            {/* Developer Activity — only when GitHub data is available */}
            {showFooter && deepDive?.github && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={d(8)}>
                <GitHubActivity data={deepDive.github} />
              </div>
            )}

            {/* Crypto Metrics — only when crypto data is available */}
            {showFooter && deepDive?.crypto && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={d(9)}>
                <CryptoMetrics data={deepDive.crypto} />
              </div>
            )}


          </CardContent>
        </Card>
      )}

      {/* Key Resources — appears after article is fully revealed */}
      {mixedArtifacts.length > 0 && transitionDone && !loading && showFooter && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-5 px-1" style={d(10)}>
          <h2 className="text-xl font-bold">Key Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {mixedArtifacts.map((item, i) => {
              const cfg = ARTIFACT_CONFIG[item.source]
              const canLink = cfg?.hasLink && !!item.url
              const Wrapper = canLink ? 'a' : 'div'
              const wrapperProps = canLink
                ? { href: item.url, target: '_blank', rel: 'noreferrer' }
                : {}

              return (
                <Wrapper
                  key={`${item.source}-${item.title}-${i}`}
                  {...wrapperProps}
                  className="group flex flex-col rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 min-h-52"
                  style={{ background: `linear-gradient(135deg, ${cfg?.accent}20 0%, ${cfg?.accent}06 100%)` }}
                >
                  <div className="h-1 w-full" style={{ background: cfg?.accent ?? '#1D4ED8' }} />

                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <span
                      className="self-start text-xs font-semibold px-2.5 py-1 rounded-full tracking-wide uppercase"
                      style={{ background: `${cfg?.accent}20`, color: cfg?.accent }}
                    >
                      {cfg?.label}
                    </span>

                    <p className="font-bold text-base leading-snug line-clamp-4 flex-1">{item.title}</p>

                    <div className="space-y-0.5">
                      {item.author && (
                        <p className="text-sm text-muted-foreground truncate">{item.author}</p>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground font-medium">{item.year}</span>
                        {canLink && (
                          <span className="text-xs font-semibold flex items-center gap-1 group-hover:underline" style={{ color: cfg?.accent }}>
                            View <ExternalLink className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Wrapper>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
