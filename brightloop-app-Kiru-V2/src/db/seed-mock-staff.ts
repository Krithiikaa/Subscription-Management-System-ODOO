import bcrypt from "bcryptjs";
import { and, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { products, staffProductAssignments, users } from "./schema";

// Demo-only mock staff accounts, 2 assigned per seeded product. They share one
// password, read from DEMO_ACCOUNT_PASSWORD (set it in .env.local — never
// commit it).
const MOCK_PASSWORD = process.env.DEMO_ACCOUNT_PASSWORD;

const STAFF_PER_PRODUCT: Record<string, [string, string]> = {
  BrightMail: ["Arjun Mehta", "Priya Nair"],
  BrightAnalytics: ["Rohan Kapoor", "Sneha Iyer"],
  BrightSupport: ["Vikram Rao", "Ananya Pillai"],
  BrightCloud: ["Karthik Subramanian", "Divya Menon"],
  BrightSecure: ["Aditya Bhat", "Meera Krishnan"],
  BrightAPI: ["Nikhil Varma", "Pooja Reddy"],
  BrightBackup: ["Siddharth Joshi", "Kavya Pillai"],
  BrightMeet: ["Rahul Desai", "Shreya Gupta"],
  BrightDocs: ["Varun Chandran", "Lakshmi Iyer"],
  BrightAI: ["Aryan Malhotra", "Ishita Sharma"],
};

function emailFor(name: string): string {
  return `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@brightloopoddohack.demo`;
}

async function getOrCreateStaff(name: string, passwordHash: string) {
  const email = emailFor(name);
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(sql`lower(${users.email})`, email))
    .limit(1);
  if (existing) {
    console.log(`- Staff: ${name} already exists, skipped.`);
    return existing.id;
  }
  const [created] = await db.insert(users).values({ name, email, passwordHash, role: "STAFF" }).returning({ id: users.id });
  console.log(`- Staff: created ${name} (${email})`);
  return created.id;
}

async function assign(staffId: number, productId: number, productName: string, staffName: string, assignedBy: number) {
  const [existing] = await db
    .select({ id: staffProductAssignments.id })
    .from(staffProductAssignments)
    .where(and(eq(staffProductAssignments.staffId, staffId), eq(staffProductAssignments.productId, productId)))
    .limit(1);
  if (existing) {
    console.log(`  - Assignment: ${staffName} -> ${productName} already exists, skipped.`);
    return;
  }
  await db.insert(staffProductAssignments).values({ staffId, productId, assignedBy });
  console.log(`  - Assignment: created ${staffName} -> ${productName}`);
}

async function seed() {
  console.log("Seeding mock staff and staff-product assignments…\n");

  const [admin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "ADMIN")).limit(1);
  if (!admin) {
    throw new Error("No ADMIN user found — run `npm run db:seed` first.");
  }

  if (!MOCK_PASSWORD) {
    throw new Error("DEMO_ACCOUNT_PASSWORD is not set — add it to .env.local.");
  }
  const passwordHash = await bcrypt.hash(MOCK_PASSWORD, 12);

  for (const [productName, [staffA, staffB]] of Object.entries(STAFF_PER_PRODUCT)) {
    const [product] = await db.select({ id: products.id }).from(products).where(eq(products.name, productName)).limit(1);
    if (!product) {
      console.log(`- Product ${productName} not found, skipping its staff. Run \`npm run db:seed:catalogue\` first.`);
      continue;
    }

    const staffAId = await getOrCreateStaff(staffA, passwordHash);
    const staffBId = await getOrCreateStaff(staffB, passwordHash);
    await assign(staffAId, product.id, productName, staffA, admin.id);
    await assign(staffBId, product.id, productName, staffB, admin.id);
  }

  console.log("\nMock staff seed complete. All accounts use the DEMO_ACCOUNT_PASSWORD from .env.local.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Mock staff seed failed:", err);
  process.exit(1);
});
