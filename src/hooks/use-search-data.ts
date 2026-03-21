import { useState, useCallback } from 'react'
import { deepDiveAction } from '@/app/actions/deepDive'
import type { SearchResponse, ChartData, DeepDiveResponse, ArtifactsResponse } from '@/types/api'

export const useSearchData = () => {
  const [data, setData] = useState<SearchResponse | null>(null)
  const [deepDive, setDeepDive] = useState<DeepDiveResponse | null>(null)
  const [artifacts, setArtifacts] = useState<ArtifactsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])

  const transformDataForChart = useCallback((sources: SearchResponse['sources']) => {
    const yearsSet = new Set<number>()
    Object.values(sources).forEach((items) => {
      if (Array.isArray(items)) {
        items.forEach((item) => yearsSet.add(item.year))
      }
    })
    const years = Array.from(yearsSet).sort((a, b) => a - b)
    return years.map((year) => {
      const chartPoint: ChartData = { year }
      Object.entries(sources).forEach(([source, items]) => {
        if (Array.isArray(items)) {
          const item = items.find((d) => d.year === year)
          if (item) chartPoint[source as keyof ChartData] = item.count
        }
      })
      return chartPoint
    })
  }, [])

  const fetchSearchData = useCallback(async (query: string) => {
    setLoading(true)
    setError(null)
    setData(null)
    setDeepDive(null)
    setArtifacts(null)
    setChartData([])

    try {
      const result = await deepDiveAction(query)

      const searchResponse: SearchResponse = { query, sources: result.sources }
      setData(searchResponse)
      setChartData(transformDataForChart(result.sources))
      setDeepDive(result as unknown as DeepDiveResponse)
      setArtifacts({ query, ...result.artifacts })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, [transformDataForChart])

  return {
    data,
    deepDive,
    artifacts,
    chartData,
    loading,
    insightsLoading: loading,
    artifactsLoading: loading,
    error,
    insightsError: null as string | null,
    artifactsError: null as string | null,
    fetchSearchData,
  }
}
