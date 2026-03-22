import type { YearlySeries } from "@/types/darwinly";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Resolve TMDB keyword IDs for a query string (returns up to 3). */
async function resolveTmdbKeywordIds(query: string, apiKey: string): Promise<number[]> {
  const url =
    `https://api.themoviedb.org/3/search/keyword` +
    `?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: { id: number }[] };
    return (data.results ?? []).slice(0, 3).map((k) => k.id);
  } catch {
    return [];
  }
}

function parseReleaseYear(rd: string | undefined): number | null {
  if (!rd) return null;
  const year = Number(rd.slice(0, 4));
  return Number.isFinite(year) && year >= 2015 ? year : null;
}

function addToYearMap(map: Map<number, number>, year: number): void {
  map.set(year, (map.get(year) ?? 0) + 1);
}

function mapToSortedPoints(map: Map<number, number>): { year: number; count: number }[] {
  return [...map.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);
}

// ─── Strategy A: keyword-based discovery ─────────────────────────────────────

async function discoverByKeywords(
  keywordIds: number[],
  apiKey: string,
  map: Map<number, number>,
): Promise<void> {
  const withKeywords = keywordIds.join("|"); // "|" = OR in TMDB discover
  for (let page = 1; page <= 10; page++) {
    const url =
      `https://api.themoviedb.org/3/discover/movie` +
      `?api_key=${apiKey}` +
      `&with_keywords=${withKeywords}` +
      `&primary_release_date.gte=2015-07-01` +
      `&sort_by=primary_release_date.asc` +
      `&page=${page}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) break;

    const data = (await res.json()) as {
      results?: { release_date?: string }[];
      total_pages?: number;
    };
    const results = data.results ?? [];
    if (results.length === 0) break;

    for (const movie of results) {
      const year = parseReleaseYear(movie.release_date);
      if (year !== null) addToYearMap(map, year);
    }

    if (page >= (data.total_pages ?? 1)) break;
    await new Promise((r) => setTimeout(r, 200));
  }
}

// ─── Strategy B: title search fallback ───────────────────────────────────────

async function searchByTitle(
  query: string,
  apiKey: string,
  map: Map<number, number>,
): Promise<void> {
  for (let page = 1; page <= 5; page++) {
    const url =
      `https://api.themoviedb.org/3/search/movie` +
      `?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) break;

    const data = (await res.json()) as { results?: { release_date?: string }[] };
    const results = data.results ?? [];
    if (results.length === 0) break;

    for (const movie of results) {
      const year = parseReleaseYear(movie.release_date);
      if (year !== null) addToYearMap(map, year);
    }

    if (results.length < 20) break;
    await new Promise((r) => setTimeout(r, 200));
  }
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

export async function fetchTmdbYearly(query: string): Promise<YearlySeries> {
  const ID = "movies";

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return { id: ID, available: false, error: "TMDB_API_KEY not configured", data: [] };
  }

  try {
    const keywordIds = await resolveTmdbKeywordIds(query, apiKey);
    console.log("[Explore3D][TMDB] Keyword IDs", { query, keywordIds });

    const yearlyMap = new Map<number, number>();

    if (keywordIds.length > 0) {
      await discoverByKeywords(keywordIds, apiKey, yearlyMap);
    } else {
      await searchByTitle(query, apiKey, yearlyMap);
    }

    const data = mapToSortedPoints(yearlyMap);
    console.log("[Explore3D][TMDB] Done", { years: data.length, keywordIds });
    return { id: ID, available: data.length > 0, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Explore3D][TMDB] Error", msg);
    return { id: ID, available: false, error: msg, data: [] };
  }
}
