-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "League_slug_key" ON "League"("slug");

-- Seed a default league for existing data
INSERT INTO "League" ("id", "name", "slug", "createdAt")
VALUES ('default-league-id', 'Default', 'default', CURRENT_TIMESTAMP);

-- AlterTable User (nullable)
ALTER TABLE "User" ADD COLUMN "leagueId" TEXT;

-- Backfill existing non-admin users to default league
UPDATE "User" SET "leagueId" = 'default-league-id' WHERE role = 'PLAYER';

-- AlterTable Selection (nullable first, then backfill, then NOT NULL)
ALTER TABLE "Selection" ADD COLUMN "leagueId" TEXT;

-- Backfill existing selections to default league
UPDATE "Selection" SET "leagueId" = 'default-league-id';

-- Make Selection.leagueId NOT NULL
ALTER TABLE "Selection" ALTER COLUMN "leagueId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Selection" ADD CONSTRAINT "Selection_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
