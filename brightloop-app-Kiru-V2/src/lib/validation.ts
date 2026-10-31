import { z } from "zod";

// Password rule: >8 chars (9+), at least one upper, one lower, one special character.
export const passwordSchema = z
  .string()
  .min(9, "Password must be at least 9 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const emailSchema = z.string().trim().toLowerCase().email("Invalid email address");

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(255),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createStaffSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: emailSchema,
  password: passwordSchema,
});

export const updateStaffSchema = z.object({
  active: z.boolean(),
});

// ─── Catalogue (Phase 2) ───────────────────────────────────────────────────────

// Category names are admin-configurable (product_categories table) rather
// than a fixed list — existence/active-status is checked server-side against
// the DB, not via a static Zod enum.
export const categoryNameSchema = z.string().trim().min(1, "Category is required").max(100);

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  active: z.boolean().optional().default(true),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  active: z.boolean().optional(),
});

export const PRODUCT_TYPES = ["SOFTWARE", "ADD_ON", "SERVICE"] as const;
export const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;
export const BILLING_PERIODS = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const;
export const DISCOUNT_TYPES = ["FIXED", "PERCENTAGE"] as const;
export const DISCOUNT_SCOPES = ["SUBSCRIPTION", "PRODUCT"] as const;

// NUMERIC(12,2)-safe decimal string: non-negative, up to 2 decimal places.
export const moneyString = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a non-negative amount with up to 2 decimal places");

export const currencySchema = z.string().trim().toUpperCase().length(3, "Currency must be a 3-letter code").default("INR");

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date (YYYY-MM-DD)");

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  sku: z.string().trim().max(100).optional(),
  category: categoryNameSchema,
  type: z.enum(PRODUCT_TYPES),
  description: z.string().trim().max(2000).optional(),
  salesPrice: moneyString,
  costPrice: moneyString.optional().default("0"),
  currency: currencySchema,
  notes: z.string().trim().max(2000).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  sku: z.string().trim().max(100).optional(),
  category: categoryNameSchema.optional(),
  type: z.enum(PRODUCT_TYPES).optional(),
  description: z.string().trim().max(2000).optional(),
  salesPrice: moneyString.optional(),
  costPrice: moneyString.optional(),
  currency: currencySchema.optional(),
  notes: z.string().trim().max(2000).optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
});

export const createVariantSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  code: z.string().trim().max(100).optional(),
  description: z.string().trim().max(2000).optional(),
  extraPrice: moneyString,
  costPrice: moneyString.optional().default("0"),
});

export const updateVariantSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  code: z.string().trim().max(100).optional(),
  description: z.string().trim().max(2000).optional(),
  extraPrice: moneyString.optional(),
  costPrice: moneyString.optional(),
  active: z.boolean().optional(),
});

export const createPlanSchema = z
  .object({
    productId: z.number().int().positive(),
    name: z.string().trim().min(1, "Name is required").max(255),
    description: z.string().trim().max(2000).optional(),
    price: moneyString,
    currency: currencySchema,
    billingPeriod: z.enum(BILLING_PERIODS),
    minQuantity: z.number().int().positive().default(1),
    availableFrom: isoDateSchema.optional(),
    availableTo: isoDateSchema.optional(),
    autoClose: z.boolean().optional().default(false),
    closable: z.boolean().optional().default(true),
    pausable: z.boolean().optional().default(false),
    renewable: z.boolean().optional().default(true),
  })
  .refine((data) => !data.availableFrom || !data.availableTo || data.availableTo >= data.availableFrom, {
    message: "Availability end date cannot precede the start date",
    path: ["availableTo"],
  });

export const updatePlanSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().max(2000).optional(),
    price: moneyString.optional(),
    currency: currencySchema.optional(),
    billingPeriod: z.enum(BILLING_PERIODS).optional(),
    minQuantity: z.number().int().positive().optional(),
    availableFrom: isoDateSchema.nullable().optional(),
    availableTo: isoDateSchema.nullable().optional(),
    autoClose: z.boolean().optional(),
    closable: z.boolean().optional(),
    pausable: z.boolean().optional(),
    renewable: z.boolean().optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => !data.availableFrom || !data.availableTo || data.availableTo >= data.availableFrom, {
    message: "Availability end date cannot precede the start date",
    path: ["availableTo"],
  });

export const createTaxRuleSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(255),
    code: z.string().trim().max(50).optional(),
    rate: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Must be a non-negative rate with up to 2 decimal places")
      .refine((v) => parseFloat(v) <= 100, "Tax rate cannot exceed 100%"),
    type: z.string().trim().max(30).optional().default("PERCENTAGE"),
    description: z.string().trim().max(2000).optional(),
    productId: z.number().int().positive().optional(),
    category: categoryNameSchema.optional(),
    effectiveFrom: isoDateSchema.optional(),
    effectiveTo: isoDateSchema.optional(),
  })
  .refine((data) => !data.effectiveFrom || !data.effectiveTo || data.effectiveTo >= data.effectiveFrom, {
    message: "Effective end date cannot precede the start date",
    path: ["effectiveTo"],
  });

export const updateTaxRuleSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    code: z.string().trim().max(50).optional(),
    rate: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Must be a non-negative rate with up to 2 decimal places")
      .refine((v) => parseFloat(v) <= 100, "Tax rate cannot exceed 100%")
      .optional(),
    type: z.string().trim().max(30).optional(),
    description: z.string().trim().max(2000).optional(),
    productId: z.number().int().positive().nullable().optional(),
    category: categoryNameSchema.nullable().optional(),
    effectiveFrom: isoDateSchema.nullable().optional(),
    effectiveTo: isoDateSchema.nullable().optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => !data.effectiveFrom || !data.effectiveTo || data.effectiveTo >= data.effectiveFrom, {
    message: "Effective end date cannot precede the start date",
    path: ["effectiveTo"],
  });

export const createDiscountSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(255),
    code: z.string().trim().max(50).optional(),
    description: z.string().trim().max(2000).optional(),
    type: z.enum(DISCOUNT_TYPES),
    value: moneyString,
    scope: z.enum(DISCOUNT_SCOPES),
    productId: z.number().int().positive().optional(),
    minPurchase: moneyString.optional(),
    minQuantity: z.number().int().positive().optional(),
    startDate: isoDateSchema.optional(),
    endDate: isoDateSchema.optional(),
    usageLimit: z.number().int().positive().optional(),
  })
  .refine((data) => data.scope !== "PRODUCT" || data.productId !== undefined, {
    message: "A product must be selected for a product-scoped discount",
    path: ["productId"],
  })
  .refine((data) => data.type !== "PERCENTAGE" || parseFloat(data.value) <= 100, {
    message: "Percentage discount cannot exceed 100%",
    path: ["value"],
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: "End date cannot precede the start date",
    path: ["endDate"],
  });

export const updateDiscountSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    code: z.string().trim().max(50).optional(),
    description: z.string().trim().max(2000).optional(),
    type: z.enum(DISCOUNT_TYPES).optional(),
    value: moneyString.optional(),
    scope: z.enum(DISCOUNT_SCOPES).optional(),
    productId: z.number().int().positive().nullable().optional(),
    minPurchase: moneyString.nullable().optional(),
    minQuantity: z.number().int().positive().nullable().optional(),
    startDate: isoDateSchema.nullable().optional(),
    endDate: isoDateSchema.nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: "End date cannot precede the start date",
    path: ["endDate"],
  });

export const staffAssignmentSchema = z.object({
  staffId: z.number().int().positive(),
  productId: z.number().int().positive(),
});

export const pricingPreviewSchema = z.object({
  productId: z.number().int().positive(),
  variantId: z.number().int().positive().optional(),
  planId: z.number().int().positive().optional(),
  quantity: z.number().int().positive().default(1),
  taxRuleId: z.number().int().positive().optional(),
  discountId: z.number().int().positive().optional(),
});

// ─── Quotations & Subscriptions (Phase 3) ──────────────────────────────────────

export const QUOTATION_STATUSES = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"] as const;
export const SUBSCRIPTION_STATUSES = ["DRAFT", "QUOTATION", "CONFIRMED", "ACTIVE", "PAUSED", "CLOSED"] as const;

export const lineItemInputSchema = z.object({
  productId: z.number().int().positive(),
  variantId: z.number().int().positive().optional(),
  planId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
  taxRuleId: z.number().int().positive().optional(),
  discountId: z.number().int().positive().optional(),
  description: z.string().trim().max(500).optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  description: z.string().trim().max(2000).optional(),
  validityDays: z.number().int().positive().default(30),
  defaultPaymentTerms: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(2000).optional(),
  lines: z.array(lineItemInputSchema).min(1, "At least one line is required"),
});

export const updateTemplateSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(2000).optional(),
  validityDays: z.number().int().positive().optional(),
  defaultPaymentTerms: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(2000).optional(),
  active: z.boolean().optional(),
  lines: z.array(lineItemInputSchema).min(1).optional(),
});

export const createQuotationSchema = z.object({
  customerId: z.number().int().positive(),
  templateId: z.number().int().positive().optional(),
  paymentTerms: z.string().trim().max(100).optional(),
  currency: currencySchema,
  notes: z.string().trim().max(2000).optional(),
  termsAndConditions: z.string().trim().max(5000).optional(),
  validUntil: isoDateSchema.optional(),
  lines: z.array(lineItemInputSchema).min(1, "At least one line is required"),
});

export const updateQuotationSchema = z.object({
  paymentTerms: z.string().trim().max(100).optional(),
  currency: currencySchema.optional(),
  notes: z.string().trim().max(2000).optional(),
  termsAndConditions: z.string().trim().max(5000).optional(),
  validUntil: isoDateSchema.optional(),
  lines: z.array(lineItemInputSchema).min(1).optional(),
});

export const rejectQuotationSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

export const createSubscriptionSchema = z.object({
  customerId: z.number().int().positive(),
  startDate: isoDateSchema,
  expiryDate: isoDateSchema.optional(),
  paymentTerms: z.string().trim().max(100).optional(),
  assignedStaffId: z.number().int().positive().optional(),
  notes: z.string().trim().max(2000).optional(),
  lines: z.array(lineItemInputSchema).min(1, "At least one line is required"),
});

export const pauseSubscriptionSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

export const closeSubscriptionSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

export const renewSubscriptionSchema = z.object({
  startDate: isoDateSchema.optional(),
  expiryDate: isoDateSchema.optional(),
  lines: z.array(lineItemInputSchema).min(1).optional(),
});

export const assignStaffToSubscriptionSchema = z.object({
  assignedStaffId: z.number().int().positive().nullable(),
});

// ─── Billing / Invoices (Phase 4) ──────────────────────────────────────────

export const INVOICE_STATUSES = ["DRAFT", "CONFIRMED", "PARTIALLY_PAID", "PAID", "CANCELLED"] as const;

export const runBillingSchema = z.object({
  dryRun: z.boolean().optional(),
  limit: z.number().int().positive().max(5000).optional(),
});

export const cancelInvoiceSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

// ─── Payments (Phase 5) ────────────────────────────────────────────────────

export const PAYMENT_METHODS = ["BANK_TRANSFER", "CASH", "CARD", "UPI", "CHEQUE", "NETBANKING", "WALLET", "OTHER"] as const;
export const DEMO_PAYMENT_METHODS = ["UPI", "CARD", "NETBANKING", "WALLET"] as const;
export const PAYMENT_STATUSES = ["SUCCESS", "FAILED", "PENDING"] as const;

export const createPaymentSessionSchema = z.object({
  invoiceId: z.number().int().positive(),
});

export const completePaymentSessionSchema = z.object({
  method: z.enum(DEMO_PAYMENT_METHODS),
  outcome: z.enum(["SUCCESS", "FAILURE", "PENDING"]),
});

export const recordManualPaymentSchema = z.object({
  invoiceId: z.number().int().positive(),
  amount: moneyString,
  method: z.enum(PAYMENT_METHODS),
  paidOn: isoDateSchema,
  note: z.string().trim().max(1000).optional(),
  reference: z.string().trim().max(100).optional(),
});

// ─── Software Access (Phase 6) ─────────────────────────────────────────────

export const SOFTWARE_ACCESS_STATUSES = ["PENDING", "ACTIVE", "SUSPENDED", "EXPIRED", "REVOKED"] as const;

export const suspendEntitlementSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});
