import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { updateStaffSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const staffId = Number(id);
  if (!Number.isInteger(staffId)) {
    return NextResponse.json({ error: "Invalid staff id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateStaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [updated] = await db
    .update(users)
    .set({ active: parsed.data.active, updatedAt: new Date() })
    .where(and(eq(users.id, staffId), eq(users.role, "STAFF")))
    .returning({ id: users.id, name: users.name, email: users.email, active: users.active });

  if (!updated) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }

  return NextResponse.json({ staff: updated });
}
