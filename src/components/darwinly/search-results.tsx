'use client'

import React, { useEffect, useRef, useState } from 'react'

// Delays a boolean flag becoming true — resets immediately when source goes false.
// Uses startTransition so heavy renders (charts) don't block streaming updates.
function useDelayedFlag(source: boolean, delayMs: number): boolean {
  const [value, setValue] = useState(false)
  useEffect(() => {
    if (!source) { setValue(false); return }
    const t = setTimeout(() => React.startTransition(() => setValue(true)), delayMs)
    return () => clearTimeout(t)
  }, [source, delayMs])
  return value
}
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

  const PAUSE       = 400  // pause between text sections
  const CHART_PAUSE = 900  // extra time for charts to finish rendering

  // Streaming chain — each section waits for the previous to finish + a pause
  const hookS             = useSimulatedStreaming(report?.hook,         shouldStream,                      5, 145)
  const oneLinerEnabled   = useDelayedFlag(shouldStream && hookS.isDone,               PAUSE)
  const oneLinerS         = useSimulatedStreaming(report?.oneLiner,     oneLinerEnabled,                   6, 130)
  const dykEnabled        = useDelayedFlag(oneLinerEnabled && oneLinerS.isDone,        PAUSE)
  const dykS              = useSimulatedStreaming(report?.didYouKnow,   dykEnabled,                        5, 130)
  const genesisEnabled    = useDelayedFlag(dykEnabled && dykS.isDone,                 PAUSE)
  const genesisS          = useSimulatedStreaming(report?.genesis,      genesisEnabled,                    6, 125)
  const timelineEnabled   = useDelayedFlag(genesisEnabled && genesisS.isDone,         PAUSE)
  const trajectoryEnabled = useDelayedFlag(timelineEnabled,                            CHART_PAUSE) // wait for Timeline to paint
  const trajectoryS       = useSimulatedStreaming(report?.trajectory,   trajectoryEnabled,                 6, 125)
  const evolutionEnabled  = useDelayedFlag(trajectoryEnabled && trajectoryS.isDone,   PAUSE)
  const currentEnabled    = useDelayedFlag(evolutionEnabled,                           CHART_PAUSE) // wait for 3D chart to paint
  const currentS          = useSimulatedStreaming(report?.currentState, currentEnabled,                    6, 125)
  const footerEnabled     = useDelayedFlag(currentEnabled && currentS.isDone,         PAUSE)

  // Display text — streamed when animating, full text when cached
  const hookText       = shouldStream ? hookS.displayedText       : (report?.hook ?? '')
  const oneLinerText   = shouldStream ? oneLinerS.displayedText   : (report?.oneLiner ?? '')
  const dykText        = shouldStream ? dykS.displayedText        : (report?.didYouKnow ?? '')
  const genesisText    = shouldStream ? genesisS.displayedText    : (report?.genesis ?? '')
  const trajectoryText = shouldStream ? trajectoryS.displayedText : (report?.trajectory ?? '')
  const currentText    = shouldStream ? currentS.displayedText    : (report?.currentState ?? '')

  // Visibility gates — sequential when streaming, all true when cached
  const showOneLiner     = !shouldStream || oneLinerEnabled
  const showDyk          = !shouldStream || dykEnabled
  const showGenesis      = !shouldStream || genesisEnabled
  const showTimeline     = !shouldStream || timelineEnabled
  const showTrajectory   = !shouldStream || trajectoryEnabled
  const showEvolution    = !shouldStream || evolutionEnabled
  const showCurrentState = !shouldStream || currentEnabled
  const showFooter       = !shouldStream || footerEnabled

  // Staggered delay for cached results (elements mount simultaneously)
  const d = (n: number) =>
    shouldStream ? {} : { animationDelay: `${n * 80}ms` }

  // Refs for auto-scroll during streaming
  const dykRef        = useRef<HTMLDivElement>(null)
  const genesisRef    = useRef<HTMLDivElement>(null)
  const timelineRef   = useRef<HTMLDivElement>(null)
  const trajectoryRef = useRef<HTMLDivElement>(null)
  const evolutionRef  = useRef<HTMLDivElement>(null)
  const currentRef    = useRef<HTMLDivElement>(null)

  function scrollTo(ref: React.RefObject<HTMLDivElement | null>) {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 80)
  }

  useEffect(() => { if (shouldStream && showDyk)          scrollTo(dykRef)         }, [showDyk,          shouldStream]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (shouldStream && showGenesis)      scrollTo(genesisRef)     }, [showGenesis,      shouldStream]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (shouldStream && showTimeline)     scrollTo(timelineRef)    }, [showTimeline,     shouldStream]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (shouldStream && showTrajectory)   scrollTo(trajectoryRef)  }, [showTrajectory,   shouldStream]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (shouldStream && showEvolution)    scrollTo(evolutionRef)   }, [showEvolution,    shouldStream]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (shouldStream && showCurrentState) scrollTo(currentRef)     }, [showCurrentState, shouldStream]) // eslint-disable-line react-hooks/exhaustive-deps

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
            <h2 id="search-hook" className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-3xl sm:text-4xl font-bold leading-tight min-h-10">
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
              <div
                ref={dykRef}
                key="dyk-box"
                className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both border-l-4 border-yellow-400 bg-yellow-400/10 pl-4 py-3"
                style={shouldStream ? { animationDelay: '120ms' } : d(2)}
              >
                <p className="text-sm flex items-start gap-2">
                  <span className="text-base shrink-0">💡</span>
                  <span className="leading-relaxed">{dykText}</span>
                </p>
              </div>
            )}

            {/* Genesis */}
            {showGenesis && (
              <p id="search-genesis" ref={genesisRef} className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-base leading-relaxed" style={d(3)}>
                {genesisText}
              </p>
            )}

            {/* Timeline — appears after genesis finishes */}
            {showTimeline && (
              <div id="search-timeline" ref={timelineRef} className="animate-in fade-in slide-in-from-bottom-4 duration-700 my-8" style={d(4)}>
                <DarwinlyTimeline
                  data={data}
                  annotations={deepDive.report.annotations}
                />
              </div>
            )}

            {/* Trajectory */}
            {showTrajectory && (
              <p ref={trajectoryRef} className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-base leading-relaxed" style={d(5)}>
                {trajectoryText}
              </p>
            )}

            {/* Evolution Map — appears after trajectory finishes */}
            {showEvolution && (
              <div id="search-evolution" ref={evolutionRef} className="animate-in fade-in slide-in-from-bottom-4 duration-700 my-8" style={d(6)}>
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
              <div
                id="search-current"
                ref={currentRef}
                key="current-box"
                className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both border-l-4 border-blue-500 bg-blue-500/10 pl-4 py-3"
                style={shouldStream ? { animationDelay: '120ms' } : d(7)}
              >
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
        <div id="search-resources" className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-5 px-1" style={d(10)}>
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
