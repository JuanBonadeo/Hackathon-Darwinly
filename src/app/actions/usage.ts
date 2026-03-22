"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { peekRateLimit } from "@/lib/rate-limit";

export async function getUsageStatus(): Promise<{ used: number; remaining: number; limit: number }> {
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    userId = session?.user?.id ?? null;
  } catch {}

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  const identifier = userId ? `user:${userId}` : `ip:${ip}`;
  return peekRateLimit(identifier);
}
