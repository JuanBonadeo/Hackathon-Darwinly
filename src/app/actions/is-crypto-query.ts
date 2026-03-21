"use server";

import { getOpenAI } from "@/lib/openai";

export async function isCryptoQuery(query: string): Promise<boolean> {
  if (!process.env.OPENAI_API_KEY) return false;

  const prompt = `Is "${query}" the name or ticker symbol of a real cryptocurrency or blockchain token that is listed on CoinMarketCap?

A valid crypto must be a coin or token you can buy/sell — like Bitcoin (BTC), Ethereum (ETH), etc.
Generic tech concepts (blockchain, web3, defi, nft) are NOT valid unless they are also a specific tradeable token symbol.

TRUE examples (real coins/tokens — name or ticker):
- "bitcoin" / "btc" → true
- "ethereum" / "eth" → true
- "solana" / "sol" → true
- "cardano" / "ada" → true
- "dogecoin" / "doge" → true
- "ripple" / "xrp" → true
- "polkadot" / "dot" → true
- "avalanche" / "avax" → true
- "chainlink" / "link" → true
- "litecoin" / "ltc" → true
- "uniswap" / "uni" → true
- "shiba inu" / "shib" → true
- "tron" / "trx" → true
- "stellar" / "xlm" → true
- "cosmos" / "atom" → true
- "monero" / "xmr" → true
- "near" / "near protocol" → true
- "aptos" / "apt" → true
- "arbitrum" / "arb" → true
- "optimism" / "op" → true
- "filecoin" / "fil" → true
- "tezos" / "xtz" → true
- "aave" → true
- "maker" / "mkr" → true
- "bnb" / "binance coin" → true
- "usdc" / "usdt" / "tether" → true
- "pepe" → true (meme token)
- "sui" → true (blockchain token)
- "injective" / "inj" → true
- "sei" → true

FALSE examples (NOT a crypto):
- "blockchain" → false (concept, not a coin)
- "defi" → false (category, not a specific coin)
- "nft" → false (format, not a coin)
- "web3" → false (ecosystem concept)
- "react" → false (JavaScript library)
- "python" → false (programming language)
- "climate change" → false
- "feminism" → false
- "artificial intelligence" → false
- "elon musk" → false (person)

Respond with ONLY "true" or "false", no explanation.`;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
    });
    const text = (completion.choices[0].message.content ?? "").trim().toLowerCase();
    console.log(`[isCryptoQuery] "${query}" → "${text}"`);
    return text === "true";
  } catch {
    return false;
  }
}
