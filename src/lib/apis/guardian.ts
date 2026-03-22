import type { YearlyDataPoint } from "@/types/darwinly";

interface GuardianResponse {
  response?: {
    total?: number;
    status?: string;
  };
}

async function fetchGuardianYear(
  query: string,
  year: number,
  apiKey: string,
): Promise<number> {
  const fromDate = `${year}-01-01`;
  const toDate = `${year}-12-31`;

  const url = new URL("https://content.guardianapis.com/search");
  url.searchParams.set("q", query);
  url.searchParams.set("from-date", fromDate);
  url.searchParams.set("to-date", toDate);
  url.searchParams.set("page-size", "1");
  url.searchParams.set("api-key", apiKey);

  const response = await fetch(url.toString(), { cache: "no-store" });

  if (response.status === 429) throw new Error("Guardian rate limited");
  if (!response.ok) throw new Error(`Guardian ${response.status}`);

  const data = (await response.json()) as GuardianResponse;

  if (data.response?.status !== "ok") {
    throw new Error("Guardian API error");
  }

  return data.response?.total ?? 0;
}

export async function fetchGuardianYearly(
  query: string,
  apiKey: string,
): Promise<YearlyDataPoint[]> {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2015 + 1 }, (_, i) => 2015 + i);

  console.log(`[News][Guardian] Fetching ${years.length} years`);

  const results: YearlyDataPoint[] = [];

  for (const year of years) {
    try {
      const count = await fetchGuardianYear(query, year, apiKey);
      results.push({ year, count });
      console.log(`[News][Guardian] ${year}: ${count} articles`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[News][Guardian] Failed ${year}:`, msg);
    }

    if (year < currentYear) {
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  console.log(`[News][Guardian] Complete: ${results.length} years`);
  return results;
}
