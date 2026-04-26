import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const ssl = process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL!, ssl }) });

const email = process.argv[2];
if (!email) { console.error("Usage: tsx prisma/make-admin.ts <email>"); process.exit(1); }

async function main() {
  const user = await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
  console.log(`✓ ${user.email} is now ADMIN`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
