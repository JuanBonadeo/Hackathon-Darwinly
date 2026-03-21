export interface CryptoData {
  name: string;
  symbol: string;
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  rank: number;
  ath: {
    price: number;
    date: string;
  };
}

interface CmcMapEntry {
  id: number;
  rank: number | null;
  symbol: string;
  slug: string;
}

async function cmcMapFetch(params: string, apiKey: string): Promise<CmcMapEntry[]> {
  const response = await fetch(
    `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?${params}`,
    {
      headers: { "X-CMC_PRO_API_KEY": apiKey, Accept: "application/json" },
      cache: "no-store",
    },
  );
  if (!response.ok) return [];
  const data = (await response.json()) as { data?: CmcMapEntry[] };
  return data.data ?? [];
}

function pickBestId(entries: CmcMapEntry[]): number | null {
  if (entries.length === 0) return null;
  // Prefer the entry with the lowest CMC rank (rank 1 = Bitcoin, etc.)
  const ranked = entries.filter((e) => e.rank != null && e.rank > 0);
  if (ranked.length > 0) {
    return ranked.reduce((best, e) => (e.rank! < best.rank! ? e : best)).id;
  }
  return entries[0].id;
}

async function searchCrypto(query: string, apiKey: string): Promise<number | null> {
  const slug = query.toLowerCase().trim();

  // 1. Try slug match first — most accurate for named queries like "bitcoin", "ethereum"
  const bySlug = await cmcMapFetch(`slug=${encodeURIComponent(slug)}`, apiKey);
  const slugId = pickBestId(bySlug);
  if (slugId) return slugId;

  // 2. Fall back to symbol match — pick lowest rank to avoid meme tokens
  const bySymbol = await cmcMapFetch(`symbol=${encodeURIComponent(slug.toUpperCase())}`, apiKey);
  return pickBestId(bySymbol);
}

async function fetchCryptoQuote(id: number, apiKey: string) {
  const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${id}`;

  const response = await fetch(url, {
    headers: {
      "X-CMC_PRO_API_KEY": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`CMC ${response.status}`);

  const data = (await response.json()) as { data?: Record<string, unknown> };
  return (data.data as Record<number, unknown>)?.[id];
}

export async function fetchCryptoData(query: string): Promise<CryptoData | null> {
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  if (!apiKey) {
    console.log("[CoinMarketCap] API key not configured");
    return null;
  }

  try {
    console.log(`[CoinMarketCap] Searching for "${query}"`);

    const cryptoId = await searchCrypto(query, apiKey);
    if (!cryptoId) {
      console.log(`[CoinMarketCap] Not found: ${query}`);
      return null;
    }

    const quote = await fetchCryptoQuote(cryptoId, apiKey) as {
      name?: string;
      symbol?: string;
      cmc_rank?: number;
      quote?: {
        USD?: {
          price?: number;
          market_cap?: number;
          volume_24h?: number;
          percent_change_24h?: number;
          percent_change_7d?: number;
          percent_change_30d?: number;
          ath?: { price?: number; timestamp?: string };
        };
      };
    } | null;

    if (!quote) return null;

    const usdQuote = quote.quote?.USD;
    if (!usdQuote) return null;

    const result: CryptoData = {
      name: quote.name ?? query,
      symbol: quote.symbol ?? query.toUpperCase(),
      currentPrice: usdQuote.price ?? 0,
      marketCap: usdQuote.market_cap ?? 0,
      volume24h: usdQuote.volume_24h ?? 0,
      priceChange24h: usdQuote.percent_change_24h ?? 0,
      priceChange7d: usdQuote.percent_change_7d ?? 0,
      priceChange30d: usdQuote.percent_change_30d ?? 0,
      rank: quote.cmc_rank ?? 0,
      ath: {
        price: usdQuote.ath?.price ?? 0,
        date: usdQuote.ath?.timestamp ?? "",
      },
    };

    console.log(`[CoinMarketCap] Found: ${result.name} (${result.symbol})`);
    return result;
  } catch (err) {
    console.error("[CoinMarketCap] Error:", err);
    return null;
  }
}
