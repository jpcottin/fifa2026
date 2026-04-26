import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Normalize names that differ between the schedule and our DB
function normalizeName(name: string): string {
  const map: Record<string, string> = {
    "IR Iran": "Iran",
    "Cabo Verde": "Cape Verde",
    "USA": "United States",
  };
  return map[name] ?? name;
}

const matches: [string, string, string][] = [
  ["Mexico", "South Africa", "2026-06-11"],
  ["South Korea", "Czechia", "2026-06-11"],
  ["Canada", "Bosnia and Herzegovina", "2026-06-12"],
  ["USA", "Paraguay", "2026-06-12"],
  ["Haiti", "Scotland", "2026-06-13"],
  ["Australia", "Türkiye", "2026-06-13"],
  ["Brazil", "Morocco", "2026-06-13"],
  ["Qatar", "Switzerland", "2026-06-13"],
  ["Ivory Coast", "Ecuador", "2026-06-14"],
  ["Germany", "Curaçao", "2026-06-14"],
  ["Netherlands", "Japan", "2026-06-14"],
  ["Sweden", "Tunisia", "2026-06-14"],
  ["Saudi Arabia", "Uruguay", "2026-06-15"],
  ["Spain", "Cabo Verde", "2026-06-15"],
  ["IR Iran", "New Zealand", "2026-06-15"],
  ["Belgium", "Egypt", "2026-06-15"],
  ["France", "Senegal", "2026-06-16"],
  ["Iraq", "Norway", "2026-06-16"],
  ["Argentina", "Algeria", "2026-06-16"],
  ["Austria", "Jordan", "2026-06-16"],
  ["Ghana", "Panama", "2026-06-17"],
  ["England", "Croatia", "2026-06-17"],
  ["Portugal", "Congo DR", "2026-06-17"],
  ["Uzbekistan", "Colombia", "2026-06-17"],
  ["Czechia", "South Africa", "2026-06-18"],
  ["Switzerland", "Bosnia and Herzegovina", "2026-06-18"],
  ["Canada", "Qatar", "2026-06-18"],
  ["Mexico", "South Korea", "2026-06-18"],
  ["Brazil", "Haiti", "2026-06-19"],
  ["Scotland", "Morocco", "2026-06-19"],
  ["Türkiye", "Paraguay", "2026-06-19"],
  ["USA", "Australia", "2026-06-19"],
  ["Germany", "Ivory Coast", "2026-06-20"],
  ["Ecuador", "Curaçao", "2026-06-20"],
  ["Netherlands", "Sweden", "2026-06-20"],
  ["Tunisia", "Japan", "2026-06-20"],
  ["Uruguay", "Cabo Verde", "2026-06-21"],
  ["Spain", "Saudi Arabia", "2026-06-21"],
  ["Belgium", "IR Iran", "2026-06-21"],
  ["New Zealand", "Egypt", "2026-06-21"],
  ["Norway", "Senegal", "2026-06-22"],
  ["France", "Iraq", "2026-06-22"],
  ["Argentina", "Austria", "2026-06-22"],
  ["Jordan", "Algeria", "2026-06-22"],
  ["England", "Ghana", "2026-06-23"],
  ["Panama", "Croatia", "2026-06-23"],
  ["Portugal", "Uzbekistan", "2026-06-23"],
  ["Colombia", "Congo DR", "2026-06-23"],
  ["Scotland", "Brazil", "2026-06-24"],
  ["Morocco", "Haiti", "2026-06-24"],
  ["Switzerland", "Canada", "2026-06-24"],
  ["Bosnia and Herzegovina", "Qatar", "2026-06-24"],
  ["Czechia", "Mexico", "2026-06-24"],
  ["South Africa", "South Korea", "2026-06-24"],
  ["Curaçao", "Ivory Coast", "2026-06-25"],
  ["Ecuador", "Germany", "2026-06-25"],
  ["Japan", "Sweden", "2026-06-25"],
  ["Tunisia", "Netherlands", "2026-06-25"],
  ["Türkiye", "USA", "2026-06-25"],
  ["Paraguay", "Australia", "2026-06-25"],
  ["Cabo Verde", "Spain", "2026-06-26"],
  ["Uruguay", "Saudi Arabia", "2026-06-26"],
  ["IR Iran", "Egypt", "2026-06-26"],
  ["New Zealand", "Belgium", "2026-06-26"],
  ["Senegal", "Iraq", "2026-06-26"],
  ["Norway", "France", "2026-06-26"],
  ["Algeria", "Austria", "2026-06-27"],
  ["Jordan", "Argentina", "2026-06-27"],
  ["Congo DR", "Uzbekistan", "2026-06-27"],
  ["Colombia", "Portugal", "2026-06-27"],
  ["Croatia", "Ghana", "2026-06-27"],
  ["Panama", "England", "2026-06-27"],
];

async function main() {
  const teams = await prisma.team.findMany();
  const teamMap = new Map(teams.map((t) => [t.name, t.id]));

  // Also index by normalized name
  const normalizedMap = new Map(teams.map((t) => [t.name, t.id]));

  let created = 0;
  let skipped = 0;

  for (const [t1Raw, t2Raw, dateStr] of matches) {
    const t1Name = normalizeName(t1Raw);
    const t2Name = normalizeName(t2Raw);

    const team1Id = normalizedMap.get(t1Name);
    const team2Id = normalizedMap.get(t2Name);

    if (!team1Id) { console.warn(`⚠ Team not found: "${t1Name}" (from "${t1Raw}")`); skipped++; continue; }
    if (!team2Id) { console.warn(`⚠ Team not found: "${t2Name}" (from "${t2Raw}")`); skipped++; continue; }

    await prisma.match.create({
      data: {
        team1Id,
        team2Id,
        date: new Date(`${dateStr}T12:00:00Z`),
        phase: "GROUP",
        winner: "UPCOMING",
        team1Goals: 0,
        team2Goals: 0,
      },
    });
    created++;
  }

  console.log(`✓ Created ${created} matches, skipped ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
