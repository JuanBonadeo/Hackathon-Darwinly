import { useState, useCallback } from 'react'
import {
  SearchResponse,
  ChartData,
  DeepDiveResponse,
  ArtifactsResponse,
} from '@/types/api'

export const useSearchData = () => {
  const [data, setData] = useState<SearchResponse | null>(null)
  const [deepDive, setDeepDive] = useState<DeepDiveResponse | null>(null)
  const [artifacts, setArtifacts] = useState<ArtifactsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [artifactsLoading, setArtifactsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [insightsError, setInsightsError] = useState<string | null>(null)
  const [artifactsError, setArtifactsError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])

  const transformDataForChart = useCallback((response: SearchResponse) => {
    // Collect all unique years
    const yearsSet = new Set<number>()

    Object.values(response.sources).forEach((items) => {
      if (Array.isArray(items)) {
        items.forEach((item) => yearsSet.add(item.year))
      }
    })

    const years = Array.from(yearsSet).sort((a, b) => a - b)

    // Create chart data structure
    const transformed: ChartData[] = years.map((year) => {
      const chartPoint: ChartData = { year }

      Object.entries(response.sources).forEach(([source, items]) => {
        if (Array.isArray(items)) {
          const item = items.find((d) => d.year === year)
          if (item) {
            chartPoint[source as keyof ChartData] = item.count
          }
        }
      })

      return chartPoint
    })

    return transformed
  }, [])

  const fetchExtraData = useCallback(async (query: string) => {
    setInsightsLoading(true)
    setArtifactsLoading(true)
    setInsightsError(null)
    setArtifactsError(null)

    const [deepDiveResult, artifactsResult] = await Promise.allSettled([
      fetch(`/api/deep-dive?q=${encodeURIComponent(query)}`),
      fetch(`/api/artifacts?q=${encodeURIComponent(query)}`),
    ])

    if (deepDiveResult.status === 'fulfilled') {
      if (deepDiveResult.value.ok) {
        const deepDiveData: DeepDiveResponse = await deepDiveResult.value.json()
        setDeepDive(deepDiveData)
      } else {
        setInsightsError(`Deep dive API error: ${deepDiveResult.value.status}`)
      }
    } else {
      setInsightsError('No se pudo cargar el resumen narrativo')
    }
    setInsightsLoading(false)

    if (artifactsResult.status === 'fulfilled') {
      if (artifactsResult.value.ok) {
        const artifactsData: ArtifactsResponse = await artifactsResult.value.json()
        setArtifacts(artifactsData)
      } else {
        setArtifactsError(`Artifacts API error: ${artifactsResult.value.status}`)
      }
    } else {
      setArtifactsError('No se pudieron cargar los artifacts')
    }
    setArtifactsLoading(false)
  }, [])

  const fetchSearchData = useCallback(
    async (query: string) => {
      setLoading(true)
      setError(null)
      setDeepDive(null)
      setArtifacts(null)
      setInsightsError(null)
      setArtifactsError(null)

      try {
        const response = await fetch(`/api/explore3d?q=${encodeURIComponent(query)}`)
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`)
        }

        const result: SearchResponse = await response.json()
        setData(result)

        // Transform data for chart visualization
        const transformed = transformDataForChart(result)
        setChartData(transformed)
        void fetchExtraData(query)

        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    },
    [fetchExtraData, transformDataForChart]
  )

  return {
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
  }
}
