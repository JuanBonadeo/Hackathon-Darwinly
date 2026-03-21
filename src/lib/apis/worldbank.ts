// World Bank API — no API key required
// Docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/898581

export interface WorldBankPoint {
  year: number;
  value: number;
}

export interface WorldBankSeries {
  label: string;
  unit: string;
  data: WorldBankPoint[];
}

export interface WorldBankMacro {
  internet: WorldBankSeries;
  gdpGrowth: WorldBankSeries;
  rdSpending: WorldBankSeries;
}

// ─── Internal ─────────────────────────────────────────────────────────────────

type WBRaw = [unknown, Array<{ date: string; value: number | null }> | undefined];

async function fetchIndicator(
  indicatorId: string,
  yearStart: number,
  yearEnd: number,
): Promise<WorldBankPoint[]> {
  const url =
    `https://api.worldbank.org/v2/country/WLD/indicator/${indicatorId}` +
    `?format=json&per_page=100&date=${yearStart}:${yearEnd}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];

  const raw = (await res.json()) as WBRaw;
  const items = raw[1] ?? [];

  return items
    .filter((d) => d.value !== null)
    .map((d) => ({ year: Number(d.date), value: d.value! }))
    .sort((a, b) => a.year - b.year);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function fetchWorldBankMacro(
  yearStart = 2000,
  yearEnd = new Date().getFullYear(),
): Promise<WorldBankMacro> {
  const [internet, gdpGrowth, rdSpending] = await Promise.all([
    fetchIndicator("IT.NET.USER.ZS", yearStart, yearEnd).catch(() => []),
    fetchIndicator("NY.GDP.MKTP.KD.ZG", yearStart, yearEnd).catch(() => []),
    fetchIndicator("GB.XPD.RSDV.GD.ZS", yearStart, yearEnd).catch(() => []),
  ]);

  return {
    internet: { label: "Internet users", unit: "% of population", data: internet },
    gdpGrowth: { label: "GDP growth", unit: "% annual", data: gdpGrowth },
    rdSpending: { label: "R&D expenditure", unit: "% of GDP", data: rdSpending },
  };
}
