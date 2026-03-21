export interface DataPoint {
  year: number
  count: number
}

export interface SearchSources {
  wikipedia?: DataPoint[]
  books?: DataPoint[]
  papers?: DataPoint[]
  movies?: DataPoint[]
  news?: DataPoint[]
  [key: string]: DataPoint[] | undefined
}

export interface SearchResponse {
  query: string
  sources: SearchSources
}

export interface ChartData {
  year: number
  wikipedia?: number
  books?: number
  papers?: number
  movies?: number
  news?: number
}
