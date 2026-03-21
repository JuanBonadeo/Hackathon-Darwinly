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
      </CardContent>
    </Card>
  )
}
