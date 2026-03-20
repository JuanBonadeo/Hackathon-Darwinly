'use client'

import { useState } from 'react'
import { useSearchData } from '@/hooks/use-search-data'
import { SearchCharts } from './search-charts'
import { Darwinly3DChartWrapper } from './darwinly-3d-chart-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function SearchResults() {
  const [query, setQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const { data, chartData, loading, error, fetchSearchData } = useSearchData()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchQuery(query)
      await fetchSearchData(query)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Across Sources</CardTitle>
          <CardDescription>
            Enter a query to see data from Wikipedia, Books, Papers, Movies, and News
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter search query (e.g., 'artificial intelligence')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Charts */}
      {data && !loading && (
        <>
          <Darwinly3DChartWrapper 
            data={data}
            barSize={8}
            autoRotate={true}
            rotateSpeed={4}
          />
          <SearchCharts data={chartData} query={searchQuery} />
        </>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex justify-center items-center h-96">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Fetching search data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!data && !loading && !error && (
        <Card>
          <CardContent className="flex justify-center items-center h-96">
            <div className="text-center text-muted-foreground">
              Enter a search query above to see the charts
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
