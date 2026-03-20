import { fetchCoreYearly } from "@/lib/apis/core-papers";
import { fetchNytYearly } from "@/lib/apis/nyt";
import { fetchOpenLibraryYearly } from "@/lib/apis/openlibrary";
import { fetchTmdbYearly } from "@/lib/apis/tmdb";
import { fetchWikipediaYearly } from "@/lib/apis/wikipedia";
import { getCached, setCache } from "@/lib/cache";
import type { Explore3DResponse, YearlyDataPoint, YearlySeries } from "@/types/strata";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([promise, new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);
}

function unavailable(id: string, error: string): YearlySeries {
  return { id, available: false, error, data: [] };
}

function currentEndDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();

  if (!query) {
    return Response.json({ error: "Missing q parameter" }, { status: 400 });
  }

  const cacheKey = query.toLowerCase().trim();
  const cached = getCached<Explore3DResponse>(cacheKey);
  if (cached) {
    console.log("[Explore3D] Cache hit", { query });
    return Response.json(cached);
  }

  const endDate = currentEndDate();
  const coreKey = process.env.CORE_API_KEY;
  const nytKey = process.env.NYT_API_KEY;

  console.log("[Explore3D] Fetch start", { query, endDate });

  const [wikipedia, books, papers, movies, news] = await Promise.all([
    withTimeout(
      fetchWikipediaYearly(query, endDate),
      10_000,
      unavailable("wikipedia", "Timeout"),
    ),
    withTimeout(
      fetchOpenLibraryYearly(query),
      15_000,
      unavailable("books", "Timeout"),
    ),
    withTimeout(
      coreKey
        ? fetchCoreYearly(query, coreKey).then((data): YearlySeries => ({
            id: "papers",
            available: data.some((d) => d.count > 0),
            data,
          }))
        : Promise.resolve(unavailable("papers", "CORE_API_KEY not configured")),
      45_000,
      unavailable("papers", "Timeout"),
    ),
    withTimeout(
      fetchTmdbYearly(query),
      8_000,
      unavailable("movies", "Timeout"),
    ),
    withTimeout(
      nytKey
        ? fetchNytYearly(query, nytKey)
        : Promise.resolve(unavailable("news", "NYT_API_KEY not configured")),
      15_000,
      unavailable("news", "Timeout"),
    ),
  ]);

  const allSeries = [wikipedia, books, papers, movies, news];
  const sources: Record<string, YearlyDataPoint[]> = {};
  for (const s of allSeries) {
    sources[s.id] = s.data;
  }

  const response: Explore3DResponse = { query, sources };

  const available = allSeries.filter((s) => s.available).length;
  console.log("[Explore3D] Fetch complete", { available, total: 5 });

  setCache(cacheKey, response);
  return Response.json(response);
}
