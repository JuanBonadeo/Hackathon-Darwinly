'use client'

import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { useTheme } from 'next-themes'
import Darwinly3DChart from './Darwinly3DChart'
import { SearchResponse } from '@/types/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

type EchartsWindow = Window & {
  echarts?: typeof echarts
  echartsGL?: unknown
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

const SOURCE_COLORS: Record<string, string> = {
  wikipedia: '#38BDF8',
  books:     '#60A5FA',
  papers:    '#3B82F6',
  movies:    '#6366F1',
  news:      '#1D4ED8',
}
const SOURCE_LABELS: Record<string, string> = {
  wikipedia: 'Wikipedia',
  books:     'Books',
  papers:    'Papers',
  movies:    'Movies',
  news:      'News',
}

function Chart2DFallback({ data, isDarkMode }: { data: SearchResponse; isDarkMode: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    chartRef.current = echarts.init(containerRef.current, isDarkMode ? 'dark' : undefined)

    const sources = Object.keys(data.sources)
    const allYears = Array.from(
      new Set(sources.flatMap((s) => (data.sources[s] ?? []).map((d) => d.year)))
    ).sort((a, b) => a - b)

    const series = sources.map((s) => {
      const byYear = Object.fromEntries((data.sources[s] ?? []).map((d) => [d.year, d.count]))
      return {
        name: SOURCE_LABELS[s] ?? s,
        type: 'line' as const,
        stack: 'total',
        areaStyle: { opacity: 0.6 },
        smooth: true,
        lineStyle: { width: 2 },
        color: SOURCE_COLORS[s] ?? '#94A3B8',
        data: allYears.map((y) => byYear[y] ?? 0),
      }
    })

    chartRef.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { top: 8, textStyle: { color: isDarkMode ? '#CBD5E1' : '#475569' } },
      grid: { left: 16, right: 16, bottom: 24, top: 48, containLabel: true },
      xAxis: {
        type: 'category',
        data: allYears,
        axisLabel: { color: isDarkMode ? '#94A3B8' : '#64748B', rotate: 30 },
        axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#CBD5E1' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: isDarkMode ? '#94A3B8' : '#64748B' },
        splitLine: { lineStyle: { color: isDarkMode ? '#1E293B' : '#F1F5F9' } },
      },
      series,
    })

    const handleResize = () => chartRef.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [data, isDarkMode])

  return <div ref={containerRef} style={{ width: '100%', height: '400px' }} />
}

interface Darwinly3DChartWrapperProps {
  data: SearchResponse
  barSize?: number
  autoRotate?: boolean
  rotateSpeed?: number
  zScaleMode?: 'year_share' | 'source_relative' | 'source_log_relative' | 'log_global'
  onYearSelect?: (year: number) => void
}

export function Darwinly3DChartWrapper({
  data,
  barSize = 8,
  autoRotate = true,
  rotateSpeed = 4,
  zScaleMode = 'source_log_relative',
  onYearSelect,
}: Darwinly3DChartWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<InstanceType<typeof Darwinly3DChart> | null>(null)
  const [webGLSupported] = useState(() => typeof window !== 'undefined' ? detectWebGL() : true)
  const [echartsGlLoaded, setEchartsGlLoaded] = useState(() => {
    if (typeof window === 'undefined') return false
    return Boolean((window as EchartsWindow).echartsGL)
  })
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme !== 'light'

  // Load echarts-gl from CDN
  useEffect(() => {
    if (typeof window === 'undefined') return
    const windowWithEcharts = window as EchartsWindow
    
    // Make echarts available globally
    windowWithEcharts.echarts = echarts

    // Check if echarts-gl is already loaded
    if (windowWithEcharts.echartsGL) {
      return
    }

    // Load echarts-gl from CDN
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/echarts-gl@2/dist/echarts-gl.min.js'
    script.async = true
    script.onload = () => {
      setEchartsGlLoaded(true)
    }
    script.onerror = () => {
      console.error('Failed to load echarts-gl')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup: remove script if component unmounts immediately
    }
  }, [])

  // Render chart once echarts-gl is loaded
  useEffect(() => {
    if (!echartsGlLoaded || !containerRef.current) return

    // Create chart instance
    if (!chartRef.current) {
      chartRef.current = new Darwinly3DChart(
        containerRef.current.id,
        data,
        {
          barSize,
          autoRotate,
          rotateSpeed,
          zScaleMode,
          isDarkMode,
          onYearSelect,
        }
      )
      chartRef.current.render()
    } else {
      // Update existing chart
      chartRef.current.update(data)
    }

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [echartsGlLoaded, data, barSize, autoRotate, rotateSpeed, zScaleMode, isDarkMode, onYearSelect])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl">Evolution Map</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!webGLSupported ? (
          <Chart2DFallback data={data} isDarkMode={isDarkMode} />
        ) : (
          <>
            {!echartsGlLoaded && (
              <div
                style={{
                  width: '100%',
                  height: '600px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">Loading 3D chart library...</p>
                </div>
              </div>
            )}

            {echartsGlLoaded && (
              <div
                ref={containerRef}
                id="darwinly-3d-chart"
                style={{
                  width: '100%',
                  height: '600px',
                  minHeight: '600px',
                }}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
