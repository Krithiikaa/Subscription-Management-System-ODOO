import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { discounts } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { updateDiscountSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const discountId = Number(id);
  if (!Number.isInteger(discountId)) {
    return NextResponse.json({ error: "Invalid discount id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateDiscountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  if (parsed.data.code) {
    const [duplicate] = await db
      .select({ id: discounts.id })
      .from(discounts)
      .where(and(eq(discounts.code, parsed.data.code), ne(discounts.id, discountId)))
      .limit(1);
    if (duplicate) {
      return NextResponse.json({ error: "A discount with this code already exists" }, { status: 409 });
    }
  }

  const [updated] = await db
    .update(discounts)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(discounts.id, discountId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Discount not found" }, { status: 404 });
  }

  return NextResponse.json({ discount: updated });
}
