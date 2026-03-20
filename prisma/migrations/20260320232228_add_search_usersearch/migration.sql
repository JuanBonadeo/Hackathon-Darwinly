-- CreateTable
CREATE TABLE "search" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_search" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "searchId" TEXT NOT NULL,
    "searchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_search_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "search_query_endpoint_key" ON "search"("query", "endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "user_search_userId_searchId_key" ON "user_search"("userId", "searchId");

-- AddForeignKey
ALTER TABLE "user_search" ADD CONSTRAINT "user_search_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_search" ADD CONSTRAINT "user_search_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "search"("id") ON DELETE CASCADE ON UPDATE CASCADE;
