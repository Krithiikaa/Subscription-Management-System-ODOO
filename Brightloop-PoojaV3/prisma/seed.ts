/**
 * Prisma seed script — Phase 0 minimal version.
 * Creates Counter records needed by the billing engine and sequential numbering.
 * Full seed data added in Phase 9.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database (Phase 0 - minimal)...");

  // Create counter records for sequential numbering
  await prisma.counter.upsert({
    where: { id: "subscription" },
    update: {},
    create: { id: "subscription", current: 0 },
  });

  await prisma.counter.upsert({
    where: { id: "invoice" },
    update: {},
    create: { id: "invoice", current: 0 },
  });

  console.log("✅ Seed complete.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

