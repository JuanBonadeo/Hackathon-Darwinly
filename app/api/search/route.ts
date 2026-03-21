import { NextRequest, NextResponse } from 'next/server'
import { SearchResponse } from '@/types/api'

// This is a mock API endpoint. Replace with your actual backend call
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Replace this with your actual backend API call
    // Example: const response = await fetch(`${process.env.BACKEND_API_URL}/search?query=${query}`)
    
    // For now, returning mock data based on the structure you provided
    // This demonstrates the API structure
    const mockData: SearchResponse = {
      query,
      sources: {
        wikipedia: [
          { year: 2015, count: 936078 },
          { year: 2016, count: 2131562 },
          { year: 2017, count: 2887086 },
          { year: 2018, count: 3462897 },
          { year: 2019, count: 3345426 },
          { year: 2020, count: 2808126 },
          { year: 2021, count: 3130451 },
          { year: 2022, count: 5422904 },
          { year: 2023, count: 6690936 },
          { year: 2024, count: 4749769 },
          { year: 2025, count: 3901257 },
          { year: 2026, count: 710112 },
        ],
        books: [
          { year: 2015, count: 9 },
          { year: 2016, count: 16 },
          { year: 2017, count: 39 },
          { year: 2018, count: 69 },
          { year: 2019, count: 88 },
          { year: 2020, count: 67 },
          { year: 2021, count: 79 },
          { year: 2022, count: 37 },
          { year: 2023, count: 48 },
          { year: 2024, count: 55 },
          { year: 2025, count: 32 },
          { year: 2026, count: 1 },
        ],
        papers: [
          { year: 2015, count: 1360807 },
          { year: 2016, count: 1360807 },
          { year: 2017, count: 1360807 },
          { year: 2018, count: 1360807 },
          { year: 2019, count: 1360807 },
          { year: 2020, count: 1360807 },
          { year: 2021, count: 1360807 },
          { year: 2022, count: 1360807 },
          { year: 2023, count: 1360807 },
          { year: 2024, count: 1360807 },
          { year: 2025, count: 1360807 },
          { year: 2026, count: 1360807 },
        ],
        movies: [
          { year: 2015, count: 24 },
          { year: 2016, count: 45 },
          { year: 2017, count: 62 },
          { year: 2018, count: 88 },
          { year: 2019, count: 110 },
          { year: 2020, count: 76 },
          { year: 2021, count: 129 },
          { year: 2022, count: 166 },
          { year: 2023, count: 208 },
          { year: 2024, count: 242 },
          { year: 2025, count: 219 },
          { year: 2026, count: 64 },
        ],
        news: [
          { year: 2015, count: 1800 },
          { year: 2016, count: 2500 },
          { year: 2017, count: 4200 },
          { year: 2018, count: 7600 },
          { year: 2019, count: 11800 },
          { year: 2020, count: 21400 },
          { year: 2021, count: 19400 },
          { year: 2022, count: 23800 },
          { year: 2023, count: 30400 },
          { year: 2024, count: 27900 },
          { year: 2025, count: 26200 },
          { year: 2026, count: 6200 },
        ],
      },
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
