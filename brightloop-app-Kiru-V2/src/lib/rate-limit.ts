import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { loginAttempts } from "@/db/schema";

const WINDOW_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 5;

export async function isLoginRateLimited(email: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(loginAttempts)
    .where(
      and(
        eq(sql`lower(${loginAttempts.email})`, email.toLowerCase()),
        eq(loginAttempts.success, false),
        gte(loginAttempts.createdAt, windowStart)
      )
    );

  return Number(count) >= MAX_FAILED_ATTEMPTS;
}

export async function recordLoginAttempt(email: string, success: boolean, ip?: string): Promise<void> {
  await db.insert(loginAttempts).values({ email: email.toLowerCase(), success, ip: ip ?? null });
}
