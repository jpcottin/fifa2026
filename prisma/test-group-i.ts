/**
 * Dev-only script: seed Group I matches with France winning all three,
 * then run autoAdvanceKnockout so France appears as I1 in the bracket.
 * Run with: npx tsx prisma/test-group-i.ts
 * Undo with: npx tsx prisma/test-group-i.ts --clean
 */
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { autoAdvanceKnockout } from "../lib/auto-advance";

const ssl = process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL!, ssl }) });

const GROUP_I_MATCHES: [string, string][] = [
  ["France",  "Senegal"],
  ["Iraq",    "Norway"],
  ["Norway",  "Senegal"],
  ["France",  "Iraq"],
  ["Senegal", "Iraq"],
  ["Norway",  "France"],
];

async function main() {
  const clean = process.argv.includes("--clean");

  if (clean) {
    const teams = await prisma.team.findMany({ where: { name: { in: ["France", "Senegal", "Norway", "Iraq"] } } });
    const ids = new Set(teams.map(t => t.id));
    const deleted = await prisma.match.deleteMany({
      where: { phase: "GROUP", team1: { name: { in: ["France","Senegal","Norway","Iraq"] } } },
    });
    console.log(`✓ Deleted ${deleted.count} Group I matches`);
    await autoAdvanceKnockout();
    console.log("✓ Auto-advance re-run (France slot cleared)");
    return;
  }

  const teams = await prisma.team.findMany({
    where: { name: { in: ["France", "Senegal", "Norway", "Iraq"] } },
  });
  const byName = new Map(teams.map(t => [t.name, t]));

  // France wins all 3; Norway 2nd (beats Senegal/Iraq); Senegal 3rd
  const results: { t1: string; t2: string; winner: "TEAM1" | "TEAM2"; t1g: number; t2g: number }[] = [
    { t1: "France",  t2: "Senegal", winner: "TEAM1", t1g: 2, t2g: 0 },
    { t1: "Iraq",    t2: "Norway",  winner: "TEAM2", t1g: 0, t2g: 1 },
    { t1: "Norway",  t2: "Senegal", winner: "TEAM1", t1g: 2, t2g: 1 },
    { t1: "France",  t2: "Iraq",    winner: "TEAM1", t1g: 3, t2g: 0 },
    { t1: "Senegal", t2: "Iraq",    winner: "TEAM1", t1g: 1, t2g: 0 },
    { t1: "Norway",  t2: "France",  winner: "TEAM2", t1g: 0, t2g: 1 },
  ];

  // Guard: don't seed if Group I matches already exist
  const existing = await prisma.match.count({
    where: { phase: "GROUP", team1: { name: "France" } },
  });
  if (existing > 0) {
    console.log(`Group I matches already exist (${existing} found) — skipping creation`);
  } else {
    let created = 0;
    for (const r of results) {
      const t1 = byName.get(r.t1);
      const t2 = byName.get(r.t2);
      if (!t1 || !t2) { console.warn(`Team not found: ${r.t1} or ${r.t2}`); continue; }
      await prisma.match.create({
        data: {
          team1Id: t1.id, team2Id: t2.id,
          phase: "GROUP", winner: r.winner,
          team1Goals: r.t1g, team2Goals: r.t2g,
          date: new Date("2026-06-16T12:00:00Z"),
        },
      });
      created++;
    }
    console.log(`✓ Created ${created} Group I matches (France wins group)`);
  }

  await autoAdvanceKnockout();
  console.log("✓ Auto-advance run — check /wc-results for France as I1");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
