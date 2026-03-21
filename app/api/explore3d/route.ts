import { fetchCoreYearly } from "@/lib/apis/core-papers";
import { fetchNytYearly } from "@/lib/apis/nyt";
import { fetchOpenLibraryYearly } from "@/lib/apis/openlibrary";
import { fetchTmdbYearly } from "@/lib/apis/tmdb";
import { fetchWikipediaYearly } from "@/lib/apis/wikipedia";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
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

async function linkUserSearch(userId: string, searchId: string): Promise<void> {
  await prisma.userSearch.upsert({
    where: { userId_searchId: { userId, searchId } },
    create: { userId, searchId },
    update: { searchedAt: new Date() },
  });
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: Request): Promise<Response> {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed, remaining } = checkRateLimit(ip);
  const rateLimitHeaders = { "X-RateLimit-Remaining": String(remaining) };

  if (!allowed) {
    return Response.json(
      { error: "Rate limit exceeded", remaining: 0 },
      { status: 429, headers: rateLimitHeaders },
    );
  }

  const url = new URL(request.url);
  const raw = url.searchParams.get("q")?.trim();

  if (!raw) {
    return Response.json({ error: "Missing q parameter" }, { status: 400 });
  }

  const query = raw.toLowerCase().trim();
  const ENDPOINT = "explore3d";

  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id ?? null;

  // ─── DB cache hit ─────────────────────────────────────────────────────────
  const existing = await prisma.search.findUnique({
    where: { query_endpoint: { query, endpoint: ENDPOINT } },
  });

  if (existing) {
    console.log("[Explore3D] DB cache hit", { query });
    if (userId) await linkUserSearch(userId, existing.id);
    return Response.json(existing.response, { headers: rateLimitHeaders });
  }

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const endDate = currentEndDate();
  const coreKey = process.env.CORE_API_KEY;
  const nytKey = process.env.NYT_API_KEY;

  console.log("[Explore3D] Fetch start", { query, endDate });
  const start = Date.now();

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
  const durationMs = Date.now() - start;

  const available = allSeries.filter((s) => s.available).length;
  console.log("[Explore3D] Fetch complete", { available, total: 5, durationMs });

  // ─── Persist ──────────────────────────────────────────────────────────────
  const saved = await prisma.search.upsert({
    where: { query_endpoint: { query, endpoint: ENDPOINT } },
    create: { query, endpoint: ENDPOINT, response: response as object, durationMs },
    update: { response: response as object, durationMs },
  });

  if (userId) await linkUserSearch(userId, saved.id);

  return Response.json(response, { headers: rateLimitHeaders });
}
