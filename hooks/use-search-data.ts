import { useState, useCallback } from 'react'
import { SearchResponse, ChartData } from '@/types/api'

export const useSearchData = () => {
  const [data, setData] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const fetchSearchData = useCallback(
    async (query: string) => {
      setLoading(true)
      setError(null)

      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`)
        }

        const result: SearchResponse = await response.json()
        setData(result)

        // Transform data for chart visualization
        const transformed = transformDataForChart(result)
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
    chartData,
    loading,
    error,
    fetchSearchData,
  }
}
