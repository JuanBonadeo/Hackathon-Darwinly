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

interface CmcQuoteEntry {
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
}

async function fetchQuoteBy(param: string, apiKey: string): Promise<CmcQuoteEntry | null> {
  const response = await fetch(
    `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?${param}`,
    {
      headers: { "X-CMC_PRO_API_KEY": apiKey, Accept: "application/json" },
      cache: "no-store",
    },
  );
  if (!response.ok) return null;
  const json = (await response.json()) as { data?: Record<string, CmcQuoteEntry | CmcQuoteEntry[]> };
  if (!json.data) return null;

  // When multiple entries exist (symbol search), pick the lowest cmc_rank
  const entries = Object.values(json.data).flatMap((v) => (Array.isArray(v) ? v : [v]));
  if (entries.length === 0) return null;

  const ranked = entries.filter((e) => (e.cmc_rank ?? 0) > 0);
  if (ranked.length > 0) {
    return ranked.reduce((best, e) => ((e.cmc_rank ?? Infinity) < (best.cmc_rank ?? Infinity) ? e : best));
  }
  return entries[0];
}

export async function fetchCryptoData(query: string): Promise<CryptoData | null> {
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  if (!apiKey) {
    console.log("[CoinMarketCap] API key not configured");
    return null;
  }

  try {
    const slug = query.toLowerCase().trim();
    console.log(`[CoinMarketCap] Searching for "${slug}"`);

    // 1. Try slug — unambiguous (bitcoin → Bitcoin BTC, not meme tokens)
    let quote = await fetchQuoteBy(`slug=${encodeURIComponent(slug)}`, apiKey);

    // 2. Fallback: try as ticker symbol — fetchQuoteBy picks lowest rank
    if (!quote) {
      quote = await fetchQuoteBy(`symbol=${encodeURIComponent(slug.toUpperCase())}`, apiKey);
    }

    if (!quote) {
      console.log(`[CoinMarketCap] Not found: ${slug}`);
      return null;
    }

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
