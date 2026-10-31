import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotationTemplates, templateLines } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { createTemplateSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { resolveTemplateLineDefaults } from "@/lib/line-items";

export async function GET() {
  const auth = await requireApiRole("ADMIN", "STAFF");
  if ("response" in auth) return auth.response;

  const templates = await db.select().from(quotationTemplates).orderBy(quotationTemplates.createdAt);
  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { lines, ...templateData } = parsed.data;
  const resolved = await resolveTemplateLineDefaults(lines);
  if ("error" in resolved) return NextResponse.json({ error: resolved.error }, { status: 400 });

  const result = await db.transaction(async (tx) => {
    const [template] = await tx.insert(quotationTemplates).values({ ...templateData, createdBy: auth.session.userId }).returning();
    await tx.insert(templateLines).values(resolved.lines.map((l) => ({ ...l, templateId: template.id })));
    await logAudit(tx, { userId: auth.session.userId, action: "CREATED", entityType: "quotation_template", entityId: template.id, newValues: { name: template.name } });
    return template;
  });

  return NextResponse.json({ template: result }, { status: 201 });
}
