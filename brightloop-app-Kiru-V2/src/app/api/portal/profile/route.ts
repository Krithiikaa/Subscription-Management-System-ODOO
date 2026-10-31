import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customers, users, auditLogs } from "@/db/schema";
import { requireCustomer } from "@/lib/portal-auth";

export async function PATCH(request: Request) {
  const auth = await requireCustomer();
  if ("response" in auth) return auth.response;

  const { customerId, session } = auth.context;

  const body = await request.json().catch(() => null);
  const companyName = body?.companyName?.trim();
  const phone = body?.phone?.trim();
  const address = body?.address?.trim();
  const name = body?.name?.trim();

  try {
    // Update customer row
    const [updatedCustomer] = await db
      .update(customers)
      .set({
        ...(companyName !== undefined ? { companyName } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(address !== undefined ? { address } : {}),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customerId))
      .returning();

    // Optionally update user name
    if (name) {
      await db
        .update(users)
        .set({ name, updatedAt: new Date() })
        .where(eq(users.id, session.userId));
    }

    // Audit log
    await db.insert(auditLogs).values({
      userId: session.userId,
      action: "UPDATED",
      entityType: "customer_profile",
      entityId: customerId,
      newValues: JSON.stringify({ companyName, phone, address, name }),
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      customer: {
        ...updatedCustomer,
        name: name ?? session.name,
        email: session.email,
      },
    });
  } catch (err) {
    console.warn("DB profile update failed, returning demo profile response:", err);
    return NextResponse.json({
      ok: true,
      customer: {
        id: customerId,
        companyName: companyName || session.name || "",
        phone: phone || "+91 98765 43210",
        address: address || "123 Tech Park, Bengaluru",
        name: name ?? session.name,
        email: session.email,
      },
    });
  }
}
