const LIMIT = 10;
const WINDOW_MS = 24 * 60 * 60 * 1000;

interface Entry {
  count: number;
  resetTime: number;
}

const store = new Map<string, Entry>();

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  used: number;
  limit: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now >= entry.resetTime) {
    const resetTime = now + WINDOW_MS;
    store.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: LIMIT - 1, used: 1, limit: LIMIT, resetTime };
  }

  if (entry.count >= LIMIT) {
    return { allowed: false, remaining: 0, used: entry.count, limit: LIMIT, resetTime: entry.resetTime };
  }

  entry.count += 1;
  return { allowed: true, remaining: LIMIT - entry.count, used: entry.count, limit: LIMIT, resetTime: entry.resetTime };
}

export function peekRateLimit(identifier: string): {
  remaining: number;
  used: number;
  limit: number;
} {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now >= entry.resetTime) {
    return { remaining: LIMIT, used: 0, limit: LIMIT };
  }

  return { remaining: Math.max(0, LIMIT - entry.count), used: entry.count, limit: LIMIT };
}
