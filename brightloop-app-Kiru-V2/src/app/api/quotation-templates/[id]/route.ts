import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { quotationTemplates, templateLines } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { updateTemplateSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { resolveTemplateLineDefaults, type TemplateLineDefault } from "@/lib/line-items";

async function loadTemplate(id: number) {
  const [template] = await db.select().from(quotationTemplates).where(eq(quotationTemplates.id, id)).limit(1);
  if (!template) return null;
  const lines = await db.select().from(templateLines).where(eq(templateLines.templateId, id));
  return { template, lines };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const templateId = Number(id);
  if (!Number.isInteger(templateId)) return NextResponse.json({ error: "Invalid template id" }, { status: 400 });

  const detail = await loadTemplate(templateId);
  if (!detail) return NextResponse.json({ error: "Template not found" }, { status: 404 });
  return NextResponse.json(detail);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const templateId = Number(id);
  if (!Number.isInteger(templateId)) return NextResponse.json({ error: "Invalid template id" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const parsed = updateTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { lines, ...templateData } = parsed.data;
  let resolvedLines: TemplateLineDefault[] | undefined;
  if (lines) {
    const resolved = await resolveTemplateLineDefaults(lines);
    if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: 400 });
    resolvedLines = resolved.lines;
  }

  const updated = await db.transaction(async (tx) => {
    const [existing] = await tx.select({ id: quotationTemplates.id }).from(quotationTemplates).where(eq(quotationTemplates.id, templateId)).limit(1);
    if (!existing) return null;

    const [template] = await tx
      .update(quotationTemplates)
      .set({ ...templateData, updatedAt: new Date() })
      .where(eq(quotationTemplates.id, templateId))
      .returning();

    // Changing a template must never retroactively modify quotations already
    // created from it — those hold their own line snapshots independently.
    if (resolvedLines) {
      await tx.delete(templateLines).where(eq(templateLines.templateId, templateId));
      await tx.insert(templateLines).values(resolvedLines.map((l) => ({ ...l, templateId })));
    }

    await logAudit(tx, { userId: auth.session.userId, action: "UPDATED", entityType: "quotation_template", entityId: templateId, newValues: templateData });
    return template;
  });

  if (!updated) return NextResponse.json({ error: "Template not found" }, { status: 404 });
  return NextResponse.json({ template: updated });
}
