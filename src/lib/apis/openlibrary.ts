import {
  buildSourceResult,
  buildUnavailableSourceResult,
} from "@/lib/apis/common";
import type { Artifact, RawYearCount, SourceResult, YearlySeries } from "@/types/strata";

const SOURCE_ID = "openlibrary" as const;
const LABEL = "Books Published";
const DESCRIPTION = "Books first published per year from Open Library";

interface OpenLibraryDoc {
  first_publish_year?: number | null;
}


interface OpenLibraryResponse {
  docs?: OpenLibraryDoc[];
}

function isValidPublishYear(value: unknown, yearStart: number, yearEnd: number): value is number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return false;
  }

  if (value < 1450 || value > 2100) {
    return false;
  }

  return value >= yearStart && value <= yearEnd;
}

export async function fetchOpenLibrary(
  query: string,
  yearStart: number,
  yearEnd: number,
): Promise<SourceResult> {
  try {
    const endpoint = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=key,title,first_publish_year&limit=1000`;

    console.log("[OpenLibrary] Fetching", { query, yearStart, yearEnd });

    const response = await fetch(endpoint, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Open Library request failed: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as OpenLibraryResponse;
    const yearlyMap = new Map<number, number>();

    for (const doc of payload.docs ?? []) {
      const year = doc.first_publish_year;
      if (!isValidPublishYear(year, yearStart, yearEnd)) {
        continue;
      }

      yearlyMap.set(year, (yearlyMap.get(year) ?? 0) + 1);
    }

    const rawData: RawYearCount[] = [...yearlyMap.entries()].map(([year, count]) => ({
      year,
      count,
    }));

    const result = buildSourceResult(SOURCE_ID, LABEL, DESCRIPTION, rawData);
    console.log("[OpenLibrary] Completed", {
      available: result.available,
      points: result.data.length,
      totalCount: result.totalCount,
    });

    return result;
  } catch (error) {
    console.error("[OpenLibrary]", error);
    return buildUnavailableSourceResult(SOURCE_ID, LABEL, DESCRIPTION, error);
  }
}

interface OpenLibrarySearchDoc {
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  edition_count?: number;
  cover_i?: number;
}

export async function fetchOpenLibraryTopBooks(
  query: string,
  yearStart: number,
  yearEnd: number,
): Promise<Artifact[]> {
  try {
    const endpoint =
      `https://openlibrary.org/search.json` +
      `?q=${encodeURIComponent(query)}` +
      `&sort=editions` +
      `&fields=title,author_name,first_publish_year,edition_count,cover_i` +
      `&limit=100`;

    console.log("[OpenLibrary] Fetching top books by search", { query, yearStart, yearEnd });

    const res = await fetch(endpoint, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { docs?: OpenLibrarySearchDoc[] };

    return (data.docs ?? [])
      .filter((d) => {
        const y = d.first_publish_year;
        return typeof y === "number" && y >= yearStart && y <= yearEnd;
      })
      .map((d) => ({
        title: d.title ?? "Unknown",
        author: d.author_name?.[0],
        year: d.first_publish_year!,
        score: d.edition_count ?? 0,
        imageUrl: d.cover_i
          ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`
          : undefined,
        source: "openlibrary" as const,
      }))
      .sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}

// ─── explore3d: yearly series ────────────────────────────────────────────────

export async function fetchOpenLibraryYearly(query: string): Promise<YearlySeries> {
  const ID = "books";
  const currentYear = new Date().getFullYear();
  const PAGE_SIZE = 100;
  const MAX_PAGES = 10;

  try {
    console.log("[Explore3D][OpenLibrary] Fetching", { query });

    const yearlyMap = new Map<number, number>();
    let offset = 0;

    for (let page = 0; page < MAX_PAGES; page++) {
      const url =
        `https://openlibrary.org/search.json` +
        `?q=${encodeURIComponent(query)}` +
        `&fields=first_publish_year` +
        `&limit=${PAGE_SIZE}` +
        `&offset=${offset}`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) break;

      const data = (await res.json()) as { docs?: { first_publish_year?: unknown }[] };
      const docs = data.docs ?? [];
      if (docs.length === 0) break;

      let allBelow2015 = true;
      for (const doc of docs) {
        const year = doc.first_publish_year;
        if (typeof year !== "number" || year < 1800 || year > 2100) continue;
        if (year >= 2015 && year <= currentYear) {
          allBelow2015 = false;
          yearlyMap.set(year, (yearlyMap.get(year) ?? 0) + 1);
        } else if (year >= 2015) {
          allBelow2015 = false;
        }
      }

      if (allBelow2015) break;
      offset += PAGE_SIZE;
      if (page < MAX_PAGES - 1) await new Promise((r) => setTimeout(r, 500));
    }

    const data = [...yearlyMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([year, count]) => ({ year, count }));

    console.log("[Explore3D][OpenLibrary] Done", { years: data.length });
    return { id: ID, available: data.length > 0, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Explore3D][OpenLibrary] Error", msg);
    return { id: ID, available: false, error: msg, data: [] };
  }
}
