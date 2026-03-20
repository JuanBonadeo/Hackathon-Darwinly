const LIMIT = 10;
const WINDOW_MS = 24 * 60 * 60 * 1000;

interface Entry {
  count: number;
  resetTime: number;
}

const store = new Map<string, Entry>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now >= entry.resetTime) {
    store.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: LIMIT - 1 };
  }

  if (entry.count >= LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: LIMIT - entry.count };
}
