"use server";

import { headers } from "next/headers";
import { normalizeQuery } from "@/app/actions/search";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const DEFAULT_SEARCH_ENDPOINT = "deep-dive-full";

export async function getSearchesByUserId(userId: string) {
  const userSearches = await prisma.userSearch.findMany({
    where: { userId },
    orderBy: { searchedAt: "desc" },
    select: {
      searchedAt: true,
      search: {
        select: {
          id: true,
          query: true,
          endpoint: true,
          durationMs: true,
        },
      },
    },
  });

  return userSearches.map((us) => ({
    ...us.search,
    searchedAt: us.searchedAt,
  }));
}

export async function getSearchById(searchId: string) {
  return prisma.search.findUnique({
    where: { id: searchId },
  });
}

export async function deleteUserSearch(userId: string, searchId: string) {
  await prisma.userSearch.delete({
    where: { userId_searchId: { userId, searchId } },
  });
}

export async function deleteSearch(searchId: string) {
  await prisma.search.delete({
    where: { id: searchId },
  });
}

export async function unlinkCurrentUserSearchByQuery(
  query: string,
  endpoint: string = DEFAULT_SEARCH_ENDPOINT,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId || !query.trim()) {
    return { success: false as const };
  }

  const normalizedQuery = normalizeQuery(query).toLowerCase();

  const search = await prisma.search.findUnique({
    where: {
      query_endpoint: {
        query: normalizedQuery,
        endpoint,
      },
    },
    select: { id: true },
  });

  if (!search) {
    return { success: true as const, deletedRelations: 0 };
  }

  const deleted = await prisma.userSearch.deleteMany({
    where: {
      userId,
      searchId: search.id,
    },
  });

  return { success: true as const, deletedRelations: deleted.count };
}
