import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { updatePlanSchema } from "@/lib/validation";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const planId = Number(id);
  if (!Number.isInteger(planId)) {
    return NextResponse.json({ error: "Invalid plan id" }, { status: 400 });
  }

  const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }
  return NextResponse.json({ plan });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const planId = Number(id);
  if (!Number.isInteger(planId)) {
    return NextResponse.json({ error: "Invalid plan id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updatePlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [updated] = await db
    .update(plans)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(plans.id, planId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  return NextResponse.json({ plan: updated });
}
