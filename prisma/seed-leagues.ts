import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { normalizeSlug } from "../lib/leagues";

const ssl = process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false;
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!, ssl });
const prisma = new PrismaClient({ adapter });

const SAMPLE_LEAGUES = [
  { name: "OTV", slug: "otv" },
  { name: "LetsPlay", slug: "letsplay" },
];

async function main() {
  for (const league of SAMPLE_LEAGUES) {
    const slug = league.slug ?? normalizeSlug(league.name);
    await prisma.league.upsert({
      where: { slug },
      update: { name: league.name },
      create: { name: league.name, slug },
    });
    console.log(`League "${league.name}" (/${slug}) ready.`);
  }
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
