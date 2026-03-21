"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";
import { fetchCoreYearly } from "@/lib/apis/core-papers";
import { fetchNytYearly } from "@/lib/apis/nyt";
import { fetchOpenLibraryYearly, fetchOpenLibraryTopBooks } from "@/lib/apis/openlibrary";
import { fetchTmdbYearly } from "@/lib/apis/tmdb";
import { fetchWikipediaYearly } from "@/lib/apis/wikipedia";
import { sleep } from "@/lib/apis/common";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { fetchWorldBankMacro } from "@/lib/apis/worldbank";
import type { WorldBankMacro } from "@/lib/apis/worldbank";
import type { Artifact, YearlyDataPoint, YearlySeries } from "@/types/strata";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DeepDiveReport {
  oneLiner: string;
  hook: string;
  genesis: string;
  trajectory: string;
  inflectionPoint: {
    year: number | null;
    explanation: string;
  };
  currentState: string;
  didYouKnow: string;
  phase: "genesis" | "rise" | "peak" | "consolidation" | "decline";
}

export interface DeepDiveFullResponse {
  report: DeepDiveReport;
  sources: Record<string, YearlyDataPoint[]>;
  artifacts: {
    books: Artifact[];
    papers: Artifact[];
    movies: Artifact[];
  };
}

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

function summarizeMacro(macro: WorldBankMacro): string {
  const fmt = (s: { label: string; unit: string; data: { year: number; value: number }[] }) => {
    if (s.data.length === 0) return `${s.label}: no data`;
    const first = s.data[0];
    const last = s.data[s.data.length - 1];
    const peak = s.data.reduce((a, b) => (b.value > a.value ? b : a));
    const delta = last.value - first.value;
    const sign = delta >= 0 ? "+" : "";
    return (
      `${s.label} (${s.unit}): ` +
      `${first.year}=${first.value.toFixed(1)}, ${last.year}=${last.value.toFixed(1)} ` +
      `(${sign}${delta.toFixed(1)} since ${first.year}; peak ${peak.year}=${peak.value.toFixed(1)})`
    );
  };
  return [fmt(macro.internet), fmt(macro.gdpGrowth), fmt(macro.rdSpending)].join("\n");
}

function summarizeSeries(series: YearlySeries): string {
  if (!series.available || series.data.length === 0) return "no data";
  const total = series.data.reduce((s, d) => s + d.count, 0);
  const peak = series.data.reduce((a, b) => (b.count > a.count ? b : a));
  const byDecade: Record<string, number> = {};
  for (const d of series.data) {
    const decade = `${Math.floor(d.year / 10) * 10}s`;
    byDecade[decade] = (byDecade[decade] ?? 0) + d.count;
  }
  const decadeSummary = Object.entries(byDecade)
    .map(([d, c]) => `${d}: ${c}`)
    .join(", ");
  return `total=${total}, peak=${peak.year}(${peak.count}), by decade: ${decadeSummary}`;
}

async function linkUserSearch(userId: string, searchId: string): Promise<void> {
  await prisma.userSearch.upsert({
    where: { userId_searchId: { userId, searchId } },
    create: { userId, searchId },
    update: { searchedAt: new Date() },
  });
}

// ─── Artifact Helpers ─────────────────────────────────────────────────────────

interface SSPaper {
  title?: string;
  year?: number | null;
  citationCount?: number | null;
  authors?: { name: string }[];
  externalIds?: { CorpusId?: number };
}

interface TmdbSearchMovie {
  title?: string;
  release_date?: string;
  popularity?: number;
  vote_count?: number;
  poster_path?: string | null;
}

async function fetchArtifactPapers(
  query: string,
  yearStart: number,
  yearEnd: number,
): Promise<Artifact[]> {
  try {
    const url =
      `https://api.semanticscholar.org/graph/v1/paper/search` +
      `?query=${encodeURIComponent(query)}` +
      `&fields=title,year,citationCount,authors,externalIds` +
      `&year=${yearStart}-${yearEnd}` +
      `&offset=0&limit=100`;

    const ssApiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
    const ssHeaders: HeadersInit = {
      Accept: "application/json",
      ...(ssApiKey ? { "x-api-key": ssApiKey } : {}),
    };
    let res = await fetch(url, { cache: "no-store", headers: ssHeaders });
    if (res.status === 429) {
      console.warn("[DeepDive/Papers] Rate limited, retrying after 2s");
      await sleep(2000);
      res = await fetch(url, { cache: "no-store", headers: ssHeaders });
    }
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: SSPaper[] };

    return (data.data ?? [])
      .filter((p) => {
        const y = Number(p.year);
        return Number.isFinite(y) && y >= yearStart && y <= yearEnd && (p.citationCount ?? 0) > 0;
      })
      .map((p) => ({
        title: p.title ?? "Unknown",
        author: p.authors?.[0]?.name,
        year: Number(p.year),
        score: p.citationCount!,
        url: p.externalIds?.CorpusId
          ? `https://www.semanticscholar.org/paper/${p.externalIds.CorpusId}`
          : undefined,
        source: "semanticscholar" as const,
      }))
      .sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}

async function fetchArtifactMovies(
  query: string,
  yearStart: number,
  yearEnd: number,
): Promise<Artifact[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];

  try {
    const kwRes = await fetch(
      `https://api.themoviedb.org/3/search/keyword?query=${encodeURIComponent(query)}&api_key=${apiKey}`,
      { cache: "no-store" },
    );
    const kwData = kwRes.ok
      ? ((await kwRes.json()) as { results?: { id: number; name: string }[] })
      : { results: [] };
    const keywordIds = kwData.results?.map((k) => k.id).join("|");

    const fetchPage = async (page: number): Promise<TmdbSearchMovie[]> => {
      const url = keywordIds
        ? `https://api.themoviedb.org/3/discover/movie?with_keywords=${keywordIds}&sort_by=vote_count.desc&api_key=${apiKey}&page=${page}`
        : `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${apiKey}&page=${page}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return [];
      const data = (await res.json()) as { results?: TmdbSearchMovie[] };
      return data.results ?? [];
    };

    const [page1, page2] = await Promise.all([fetchPage(1), fetchPage(2)]);
    const allResults = [...page1, ...page2];

    return allResults
      .filter((m) => {
        const y = Number(m.release_date?.slice(0, 4));
        return Number.isFinite(y) && y >= yearStart && y <= yearEnd && (m.vote_count ?? 0) > 50;
      })
      .map((m) => ({
        title: m.title ?? "Unknown",
        year: Number(m.release_date!.slice(0, 4)),
        score: m.popularity ?? 0,
        imageUrl: m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : undefined,
        source: "tmdb" as const,
      }))
      .sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}

// ─── Main Server Action ───────────────────────────────────────────────────────

export async function deepDiveAction(query: string): Promise<DeepDiveFullResponse> {
  if (!query?.trim()) throw new Error("Missing query");

  const normalizedQuery = query.toLowerCase().trim();
  const ENDPOINT = "deep-dive-full";

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  // ─── DB cache hit ───────────────────────────────────────────────────────────
  const existing = await prisma.search.findUnique({
    where: { query_endpoint: { query: normalizedQuery, endpoint: ENDPOINT } },
  });

  if (existing) {
    console.log("[DeepDive] DB cache hit", { query: normalizedQuery });
    if (userId) await linkUserSearch(userId, existing.id);
    return existing.response as unknown as DeepDiveFullResponse;
  }

  // ─── Fetch sources ─────────────────────────────────────────────────────────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error("GEMINI_API_KEY not configured");

  const endDate = currentEndDate();
  const coreKey = process.env.CORE_API_KEY;
  const nytKey = process.env.NYT_API_KEY;
  const yearEnd = new Date().getFullYear();
  const yearStart = yearEnd - 10;

  console.log("[DeepDive] Fetching sources", { query: normalizedQuery });
  const start = Date.now();

  const [wikipedia, books, papers, movies, news, macro, artifactBooks, artifactPapers, artifactMovies] =
    await Promise.all([
      withTimeout(
        fetchWikipediaYearly(normalizedQuery, endDate),
        10_000,
        unavailable("wikipedia", "Timeout"),
      ),
      withTimeout(
        fetchOpenLibraryYearly(normalizedQuery),
        15_000,
        unavailable("books", "Timeout"),
      ),
      withTimeout(
        coreKey
          ? fetchCoreYearly(normalizedQuery, coreKey).then((data): YearlySeries => ({
              id: "papers",
              available: data.some((d) => d.count > 0),
              data,
            }))
          : Promise.resolve(unavailable("papers", "CORE_API_KEY not configured")),
        45_000,
        unavailable("papers", "Timeout"),
      ),
      withTimeout(
        fetchTmdbYearly(normalizedQuery),
        8_000,
        unavailable("movies", "Timeout"),
      ),
      withTimeout(
        nytKey
          ? fetchNytYearly(normalizedQuery, nytKey)
          : Promise.resolve(unavailable("news", "NYT_API_KEY not configured")),
        15_000,
        unavailable("news", "Timeout"),
      ),
      withTimeout(fetchWorldBankMacro(), 10_000, {
        internet:   { label: "Internet users",  unit: "% of population", data: [] },
        gdpGrowth:  { label: "GDP growth",       unit: "% annual",        data: [] },
        rdSpending: { label: "R&D expenditure",  unit: "% of GDP",        data: [] },
      }),
      withTimeout(fetchOpenLibraryTopBooks(normalizedQuery, yearStart, yearEnd), 15_000, []),
      withTimeout(fetchArtifactPapers(normalizedQuery, yearStart, yearEnd), 45_000, []),
      withTimeout(fetchArtifactMovies(normalizedQuery, yearStart, yearEnd), 10_000, []),
    ]);

  // ─── Build sources map (Explore3D) ─────────────────────────────────────────
  const allSeries = [wikipedia, books, papers, movies, news];
  const sources: Record<string, YearlyDataPoint[]> = {};
  for (const s of allSeries) {
    sources[s.id] = s.data;
  }

  // ─── Gemini ────────────────────────────────────────────────────────────────
  console.log("[DeepDive] Sources fetched, calling Gemini");

  const prompt = `You are a cultural journalist writing for Wired or The Atlantic — intellectually sharp, accessible to curious non-experts, with a knack for finding the surprising story hidden in data. Your task: write an introductory overview of how "${normalizedQuery}" evolved as a cultural phenomenon from 2015 to present.

━━━ SIGNAL DATA ━━━
Wikipedia pageviews (yearly):   ${summarizeSeries(wikipedia)}
Books published (Open Library):  ${summarizeSeries(books)}
Academic papers (CORE):          ${summarizeSeries(papers)}
Movies/films (TMDB):             ${summarizeSeries(movies)}
News articles (NYT):             ${summarizeSeries(news)}
Macroeconomic context:           ${summarizeMacro(macro)}

━━━ SCOPE: WHAT TO ANALYZE ━━━
You are analyzing "${normalizedQuery}" as a CULTURAL OBJECT — how it moved through public consciousness, media, and discourse.

Examples of correct framing:
- "Bitcoin" → Track media hype cycles, mainstream adoption narrative, pop culture presence — NOT technical blockchain evolution
- "Feminism" → Fourth-wave resurgence, #MeToo, intersectionality debates — NOT the 1960s history
- "Climate change" → Greta Thunberg, Paris Agreement media coverage, climate fiction boom — NOT scientific consensus timeline
- "React" (JavaScript library) → Developer community growth, hiring trends, conference buzz — NOT technical feature releases

Focus on: public attention, cultural gatekeepers (NYT, publishers, Hollywood), discourse shifts
Ignore: technical specifications, academic definitions pre-2015, niche subcommunities

If the query is a person, focus on their cultural impact/fame trajectory, not their biography.
If the query is a technology, focus on adoption narratives and hype cycles, not technical milestones.

━━━ RULES ━━━
- Cite at least 2 specific data trends with numbers/years as evidence
- Explain WHY shifts happened — don't just describe them (e.g., "papers spiked 40% in 2020 likely due to pandemic research priorities")
- If data is sparse, contradictory, or flat, acknowledge it in one clause — don't fabricate trends
- Reference macro context ONLY if it plausibly explains a cultural shift
- Distinguish whether this is a durable shift or temporary spike
- Write for a curious 25-year-old — no jargon, no "it is worth noting" hedging
- Respect character limits strictly

━━━ OUTPUT — valid JSON only, no markdown ━━━
{
  "oneLiner": "Ultra-compressed summary (max 100 chars). Use concrete descriptors, not abstractions.",

  "hook": "1 punchy sentence (max 120 chars). A provocation or surprising fact — not a definition.",

  "genesis": "1-2 sentences (max 280 chars). When/how '${normalizedQuery}' emerged as a recognizable concept. Name the originating figure, work, or event if known.",

  "trajectory": "3-4 sentences (max 400 chars). Trace evolution citing at least 2 data trends. Explain causality: 'X happened because...' not 'X happened and then...'",

  "inflectionPoint": {
    "year": number | null,  // null if no clear pivot
    "explanation": "2 sentences (max 250 chars). What happened that year and why data shifted. If year is null, explain why no inflection exists."
  },

  "currentState": "1 sentence (max 150 chars). Where '${normalizedQuery}' stands today. Accelerating, plateauing, or fading?",

  "didYouKnow": "One genuinely surprising, non-obvious insight (max 200 chars). NOT a restatement of the data — synthesize something unexpected that emerges from cross-referencing sources or historical context. Avoid trivia; aim for 'huh, I never thought about it that way' reactions.",

  "phase": "one of: genesis | rise | peak | consolidation | decline — based on most recent trend"
}`;

  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonText = text.startsWith("```")
    ? text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    : text;

  const report = JSON.parse(jsonText) as DeepDiveReport;
  const durationMs = Date.now() - start;

  // ─── Assemble full response ────────────────────────────────────────────────
  const response: DeepDiveFullResponse = {
    report,
    sources,
    artifacts: {
      books: artifactBooks.slice(0, 3),
      papers: artifactPapers.slice(0, 3),
      movies: artifactMovies.slice(0, 3),
    },
  };

  // ─── Persist ───────────────────────────────────────────────────────────────
  const saved = await prisma.search.upsert({
    where: { query_endpoint: { query: normalizedQuery, endpoint: ENDPOINT } },
    create: { query: normalizedQuery, endpoint: ENDPOINT, response: response as object, durationMs },
    update: { response: response as object, durationMs },
  });

  if (userId) await linkUserSearch(userId, saved.id);

  console.log("[DeepDive] Done", { query: normalizedQuery, durationMs });
  return response;
}
