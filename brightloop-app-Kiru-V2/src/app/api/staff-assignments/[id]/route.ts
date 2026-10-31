import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staffProductAssignments } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const assignmentId = Number(id);
  if (!Number.isInteger(assignmentId)) {
    return NextResponse.json({ error: "Invalid assignment id" }, { status: 400 });
  }

  const [deleted] = await db.delete(staffProductAssignments).where(eq(staffProductAssignments.id, assignmentId)).returning({ id: staffProductAssignments.id });

  if (!deleted) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
