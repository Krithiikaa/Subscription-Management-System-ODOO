import { PrismaClient, Role, BillingPeriod, SubscriptionStatus, InvoiceStatus, PaymentMethod, DiscountType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting full BrightLoop database seed...");

  // 1. Initialize safe atomic counters
  await prisma.counter.upsert({
    where: { id: "subscription" },
    update: {},
    create: { id: "subscription", current: 100 },
  });

  await prisma.counter.upsert({
    where: { id: "invoice" },
    update: {},
    create: { id: "invoice", current: 100 },
  });

  // Common demo password satisfying all rules (>8 chars, upper, lower, special)
  const defaultPasswordHash = await bcrypt.hash("BrightLoop@2026", 10);

  // 2. Users: 1 Admin, 2 Staff, 5 Customers
  const admin = await prisma.user.upsert({
    where: { email: "admin@brightloop.io" },
    update: {},
    create: {
      name: "Pooja Admin",
      email: "admin@brightloop.io",
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
    },
  });

  const staff1 = await prisma.user.upsert({
    where: { email: "staff.arun@brightloop.io" },
    update: {},
    create: {
      name: "Arun Kumar",
      email: "staff.arun@brightloop.io",
      passwordHash: defaultPasswordHash,
      role: Role.STAFF,
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: "staff.kavya@brightloop.io" },
    update: {},
    create: {
      name: "Kavya Murugan",
      email: "staff.kavya@brightloop.io",
      passwordHash: defaultPasswordHash,
      role: Role.STAFF,
    },
  });

  // 5 Customers
  const customerUsers = [
    { name: "Apex Retail Pvt Ltd", email: "contact@apexretail.in", gstin: "29AABCA1234F1Z1", city: "Bengaluru" },
    { name: "BlueWave Logistics", email: "finance@bluewave.com", gstin: "33AABCB5678G1Z2", city: "Chennai" },
    { name: "Zenith Tech Systems", email: "admin@zenithtech.io", gstin: "27AABCC9012H1Z3", city: "Mumbai" },
    { name: "Kavya Enterprises", email: "info@kavyaenterprises.com", gstin: "29AABCD3456I1Z4", city: "Mysuru" },
    { name: "Nova Health Labs", email: "billing@novahealth.org", gstin: "36AABCE7890J1Z5", city: "Hyderabad" },
  ];

  const createdCustomers: any[] = [];
  for (const c of customerUsers) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        passwordHash: defaultPasswordHash,
        role: Role.CUSTOMER,
      },
    });

    const customer = await prisma.customer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        companyName: c.name,
        phone: "+91 9845001234",
        address: "Industrial Tech Corridor",
        city: c.city,
        state: "Karnataka",
        pincode: "560001",
        gstin: c.gstin,
      },
    });

    createdCustomers.push(customer);
  }

  // 3. Products & Variants (with Odoo-compatible +560)
  const crmProduct = await prisma.product.create({
    data: {
      name: "Brightloop CRM",
      description: "Complete customer relationship & sales pipeline management.",
      salesPrice: 2000,
      costPrice: 800,
      variants: {
        create: [
          { attribute: "Brand", value: "Standard Edition", extraPrice: 0 },
          { attribute: "Brand", value: "Odoo-compatible", extraPrice: 560 }, // Spec: Odoo brand adds 560
          { attribute: "Brand", value: "Zoho-compatible", extraPrice: 300 },
        ],
      },
    },
    include: { variants: true },
  });

  const billingProduct = await prisma.product.create({
    data: {
      name: "Brightloop Billing",
      description: "Automated recurring subscription billing & invoice delivery.",
      salesPrice: 1500,
      costPrice: 600,
    },
  });

  const inventoryProduct = await prisma.product.create({
    data: {
      name: "Brightloop Inventory",
      description: "Stock tracking, warehouses, serial batches, and procurement.",
      salesPrice: 1800,
      costPrice: 750,
    },
  });

  const hrProduct = await prisma.product.create({
    data: {
      name: "Brightloop HR & Payroll",
      description: "Employee onboarding, attendance, PF, ESI, and payroll slip generator.",
      salesPrice: 2500,
      costPrice: 1000,
    },
  });

  const helpdeskProduct = await prisma.product.create({
    data: {
      name: "Brightloop Helpdesk",
      description: "Omnichannel customer support ticketing & SLA manager.",
      salesPrice: 1200,
      costPrice: 500,
    },
  });

  // 4. Plans with varying behaviour flags
  const monthlyStarter = await prisma.plan.create({
    data: {
      name: "Monthly Starter",
      price: 1999,
      billingPeriod: BillingPeriod.MONTHLY,
      minQuantity: 1,
      autoClose: false,
      closable: true,
      pausable: true,
      renewable: true,
    },
  });

  const annualBusiness = await prisma.plan.create({
    data: {
      name: "Annual Business",
      price: 19999,
      billingPeriod: BillingPeriod.YEARLY,
      minQuantity: 1,
      autoClose: false,
      closable: false, // Annual plans not closable early
      pausable: true,
      renewable: true,
    },
  });

  const weeklyTrial = await prisma.plan.create({
    data: {
      name: "Weekly Trial",
      price: 499,
      billingPeriod: BillingPeriod.WEEKLY,
      minQuantity: 1,
      autoClose: true, // Trial auto-closes
      closable: true,
      pausable: false, // Trial not pausable
      renewable: false, // Trial not renewable
    },
  });

  const dailyPass = await prisma.plan.create({
    data: {
      name: "Daily Pass",
      price: 99,
      billingPeriod: BillingPeriod.DAILY,
      minQuantity: 1,
      autoClose: true,
      closable: true,
      pausable: false,
      renewable: false,
    },
  });

  // 5. Taxes
  const gst18 = await prisma.tax.create({
    data: { name: "GST 18%", percentage: 18 },
  });

  const gst5 = await prisma.tax.create({
    data: { name: "GST 5%", percentage: 5 },
  });

  // 6. Discounts
  // Discount 1: 10% for 10+ seats
  await prisma.discount.create({
    data: {
      name: "10% Volume Discount (10+ seats)",
      type: DiscountType.PERCENTAGE,
      value: 10,
      minQuantity: 10,
      appliesToAll: true,
    },
  });

  // Discount 2: Flat ₹500 first invoice with limit 1
  await prisma.discount.create({
    data: {
      name: "Welcome Flat ₹500 Off",
      type: DiscountType.FIXED,
      value: 500,
      usageLimit: 1,
      appliesToAll: true,
    },
  });

  // Discount 3: 15% off annual plans with an end date
  await prisma.discount.create({
    data: {
      name: "Early Bird 15% Off Annual",
      type: DiscountType.PERCENTAGE,
      value: 15,
      endDate: new Date("2027-12-31"),
      appliesToAll: true,
    },
  });

  // 7. Quotation Template (15 days)
  const odooVariant = crmProduct.variants.find((v) => v.value === "Odoo-compatible");
  const template = await prisma.quotationTemplate.create({
    data: {
      name: "Standard Odoo Enterprise Starter",
      planId: monthlyStarter.id,
      validityDays: 15,
      lines: {
        create: [
          {
            productId: crmProduct.id,
            variantId: odooVariant?.id || null,
            quantity: 1,
            unitPrice: 2560, // 2000 + 560
            sortOrder: 0,
          },
          {
            productId: billingProduct.id,
            quantity: 1,
            unitPrice: 1500,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  console.log("✅ Seed finished successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
