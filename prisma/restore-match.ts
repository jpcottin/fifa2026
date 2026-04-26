import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const tbd1 = await prisma.team.findFirstOrThrow({ where: { name: "TBD 1" } });
  const tbd2 = await prisma.team.findFirstOrThrow({ where: { name: "TBD 2" } });

  const match = await prisma.match.create({
    data: {
      team1Id: tbd1.id,
      team2Id: tbd2.id,
      date: new Date("2026-06-28T12:00:00Z"),
      phase: "R32",
      winner: "UPCOMING",
      note: "Runner-up Group A vs Runner-up Group B",
    },
  });
  console.log("✓ Restored match:", match.note, "-", match.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
