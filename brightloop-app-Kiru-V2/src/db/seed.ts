import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "./index";
import { users, customers } from "./schema";

type SeedUser = {
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  name: string;
  emailEnv: string;
  defaultEmail: string;
  passwordEnv: string;
};

const SEED_USERS: SeedUser[] = [
  { role: "ADMIN", name: "Admin", emailEnv: "ADMIN_EMAIL", defaultEmail: "admin.brightloopoddohack@gmail.com", passwordEnv: "ADMIN_PASSWORD" },
  { role: "STAFF", name: "Staff", emailEnv: "STAFF_EMAIL", defaultEmail: "staff.brightloopoddohack@gmail.com", passwordEnv: "STAFF_PASSWORD" },
  { role: "CUSTOMER", name: "Demo Customer", emailEnv: "CUSTOMER_EMAIL", defaultEmail: "customer.brightloopoddohack@gmail.com", passwordEnv: "CUSTOMER_PASSWORD" },
];

function randomPassword(): string {
  // 16 random bytes -> base64, trimmed to length, with guaranteed character classes appended.
  return `${randomBytes(9).toString("base64").replace(/[^A-Za-z0-9]/g, "a")}Aa1!`;
}

async function seed() {
  console.log("Seeding demo accounts…\n");

  for (const config of SEED_USERS) {
    const email = (process.env[config.emailEnv] ?? config.defaultEmail).toLowerCase();
    const providedPassword = process.env[config.passwordEnv];
    const password = providedPassword ?? randomPassword();

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(sql`lower(${users.email})`, email))
      .limit(1);

    if (existing) {
      console.log(`- ${config.role}: ${email} already exists, skipped.`);
      continue;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(users)
      .values({ name: config.name, email, passwordHash, role: config.role })
      .returning({ id: users.id });

    if (config.role === "CUSTOMER") {
      await db.insert(customers).values({ userId: user.id });
    }

    console.log(`- ${config.role}: created ${email}`);
    if (!providedPassword) {
      console.log(`  Generated password (save this now, it won't be shown again): ${password}`);
    }
  }

  console.log("\nSeed complete. Set ADMIN_PASSWORD / STAFF_PASSWORD / CUSTOMER_PASSWORD env vars before running to choose your own passwords.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
