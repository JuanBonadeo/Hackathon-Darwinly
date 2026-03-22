import type { YearlyDataPoint } from "@/types/darwinly";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CoreSearchResponse {
  totalHits: number;
  limit: number;
  offset: number;
  results: unknown[];
}

// ─── Per-year fetcher ─────────────────────────────────────────────────────────

async function fetchCoreYear(
  query: string,
  year: number,
  apiKey: string,
): Promise<number> {
  const response = await fetch("https://api.core.ac.uk/v3/search/works", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: `${query} AND yearPublished:${year}`, limit: 1, offset: 0 }),
    cache: "no-store",
  });

  if (response.status === 429) throw new Error("CORE rate limited");
  if (!response.ok) throw new Error(`CORE ${response.status}`);

  const data = (await response.json()) as CoreSearchResponse;
  return data.totalHits ?? 0;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function fetchCoreYearly(
  query: string,
  apiKey: string,
): Promise<YearlyDataPoint[]> {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2015 + 1 }, (_, i) => 2015 + i);

  console.log(`[Papers][CORE] Fetching ${years.length} years`);

  const results: YearlyDataPoint[] = [];

  for (const year of years) {
    try {
      const count = await fetchCoreYear(query, year, apiKey);
      results.push({ year, count });
      console.log(`[Papers][CORE] ${year}: ${count} papers`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Papers][CORE] Failed ${year}:`, msg);
    }

    if (year < currentYear) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log(`[Papers][CORE] Complete: ${results.length} years`);
  return results;
}
