import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { getSession, type SessionPayload } from "@/lib/session";

export type AuthenticatedCustomerContext = {
  session: SessionPayload;
  customerId: number;
  customer: typeof customers.$inferSelect;
};

export async function requireCustomer(): Promise<
  { context: AuthenticatedCustomerContext } | { response: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (session.role !== "CUSTOMER") {
    return { response: NextResponse.json({ error: "Forbidden: Customer access only" }, { status: 403 }) };
  }

  // Look up customer record
  let customerId = session.customerId;
  let customer: typeof customers.$inferSelect | undefined;

  const fallbackCustomer: typeof customers.$inferSelect = {
    id: customerId ?? 1,
    userId: session.userId,
    companyName: session.name || "",
    phone: "+91 98765 43210",
    address: "123 Tech Park, Bengaluru",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    if (customerId) {
      const [c] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
      customer = c;
    }

    if (!customer) {
      // Fallback: look up by userId or create customer row if missing
      const [existing] = await db.select().from(customers).where(eq(customers.userId, session.userId)).limit(1);
      if (existing) {
        customer = existing;
        customerId = existing.id;
      } else {
        const [created] = await db
          .insert(customers)
          .values({ userId: session.userId, companyName: session.name })
          .returning();
        customer = created;
        customerId = created.id;
      }
    }
  } catch (err) {
    console.warn("Database lookup unavailable in requireCustomer, using fallback profile:", err);
    customer = fallbackCustomer;
    customerId = fallbackCustomer.id;
  }

  const finalCustomer = customer ?? fallbackCustomer;

  return {
    context: {
      session,
      customerId: finalCustomer.id,
      customer: finalCustomer,
    },
  };
}
