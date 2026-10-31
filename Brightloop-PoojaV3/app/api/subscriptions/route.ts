import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { getNextSequenceNumber } from "@/lib/counters";
import { computeUnitPrice, isPlanAvailable } from "@/lib/catalog";
import { formatZodError } from "@/lib/validation";

export const runtime = "nodejs";

const lineItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1).default(1),
  taxRate: z.number().min(0).default(0),
});

const createSubscriptionSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  planId: z.string().min(1, "Plan is required"),
  templateId: z.string().optional().nullable(),
  startDate: z.string().min(1, "Start date is required"),
  expiryDate: z.string().optional().nullable(),
  paymentTerms: z.number().int().min(0).default(30),
  notes: z.string().optional(),
  status: z.enum(["DRAFT", "QUOTATION"]).default("DRAFT"),
  lines: z.array(lineItemSchema).min(1, "At least one product line is required"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // If Customer role: restrict strictly to own customer record (Section 4 Spec)
    const whereClause: any = {};
    if (user.role === "CUSTOMER") {
      if (!user.customerId) {
        return NextResponse.json({ subscriptions: [] });
      }
      whereClause.customerId = user.customerId;
    }

    const subscriptions = await prisma.subscription.findMany({
      where: whereClause,
      include: {
        customer: { include: { user: true } },
        plan: true,
        lines: { include: { product: true, variant: true } },
        statusLogs: {
          include: { changedBy: { select: { name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = subscriptions.map((s) => ({
      id: s.id,
      number: s.number,
      status: s.status,
      startDate: s.startDate,
      expiryDate: s.expiryDate,
      nextInvoiceDate: s.nextInvoiceDate,
      paymentTerms: s.paymentTerms,
      notes: s.notes,
      customer: {
        id: s.customer.id,
        name: s.customer.user.name,
        companyName: s.customer.companyName,
        email: s.customer.user.email,
      },
      plan: {
        id: s.plan.id,
        name: s.plan.name,
        billingPeriod: s.plan.billingPeriod,
        pausable: s.plan.pausable,
        closable: s.plan.closable,
        renewable: s.plan.renewable,
      },
      lines: s.lines.map((l) => ({
        id: l.id,
        productId: l.productId,
        productName: l.product.name,
        variantId: l.variantId,
        variantName: l.variant ? `${l.variant.attribute}: ${l.variant.value}` : null,
        quantity: l.quantity,
        unitPrice: l.unitPrice.toNumber(),
        taxRate: l.taxRate.toNumber(),
        amount: l.amount.toNumber(),
      })),
      totalAmount: s.lines.reduce((sum, l) => sum + l.amount.toNumber(), 0),
    }));

    return NextResponse.json({ subscriptions: formatted });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req, ["ADMIN", "STAFF"]);

    const body = await req.json();
    const parsed = createSubscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const {
      customerId,
      planId,
      templateId,
      startDate,
      expiryDate,
      paymentTerms,
      notes,
      status,
      lines,
    } = parsed.data;

    // Validate plan
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Selected plan does not exist" }, { status: 400 });
    }

    const totalQuantity = lines.reduce((acc, l) => acc + l.quantity, 0);
    const availabilityCheck = isPlanAvailable(plan, totalQuantity, new Date(startDate));
    if (!availabilityCheck.valid) {
      return NextResponse.json({ error: availabilityCheck.reason }, { status: 400 });
    }

    // Generate safe sequential number (SUB-00001)
    const number = await getNextSequenceNumber("SUB", "subscription");

    // Fetch products & variants to compute snapshotted unit prices
    const productIds = lines.map((l) => l.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Build snapshotted lines
    const lineData = lines.map((line, index) => {
      const prod = productMap.get(line.productId);
      if (!prod) throw new Error(`Product ${line.productId} not found`);

      const variant = line.variantId
        ? prod.variants.find((v) => v.id === line.variantId)
        : null;

      const unitPrice = computeUnitPrice(
        prod.salesPrice,
        variant ? [variant.extraPrice] : []
      );
      const amount = Math.round(unitPrice * line.quantity * 100) / 100;

      return {
        productId: line.productId,
        variantId: line.variantId || null,
        quantity: line.quantity,
        unitPrice,
        taxRate: line.taxRate || 0,
        amount,
        sortOrder: index,
      };
    });

    const newSub = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
        data: {
          number,
          customerId,
          planId,
          templateId: templateId || null,
          startDate: new Date(startDate),
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          nextInvoiceDate: null, // set when becomes ACTIVE
          paymentTerms,
          notes,
          status,
          lines: {
            create: lineData,
          },
        },
        include: {
          lines: true,
          plan: true,
          customer: { include: { user: true } },
        },
      });

      // Log status creation
      await tx.subscriptionStatusLog.create({
        data: {
          subscriptionId: sub.id,
          fromStatus: null,
          toStatus: status,
          changedById: user.userId,
          note: "Initial subscription created",
        },
      });

      return sub;
    });

    return NextResponse.json({ subscription: newSub }, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}

