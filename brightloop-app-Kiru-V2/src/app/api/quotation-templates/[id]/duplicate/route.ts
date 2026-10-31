import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { quotationTemplates, templateLines } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const templateId = Number(id);
  if (!Number.isInteger(templateId)) return NextResponse.json({ error: "Invalid template id" }, { status: 400 });

  const result = await db.transaction(async (tx) => {
    const [source] = await tx.select().from(quotationTemplates).where(eq(quotationTemplates.id, templateId)).limit(1);
    if (!source) return null;
    const sourceLines = await tx.select().from(templateLines).where(eq(templateLines.templateId, templateId));

    const [copy] = await tx
      .insert(quotationTemplates)
      .values({
        name: `${source.name} (Copy)`,
        description: source.description,
        validityDays: source.validityDays,
        defaultPaymentTerms: source.defaultPaymentTerms,
        notes: source.notes,
        createdBy: auth.session.userId,
        active: true,
      })
      .returning();

    if (sourceLines.length > 0) {
      await tx.insert(templateLines).values(
        sourceLines.map((l) => ({
          templateId: copy.id,
          productId: l.productId,
          variantId: l.variantId,
          planId: l.planId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          description: l.description,
        }))
      );
    }

    await logAudit(tx, { userId: auth.session.userId, action: "CREATED", entityType: "quotation_template", entityId: copy.id, newValues: { name: copy.name, duplicatedFrom: templateId } });
    return copy;
  });

  if (!result) return NextResponse.json({ error: "Template not found" }, { status: 404 });
  return NextResponse.json({ template: result }, { status: 201 });
}
