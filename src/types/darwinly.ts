export interface Artifact {
  title: string;
  author?: string;
  year: number;
  score: number;
  url?: string;
  imageUrl?: string;
  source: "openlibrary" | "semanticscholar" | "tmdb";
}

export interface TimelineAnnotation {
  year: number;
  type: "inflection" | "peak" | "milestone";
  explanation: string;
}

export interface YearlyDataPoint {
  year: number;
  count: number;
}

export interface YearlySeries {
  id: string;
  available: boolean;
  error?: string;
  data: YearlyDataPoint[];
}
