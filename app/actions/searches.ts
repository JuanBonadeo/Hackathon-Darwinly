"use server";

import prisma from "@/lib/prisma";

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
