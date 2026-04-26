import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ALL_TEAMS } from "../lib/groups";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding teams…");
  for (const team of ALL_TEAMS) {
    await prisma.team.upsert({
      where: { name: team.name },
      update: { set: team.set, flagEmoji: team.flagEmoji },
      create: { name: team.name, set: team.set, flagEmoji: team.flagEmoji },
    });
  }

  console.log("Seeding game state…");
  await prisma.gameState.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
