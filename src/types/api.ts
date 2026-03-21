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

export interface ArtifactItem {
  title: string
  author?: string
  year: number
  score: number
  url?: string
  imageUrl?: string
  source: 'openlibrary' | 'semanticscholar' | 'tmdb'
}

export interface ArtifactsResponse {
  query: string
  books: ArtifactItem[]
  papers: ArtifactItem[]
  movies: ArtifactItem[]
}

export interface DeepDiveReport {
  oneLiner: string
  hook: string
  genesis: string
  trajectory: string
  inflectionPoint: {
    year: number | null
    explanation: string
  }
  currentState: string
  didYouKnow: string
  phase: 'genesis' | 'rise' | 'peak' | 'consolidation' | 'decline'
}

export interface DeepDiveResponse {
  report: DeepDiveReport
  sources: SearchSources
  artifacts: {
    books: ArtifactItem[]
    papers: ArtifactItem[]
    movies: ArtifactItem[]
  }
}
