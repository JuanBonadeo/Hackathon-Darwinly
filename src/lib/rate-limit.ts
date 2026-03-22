import prisma from "@/lib/prisma";

const LIMIT = 10;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function checkRateLimit(identifier: string): Promise<{
  allowed: boolean;
  remaining: number;
  used: number;
  limit: number;
}> {
  const date = todayUTC();

  const current = await prisma.dailyUsage.findUnique({
    where: { identifier_date: { identifier, date } },
  });

  if ((current?.count ?? 0) >= LIMIT) {
    return { allowed: false, remaining: 0, used: current!.count, limit: LIMIT };
  }

  const updated = await prisma.dailyUsage.upsert({
    where: { identifier_date: { identifier, date } },
    create: { identifier, date, count: 1 },
    update: { count: { increment: 1 } },
  });

  return {
    allowed: true,
    remaining: Math.max(0, LIMIT - updated.count),
    used: updated.count,
    limit: LIMIT,
  };
}

export async function peekRateLimit(identifier: string): Promise<{
  remaining: number;
  used: number;
  limit: number;
}> {
  const date = todayUTC();

  const current = await prisma.dailyUsage.findUnique({
    where: { identifier_date: { identifier, date } },
  });

  const used = current?.count ?? 0;
  return { remaining: Math.max(0, LIMIT - used), used, limit: LIMIT };
}
