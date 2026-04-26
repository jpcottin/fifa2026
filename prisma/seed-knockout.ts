import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Phase } from "../app/generated/prisma/enums";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const matches: { note: string; phase: Phase; date: string }[] = [
  // Round of 32
  { note: "Runner-up Group A vs Runner-up Group B", phase: Phase.R32, date: "2026-06-28" },
  { note: "Winner Group E vs 3rd Place Group A/B/C/D/F", phase: Phase.R32, date: "2026-06-29" },
  { note: "Winner Group F vs Runner-up Group C", phase: Phase.R32, date: "2026-06-29" },
  { note: "Winner Group C vs Runner-up Group F", phase: Phase.R32, date: "2026-06-29" },
  { note: "Winner Group I vs 3rd Place Group C/D/F/G/H", phase: Phase.R32, date: "2026-06-30" },
  { note: "Runner-up Group E vs Runner-up Group I", phase: Phase.R32, date: "2026-06-30" },
  { note: "Winner Group A vs 3rd Place Group C/E/F/H/I", phase: Phase.R32, date: "2026-06-30" },
  { note: "Winner Group L vs 3rd Place Group E/H/I/J/K", phase: Phase.R32, date: "2026-07-01" },
  { note: "Winner Group D vs 3rd Place Group B/E/F/I/J", phase: Phase.R32, date: "2026-07-01" },
  { note: "Winner Group G vs 3rd Place Group A/E/H/I/J", phase: Phase.R32, date: "2026-07-01" },
  { note: "Runner-up Group K vs Runner-up Group L", phase: Phase.R32, date: "2026-07-02" },
  { note: "Winner Group H vs Runner-up Group J", phase: Phase.R32, date: "2026-07-02" },
  { note: "Winner Group B vs 3rd Place Group E/F/G/I/J", phase: Phase.R32, date: "2026-07-02" },
  { note: "Winner Group J vs Runner-up Group H", phase: Phase.R32, date: "2026-07-03" },
  { note: "Winner Group K vs 3rd Place Group D/E/I/J/L", phase: Phase.R32, date: "2026-07-03" },
  { note: "Runner-up Group D vs Runner-up Group G", phase: Phase.R32, date: "2026-07-03" },
  // Round of 16
  { note: "Winner Match 74 vs Winner Match 77", phase: Phase.R16, date: "2026-07-04" },
  { note: "Winner Match 73 vs Winner Match 75", phase: Phase.R16, date: "2026-07-04" },
  { note: "Winner Match 76 vs Winner Match 78", phase: Phase.R16, date: "2026-07-05" },
  { note: "Winner Match 79 vs Winner Match 80", phase: Phase.R16, date: "2026-07-05" },
  { note: "Winner Match 83 vs Winner Match 84", phase: Phase.R16, date: "2026-07-06" },
  { note: "Winner Match 81 vs Winner Match 82", phase: Phase.R16, date: "2026-07-06" },
  { note: "Winner Match 86 vs Winner Match 88", phase: Phase.R16, date: "2026-07-07" },
  { note: "Winner Match 85 vs Winner Match 87", phase: Phase.R16, date: "2026-07-07" },
  // Quarter-finals
  { note: "Winner Match 89 vs Winner Match 90", phase: Phase.QF, date: "2026-07-09" },
  { note: "Winner Match 93 vs Winner Match 94", phase: Phase.QF, date: "2026-07-10" },
  { note: "Winner Match 91 vs Winner Match 92", phase: Phase.QF, date: "2026-07-11" },
  { note: "Winner Match 95 vs Winner Match 96", phase: Phase.QF, date: "2026-07-11" },
  // Semi-finals
  { note: "Winner Match 97 vs Winner Match 98", phase: Phase.SF, date: "2026-07-14" },
  { note: "Winner Match 99 vs Winner Match 100", phase: Phase.SF, date: "2026-07-15" },
  // Third place play-off
  { note: "Loser Match 101 vs Loser Match 102", phase: Phase.THIRD, date: "2026-07-18" },
  // Final
  { note: "Winner Match 101 vs Winner Match 102", phase: Phase.FINAL, date: "2026-07-19" },
];

async function main() {
  // Create TBD placeholder teams if they don't exist
  const tbd1 = await prisma.team.upsert({
    where: { name: "TBD 1" },
    update: {},
    create: { name: "TBD 1", flagEmoji: "❓", set: 0 },
  });
  const tbd2 = await prisma.team.upsert({
    where: { name: "TBD 2" },
    update: {},
    create: { name: "TBD 2", flagEmoji: "❓", set: 0 },
  });

  let created = 0;
  for (const m of matches) {
    await prisma.match.create({
      data: {
        team1Id: tbd1.id,
        team2Id: tbd2.id,
        date: new Date(`${m.date}T12:00:00Z`),
        phase: m.phase,
        winner: "UPCOMING",
        note: m.note,
      },
    });
    created++;
  }

  console.log(`✓ Created ${created} knockout matches`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
