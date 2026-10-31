import { eq } from "drizzle-orm";
import { db } from "./index";
import { discounts, plans, productCategories, productVariants, products, taxRules } from "./schema";

const SEED_CATEGORIES = [
  "Business Management",
  "Email Marketing",
  "Analytics",
  "Customer Support",
  "Cloud Storage",
  "Cybersecurity",
  "API Integration",
  "Data Backup",
  "Video Conferencing",
  "Document Management",
  "AI Tools",
];

async function seedCategories() {
  const existing = await db.select({ name: productCategories.name }).from(productCategories);
  const existingNames = new Set(existing.map((c) => c.name));
  for (const name of SEED_CATEGORIES) {
    if (existingNames.has(name)) {
      console.log(`- Category: ${name} already exists, skipped.`);
      continue;
    }
    await db.insert(productCategories).values({ name });
    console.log(`- Category: created ${name}`);
  }
}

type SeedProduct = {
  name: string;
  category: string;
  type: "SOFTWARE" | "ADD_ON" | "SERVICE";
  description: string;
  monthlyPrice: string;
};

// Illustrative catalogue from the Phase 2 spec. Prices are demo values for
// this hackathon project, not verified market prices.
const SEED_PRODUCTS: SeedProduct[] = [
  {
    name: "BrightMail",
    category: "Email Marketing",
    type: "SOFTWARE",
    description: "Email campaign creation, customer segmentation, and campaign analytics.",
    monthlyPrice: "799.00",
  },
  { name: "BrightAnalytics", category: "Analytics", type: "SOFTWARE", description: "Business analytics and reporting dashboards.", monthlyPrice: "1299.00" },
  { name: "BrightSupport", category: "Customer Support", type: "SOFTWARE", description: "Helpdesk and customer support ticketing.", monthlyPrice: "899.00" },
  { name: "BrightCloud", category: "Cloud Storage", type: "SOFTWARE", description: "Cloud file storage and sharing.", monthlyPrice: "499.00" },
  { name: "BrightSecure", category: "Cybersecurity", type: "SOFTWARE", description: "Endpoint and network security monitoring.", monthlyPrice: "1999.00" },
  { name: "BrightAPI", category: "API Integration", type: "SOFTWARE", description: "API gateway and third-party integrations.", monthlyPrice: "699.00" },
  { name: "BrightBackup", category: "Data Backup", type: "SOFTWARE", description: "Automated data backup and recovery.", monthlyPrice: "399.00" },
  { name: "BrightMeet", category: "Video Conferencing", type: "SOFTWARE", description: "Video conferencing and virtual meetings.", monthlyPrice: "999.00" },
  { name: "BrightDocs", category: "Document Management", type: "SOFTWARE", description: "Document storage, versioning, and collaboration.", monthlyPrice: "599.00" },
  { name: "BrightAI", category: "AI Tools", type: "SOFTWARE", description: "AI assistant for business workflows.", monthlyPrice: "1499.00" },
];

const SEED_VARIANTS: Record<string, Array<{ name: string; code: string; extraPrice: string }>> = {
  BrightCloud: [
    { name: "100 GB", code: "100GB", extraPrice: "0.00" },
    { name: "500 GB", code: "500GB", extraPrice: "299.00" },
    { name: "1 TB", code: "1TB", extraPrice: "560.00" },
  ],
};

async function getOrCreateProduct(seed: SeedProduct) {
  const [existing] = await db.select().from(products).where(eq(products.name, seed.name)).limit(1);
  if (existing) {
    console.log(`- Product: ${seed.name} already exists, skipped.`);
    return existing;
  }
  const [created] = await db
    .insert(products)
    .values({
      name: seed.name,
      category: seed.category,
      type: seed.type,
      description: seed.description,
      salesPrice: seed.monthlyPrice,
      costPrice: "0",
      currency: "INR",
    })
    .returning();
  console.log(`- Product: created ${seed.name} (₹${seed.monthlyPrice}/mo)`);
  return created;
}

async function seedVariants(productId: number, productName: string) {
  const variantSeeds = SEED_VARIANTS[productName];
  if (!variantSeeds) return;
  const existingVariants = await db.select({ code: productVariants.code }).from(productVariants).where(eq(productVariants.productId, productId));
  const existingCodes = new Set(existingVariants.map((v) => v.code));
  for (const v of variantSeeds) {
    if (existingCodes.has(v.code)) {
      console.log(`  - Variant: ${productName} / ${v.name} already exists, skipped.`);
      continue;
    }
    await db.insert(productVariants).values({ productId, name: v.name, code: v.code, extraPrice: v.extraPrice });
    console.log(`  - Variant: created ${productName} / ${v.name}`);
  }
}

async function seedMonthlyPlan(productId: number, productName: string, price: string) {
  const existingPlans = await db.select().from(plans).where(eq(plans.productId, productId));
  if (existingPlans.some((p) => p.name === `${productName} Monthly`)) {
    console.log(`  - Plan: ${productName} Monthly already exists, skipped.`);
    return;
  }
  await db.insert(plans).values({
    productId,
    name: `${productName} Monthly`,
    price,
    currency: "INR",
    billingPeriod: "MONTHLY",
    minQuantity: 1,
  });
  console.log(`  - Plan: created ${productName} Monthly (₹${price})`);
}

async function seedTaxRule() {
  const [existing] = await db.select({ id: taxRules.id }).from(taxRules).where(eq(taxRules.code, "GST18")).limit(1);
  if (existing) {
    console.log("- Tax rule: GST18 already exists, skipped.");
    return;
  }
  await db.insert(taxRules).values({
    name: "GST 18%",
    code: "GST18",
    rate: "18.00",
    type: "PERCENTAGE",
    description: "Standard Indian GST rate — demo configuration, applies to all products unless overridden.",
  });
  console.log("- Tax rule: created GST 18%");
}

async function seedDiscounts(brightMailId: number, brightCloudId: number, brightAiId: number) {
  const seeds = [
    {
      code: "BRIGHTMAIL10",
      name: "BrightMail Launch Offer",
      description: "10% off BrightMail for new subscribers.",
      type: "PERCENTAGE" as const,
      value: "10.00",
      scope: "PRODUCT" as const,
      productId: brightMailId,
    },
    {
      code: "BRIGHTCLOUD100",
      name: "BrightCloud Starter Offer",
      description: "₹100 fixed discount on BrightCloud.",
      type: "FIXED" as const,
      value: "100.00",
      scope: "PRODUCT" as const,
      productId: brightCloudId,
    },
    {
      code: "BRIGHTAI5",
      name: "BrightAI Promotional Offer",
      description: "5% promotional discount on BrightAI.",
      type: "PERCENTAGE" as const,
      value: "5.00",
      scope: "PRODUCT" as const,
      productId: brightAiId,
    },
  ];

  for (const seed of seeds) {
    const [existing] = await db.select({ id: discounts.id }).from(discounts).where(eq(discounts.code, seed.code)).limit(1);
    if (existing) {
      console.log(`- Discount: ${seed.name} already exists, skipped.`);
      continue;
    }
    await db.insert(discounts).values(seed);
    console.log(`- Discount: created ${seed.name}`);
  }
}

async function seed() {
  console.log("Seeding Phase 2 catalogue…\n");

  await seedCategories();

  const created: Record<string, number> = {};
  for (const seedProduct of SEED_PRODUCTS) {
    const product = await getOrCreateProduct(seedProduct);
    created[seedProduct.name] = product.id;
    await seedVariants(product.id, seedProduct.name);
    await seedMonthlyPlan(product.id, seedProduct.name, seedProduct.monthlyPrice);
  }

  await seedTaxRule();
  await seedDiscounts(created.BrightMail, created.BrightCloud, created.BrightAI);

  console.log("\nCatalogue seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Catalogue seed failed:", err);
  process.exit(1);
});
