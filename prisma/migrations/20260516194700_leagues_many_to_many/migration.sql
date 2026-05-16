-- CreateTable
CREATE TABLE "_UserLeagues" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserLeagues_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserLeagues_B_index" ON "_UserLeagues"("B");

-- AddForeignKey
ALTER TABLE "_UserLeagues" ADD CONSTRAINT "_UserLeagues_A_fkey" FOREIGN KEY ("A") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserLeagues" ADD CONSTRAINT "_UserLeagues_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing leagueId values to junction table
INSERT INTO "_UserLeagues" ("A", "B")
SELECT "leagueId", "id" FROM "User" WHERE "leagueId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_leagueId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "leagueId";
