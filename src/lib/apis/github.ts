export interface GitHubRepo {
  fullName: string;
  stars: number;
  forks: number;
  description: string;
  url: string;
  language: string | null;
  createdAt: string;
}

export interface GitHubData {
  repo: GitHubRepo;
  // Cumulative star count sampled at ~15 points across the repo's lifetime
  starHistory: { date: string; stars: number }[];
}

const MIN_STARS = 500;
const PER_PAGE = 100;
const NUM_SAMPLES = 15;

function makeHeaders(token?: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

type RawRepo = {
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  description: string | null;
  html_url: string;
  language: string | null;
  created_at: string;
};

function mapRepo(repo: RawRepo): GitHubRepo {
  return {
    fullName: repo.full_name,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    description: repo.description ?? "",
    url: repo.html_url,
    language: repo.language,
    createdAt: repo.created_at,
  };
}

async function fetchRepoByName(fullName: string, token?: string): Promise<GitHubRepo | null> {
  const url = `https://api.github.com/repos/${fullName}`;
  const res = await fetch(url, { headers: makeHeaders(token), cache: "no-store" });
  if (!res.ok) return null;
  const repo = (await res.json()) as RawRepo;
  if (repo.stargazers_count < MIN_STARS) return null;
  return mapRepo(repo);
}

async function searchTopRepo(query: string, token?: string): Promise<GitHubRepo | null> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=1`;
  const res = await fetch(url, { headers: makeHeaders(token), cache: "no-store" });

  if (!res.ok) {
    console.error(`[GitHub] Search failed: ${res.status}`);
    return null;
  }

  const data = (await res.json()) as { items?: RawRepo[] };
  const repo = data.items?.[0];
  if (!repo || repo.stargazers_count < MIN_STARS) return null;
  return mapRepo(repo);
}

// Samples evenly-spaced pages of stargazers (with timestamps) to build a
// cumulative star-count timeline without fetching thousands of pages.
async function fetchStarHistory(
  fullName: string,
  totalStars: number,
  token?: string,
): Promise<{ date: string; stars: number }[]> {
  const totalPages = Math.ceil(totalStars / PER_PAGE);
  const numSamples = Math.min(NUM_SAMPLES, totalPages);

  // Evenly spaced page indices from 1 to totalPages
  const pages = Array.from({ length: numSamples }, (_, i) =>
    numSamples === 1
      ? 1
      : Math.max(1, Math.round(1 + (i / (numSamples - 1)) * (totalPages - 1))),
  );

  const starHeaders: HeadersInit = {
    Accept: "application/vnd.github.star+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  console.log(`[GitHub] Fetching star history for ${fullName} (${numSamples} samples)`);

  const points = await Promise.all(
    pages.map(async (page) => {
      const url = `https://api.github.com/repos/${fullName}/stargazers?per_page=${PER_PAGE}&page=${page}`;
      const res = await fetch(url, { headers: starHeaders, cache: "no-store" });
      if (!res.ok) {
        console.error(`[GitHub] Stargazers page ${page} failed: ${res.status} ${res.statusText}`);
        return null;
      }

      const data = (await res.json()) as { starred_at: string }[];
      if (!data.length) return null;

      const stars = (page - 1) * PER_PAGE + 1;
      console.log(`[GitHub] Page ${page} → date=${data[0].starred_at.slice(0, 10)}, cumStars=${stars}`);
      return { date: data[0].starred_at.slice(0, 10), stars };
    }),
  );

  const filtered = points.filter((p): p is { date: string; stars: number } => p !== null);

  console.log(`[GitHub] Star history: ${filtered.length}/${numSamples} pages succeeded`);

  // Always append the current total as the last data point
  filtered.push({ date: new Date().toISOString().slice(0, 10), stars: totalStars });

  return filtered.sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchGitHubData(query: string, repoFullName?: string | null): Promise<GitHubData | null> {
  const token = process.env.GITHUB_TOKEN;

  let repo: GitHubRepo | null = null;

  if (repoFullName) {
    console.log(`[GitHub] Fetching repo directly: ${repoFullName}`);
    repo = await fetchRepoByName(repoFullName, token);
    if (!repo) {
      console.log(`[GitHub] Could not fetch ${repoFullName}, skipping`);
      return null;
    }
  } else {
    console.log(`[GitHub] No repo hint, searching for "${query}"`);
    repo = await searchTopRepo(query, token);
    if (!repo) {
      console.log(`[GitHub] No prominent repo found for "${query}"`);
      return null;
    }
  }

  console.log(`[GitHub] Found ${repo.fullName} (${repo.stars} stars)`);

  const starHistory = await fetchStarHistory(repo.fullName, repo.stars, token);

  return { repo, starHistory };
}
