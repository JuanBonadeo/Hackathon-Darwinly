"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";
import { fetchCoreYearly } from "@/lib/apis/core-papers";
import { fetchNytYearly } from "@/lib/apis/nyt";
import { fetchOpenLibraryYearly } from "@/lib/apis/openlibrary";
import { fetchTmdbYearly } from "@/lib/apis/tmdb";
import { fetchWikipediaYearly } from "@/lib/apis/wikipedia";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { YearlySeries } from "@/types/strata";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DeepDiveReport {
  origin: string;
  timeline: string;
  peakDecade: string;
  firstMover: string;
  keyArtifacts: {
    books: string[];
    papers: string[];
    movies: string[];
  };
  unexpectedInsight: string;
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

// ─── Main Server Action ───────────────────────────────────────────────────────

export async function deepDiveAction(query: string): Promise<DeepDiveReport> {
  if (!query?.trim()) throw new Error("Missing query");

  const normalizedQuery = query.toLowerCase().trim();
  const ENDPOINT = "deep-dive";

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  // ─── DB cache hit ───────────────────────────────────────────────────────────
  const existing = await prisma.search.findUnique({
    where: { query_endpoint: { query: normalizedQuery, endpoint: ENDPOINT } },
  });

  if (existing) {
    console.log("[DeepDive] DB cache hit", { query: normalizedQuery });
    if (userId) await linkUserSearch(userId, existing.id);
    return existing.response as DeepDiveReport;
  }

  // ─── Fetch sources ─────────────────────────────────────────────────────────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error("GEMINI_API_KEY not configured");

  const endDate = currentEndDate();
  const coreKey = process.env.CORE_API_KEY;
  const nytKey = process.env.NYT_API_KEY;

  console.log("[DeepDive] Fetching sources", { query: normalizedQuery });
  const start = Date.now();

  const [wikipedia, books, papers, movies, news] = await Promise.all([
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
  ]);

  // ─── Gemini ────────────────────────────────────────────────────────────────
  console.log("[DeepDive] Sources fetched, calling Gemini");

  const prompt = `You are a cultural and intellectual historian with access to quantitative data about the topic "${normalizedQuery}".

Here is the signal data collected from multiple sources (yearly counts from 2015 onwards):

- Wikipedia pageviews: ${summarizeSeries(wikipedia)}
- Books published (Open Library): ${summarizeSeries(books)}
- Academic papers (CORE): ${summarizeSeries(papers)}
- Movies/films (TMDB): ${summarizeSeries(movies)}
- News articles (NYT): ${summarizeSeries(news)}

Based on this data and your knowledge, produce a comprehensive analytical report about "${normalizedQuery}" as a cultural and intellectual phenomenon. Your analysis should go beyond just the data — use your knowledge to enrich it.

Respond with ONLY a valid JSON object matching this exact structure (no markdown, no explanation):
{
  "origin": "A paragraph describing when and how '${normalizedQuery}' originated as a concept or phenomenon, including historical context and founding figures.",
  "timeline": "A narrative paragraph tracing its evolution across decades, referencing key milestones, turning points, and how it spread.",
  "peakDecade": "The decade (e.g. '1990s', '2010s') when it had its greatest cultural or intellectual impact, with brief justification.",
  "firstMover": "The individual, institution, work, or event widely considered the originator or first mover for '${normalizedQuery}'.",
  "keyArtifacts": {
    "books": ["Title by Author (Year)", "Title by Author (Year)", "Title by Author (Year)"],
    "papers": ["Title by Author (Year)", "Title by Author (Year)", "Title by Author (Year)"],
    "movies": ["Title (Year)", "Title (Year)", "Title (Year)"]
  },
  "unexpectedInsight": "One surprising, counterintuitive, or little-known insight about '${normalizedQuery}' that most people would find unexpected."
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

  // ─── Persist ───────────────────────────────────────────────────────────────
  const saved = await prisma.search.create({
    data: { query: normalizedQuery, endpoint: ENDPOINT, response: report as object, durationMs },
  });

  if (userId) await linkUserSearch(userId, saved.id);

  console.log("[DeepDive] Done", { query: normalizedQuery, durationMs });
  return report;
}
