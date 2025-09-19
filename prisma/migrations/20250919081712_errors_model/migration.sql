-- CreateEnum
CREATE TYPE "public"."ErrorStatus" AS ENUM ('NEW', 'SEEN', 'FIXED');

-- CreateTable
CREATE TABLE "public"."ErrorGroup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "occurrencesCount" INTEGER NOT NULL DEFAULT 1,
    "status" "public"."ErrorStatus" NOT NULL DEFAULT 'NEW',
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ErrorGroup_userId_status_idx" ON "public"."ErrorGroup"("userId", "status");

-- CreateIndex
CREATE INDEX "ErrorGroup_userId_lastSeenAt_idx" ON "public"."ErrorGroup"("userId", "lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorGroup_userId_fingerprint_key" ON "public"."ErrorGroup"("userId", "fingerprint");

-- AddForeignKey
ALTER TABLE "public"."ErrorGroup" ADD CONSTRAINT "ErrorGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
