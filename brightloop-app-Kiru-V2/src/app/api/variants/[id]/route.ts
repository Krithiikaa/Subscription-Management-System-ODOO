import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { productVariants } from "@/db/schema";
import { requireApiRole } from "@/lib/api-auth";
import { updateVariantSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiRole("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const variantId = Number(id);
  if (!Number.isInteger(variantId)) {
    return NextResponse.json({ error: "Invalid variant id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateVariantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [existingVariant] = await db.select().from(productVariants).where(eq(productVariants.id, variantId)).limit(1);
  if (!existingVariant) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 });
  }

  if (parsed.data.code) {
    const [duplicate] = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(
        and(
          eq(productVariants.productId, existingVariant.productId),
          eq(productVariants.code, parsed.data.code),
          ne(productVariants.id, variantId)
        )
      )
      .limit(1);
    if (duplicate) {
      return NextResponse.json({ error: "A variant with this code already exists for this product" }, { status: 409 });
    }
  }

  const [updated] = await db.update(productVariants).set(parsed.data).where(eq(productVariants.id, variantId)).returning();

  return NextResponse.json({ variant: updated });
}
