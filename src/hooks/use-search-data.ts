import { useState, useCallback } from 'react'
import { deepDiveAction } from '@/app/actions/deepDive'
import type { DeepDiveFullResponse } from '@/app/actions/deepDive'
import type { SearchResponse, ChartData } from '@/types/api'

export const useSearchData = () => {
  const [data, setData] = useState<SearchResponse | null>(null)
  const [deepDive, setDeepDive] = useState<DeepDiveFullResponse | null>(null)
  const [artifacts, setArtifacts] = useState<DeepDiveFullResponse['artifacts'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])

  const transformDataForChart = useCallback((sources: Record<string, { year: number; count: number }[]>) => {
    const yearsSet = new Set<number>()

    Object.values(sources).forEach((items) => {
      items.forEach((item) => yearsSet.add(item.year))
    })

    const years = Array.from(yearsSet).sort((a, b) => a - b)

    return years.map((year) => {
      const chartPoint: ChartData = { year }

      Object.entries(sources).forEach(([source, items]) => {
        const item = items.find((d) => d.year === year)
        if (item) {
          chartPoint[source as keyof ChartData] = item.count
        }
      })

      return chartPoint
    })
  }, [])

  const fetchSearchData = useCallback(
    async (query: string) => {
      setLoading(true)
      setError(null)
      setDeepDive(null)
      setArtifacts(null)

      try {
        const result = await deepDiveAction(query)

        const searchData: SearchResponse = { query, sources: result.sources }
        setData(searchData)
        setDeepDive(result)
        setArtifacts(result.artifacts)

        const transformed = transformDataForChart(result.sources)
        setChartData(transformed)

        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    },
    [transformDataForChart]
  )

  return {
    data,
    deepDive,
    artifacts,
    chartData,
    loading,
    error,
    fetchSearchData,
  }
}
