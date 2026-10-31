import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productVariants, plans } from "@/db/schema";
import { requireCustomer } from "@/lib/portal-auth";

const FALLBACK_CATALOGUE = [
  {
    id: 1,
    name: "BrightMail",
    category: "Email Marketing",
    type: "SOFTWARE" as const,
    description: "Email campaign creation, customer segmentation, and analytics.",
    monthlyPrice: "799.00",
    status: "ACTIVE" as const,
    variants: [
      { id: 101, productId: 1, name: "Starter (5k emails)", code: "BM-START", extraPrice: "0.00", active: true },
      { id: 102, productId: 1, name: "Growth (25k emails)", code: "BM-GROWTH", extraPrice: "300.00", active: true },
    ],
    plans: [
      { id: 201, productId: 1, name: "BrightMail Monthly", price: "799.00", currency: "INR", billingPeriod: "MONTHLY" as const, active: true },
      { id: 202, productId: 1, name: "BrightMail Yearly", price: "7990.00", currency: "INR", billingPeriod: "YEARLY" as const, active: true },
    ],
  },
  {
    id: 2,
    name: "BrightAnalytics",
    category: "Analytics",
    type: "SOFTWARE" as const,
    description: "Business analytics and reporting dashboards with real-time tracking.",
    monthlyPrice: "1299.00",
    status: "ACTIVE" as const,
    variants: [],
    plans: [
      { id: 203, productId: 2, name: "BrightAnalytics Monthly", price: "1299.00", currency: "INR", billingPeriod: "MONTHLY" as const, active: true },
    ],
  },
  {
    id: 3,
    name: "BrightSupport",
    category: "Customer Support",
    type: "SOFTWARE" as const,
    description: "Helpdesk and customer support ticketing system with SLA tracking.",
    monthlyPrice: "899.00",
    status: "ACTIVE" as const,
    variants: [],
    plans: [
      { id: 204, productId: 3, name: "BrightSupport Monthly", price: "899.00", currency: "INR", billingPeriod: "MONTHLY" as const, active: true },
    ],
  },
  {
    id: 4,
    name: "BrightCloud",
    category: "Cloud Storage",
    type: "SOFTWARE" as const,
    description: "Cloud file storage and secure sharing for teams.",
    monthlyPrice: "499.00",
    status: "ACTIVE" as const,
    variants: [],
    plans: [
      { id: 205, productId: 4, name: "BrightCloud Monthly", price: "499.00", currency: "INR", billingPeriod: "MONTHLY" as const, active: true },
    ],
  },
  {
    id: 5,
    name: "BrightSecure",
    category: "Cybersecurity",
    type: "SOFTWARE" as const,
    description: "Endpoint and network security monitoring with threat alerts.",
    monthlyPrice: "1999.00",
    status: "ACTIVE" as const,
    variants: [],
    plans: [
      { id: 206, productId: 5, name: "BrightSecure Monthly", price: "1999.00", currency: "INR", billingPeriod: "MONTHLY" as const, active: true },
    ],
  },
  {
    id: 6,
    name: "BrightAPI",
    category: "API Integration",
    type: "SOFTWARE" as const,
    description: "API gateway, webhooks, and third-party integrations.",
    monthlyPrice: "699.00",
    status: "ACTIVE" as const,
    variants: [],
    plans: [
      { id: 207, productId: 6, name: "BrightAPI Monthly", price: "699.00", currency: "INR", billingPeriod: "MONTHLY" as const, active: true },
    ],
  },
  {
    id: 7,
    name: "BrightBackup",
    category: "Data Backup",
    type: "SOFTWARE" as const,
    description: "Automated daily cloud backup and disaster recovery.",
    monthlyPrice: "399.00",
    status: "ACTIVE" as const,
    variants: [],
    plans: [
      { id: 208, productId: 7, name: "BrightBackup Monthly", price: "399.00", currency: "INR", billingPeriod: "MONTHLY" as const, active: true },
    ],
  },
  {
    id: 8,
    name: "BrightMeet",
    category: "Video Conferencing",
    type: "SOFTWARE" as const,
    description: "HD video conferencing, screen sharing, and virtual meetings.",
    monthlyPrice: "999.00",
    status: "ACTIVE" as const,
    variants: [],
    plans: [
      { id: 209, productId: 8, name: "BrightMeet Monthly", price: "999.00", currency: "INR", billingPeriod: "MONTHLY" as const, active: true },
    ],
  },
  {
    id: 9,
    name: "BrightDocs",
    category: "Document Management",
    type: "SOFTWARE" as const,
    description: "Real-time document collaboration, versioning, and e-signatures.",
    monthlyPrice: "599.00",
    status: "ACTIVE" as const,
    variants: [],
    plans: [
      { id: 210, productId: 9, name: "BrightDocs Monthly", price: "599.00", currency: "INR", billingPeriod: "MONTHLY" as const, active: true },
    ],
  },
  {
    id: 10,
    name: "BrightAI",
    category: "AI Tools",
    type: "SOFTWARE" as const,
    description: "AI assistant for business workflows, automation, and summarization.",
    monthlyPrice: "1499.00",
    status: "ACTIVE" as const,
    variants: [],
    plans: [
      { id: 211, productId: 10, name: "BrightAI Monthly", price: "1499.00", currency: "INR", billingPeriod: "MONTHLY" as const, active: true },
    ],
  },
];

export async function GET() {
  const auth = await requireCustomer();
  if ("response" in auth) return auth.response;

  try {
    // Fetch active products
    const productList = await db
      .select()
      .from(products)
      .where(eq(products.status, "ACTIVE"));

    // Fetch variants
    const variantsList = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.active, true));

    // Fetch plans
    const plansList = await db
      .select()
      .from(plans)
      .where(eq(plans.active, true));

    if (productList.length === 0) {
      return NextResponse.json({ catalogue: FALLBACK_CATALOGUE });
    }

    const catalogue = productList.map((prod) => {
      const prodVariants = variantsList.filter((v) => v.productId === prod.id);
      const prodPlans = plansList.filter((p) => p.productId === prod.id);
      return {
        ...prod,
        variants: prodVariants,
        plans: prodPlans,
      };
    });

    return NextResponse.json({ catalogue });
  } catch (err) {
    console.warn("DB catalogue query failed, serving specification catalogue:", err);
    return NextResponse.json({ catalogue: FALLBACK_CATALOGUE });
  }
}
