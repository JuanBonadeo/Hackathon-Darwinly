import type { YearlySeries } from "@/types/strata";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NytArticleSearchResponse {
  status: string;
  response?: {
    meta?: { hits: number };
  };
}

// ─── Single-year fetch ────────────────────────────────────────────────────────

async function fetchNytYear(query: string, year: number, apiKey: string): Promise<number> {
  const url =
    `https://api.nytimes.com/svc/search/v2/articlesearch.json` +
    `?q=${encodeURIComponent(query)}` +
    `&begin_date=${year}0101` +
    `&end_date=${year}1231` +
    `&fl=_id` +
    `&api-key=${apiKey}`;

  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 429) throw new Error("NYT rate limited");
  if (!res.ok) throw new Error(`NYT ${res.status}`);

  const data = (await res.json()) as NytArticleSearchResponse;
  return data.response?.meta?.hits ?? 0;
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

export async function fetchNytYearly(query: string, apiKey: string): Promise<YearlySeries> {
  const ID = "news";

  try {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2015 + 1 }, (_, i) => 2015 + i);
    const data: { year: number; count: number }[] = [];

    console.log(`[Explore3D][NYT] Fetching ${years.length} years`);

    for (const year of years) {
      try {
        const count = await fetchNytYear(query, year, apiKey);
        data.push({ year, count });
        console.log(`[Explore3D][NYT] ${year}: ${count} articles`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[Explore3D][NYT] Failed ${year}:`, msg);
      }

      // Stay within the 10 req/min rate limit
      await new Promise((r) => setTimeout(r, 200));
    }

    console.log(`[Explore3D][NYT] Complete: ${data.length} years`);
    return { id: ID, available: data.some((p) => p.count > 0), data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Explore3D][NYT] Error", msg);
    return { id: ID, available: false, error: msg, data: [] };
  }
}
