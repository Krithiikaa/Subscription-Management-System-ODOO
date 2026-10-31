import {
  pgTable,
  pgEnum,
  serial,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  uniqueIndex,
  index,
  check,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["ADMIN", "STAFF", "CUSTOMER"]);
export const productStatusEnum = pgEnum("product_status", ["ACTIVE", "INACTIVE", "ARCHIVED"]);
export const billingPeriodEnum = pgEnum("billing_period", ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["DRAFT", "QUOTATION", "CONFIRMED", "ACTIVE", "PAUSED", "CLOSED"]);
export const quotationStatusEnum = pgEnum("quotation_status", ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["DRAFT", "CONFIRMED", "PAID", "CANCELLED"]);
export const discountTypeEnum = pgEnum("discount_type", ["FIXED", "PERCENTAGE"]);
export const discountScopeEnum = pgEnum("discount_scope", ["SUBSCRIPTION", "PRODUCT"]);
export const paymentMethodEnum = pgEnum("payment_method", ["BANK_TRANSFER", "CASH", "CARD", "UPI", "CHEQUE", "OTHER"]);
export const auditActionEnum = pgEnum("audit_action", ["CREATED", "UPDATED", "STATUS_CHANGED", "DELETED"]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("CUSTOMER"),
  name: varchar("name", { length: 255 }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  emailIdx: uniqueIndex("users_email_unique").on(sql`lower(${t.email})`),
}));

// ─── Password Reset Tokens ────────────────────────────────────────────────────

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Login Attempts (rate limiting) ───────────────────────────────────────────

export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  ip: varchar("ip", { length: 64 }),
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  emailCreatedAtIdx: index("login_attempts_email_created_at_idx").on(sql`lower(${t.email})`, t.createdAt),
}));

// ─── Customers ────────────────────────────────────────────────────────────────

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "restrict" }),
  companyName: varchar("company_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Product Categories ────────────────────────────────────────────────────────

export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  nameIdx: uniqueIndex("product_categories_name_unique").on(t.name),
}));

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }),
  category: varchar("category", { length: 100 })
    .notNull()
    .references(() => productCategories.name, { onDelete: "restrict", onUpdate: "cascade" }),
  type: varchar("type", { length: 100 }).notNull(),
  description: text("description"),
  salesPrice: numeric("sales_price", { precision: 12, scale: 2 }).notNull().default("0"),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull().default("0"),
  currency: varchar("currency", { length: 3 }).notNull().default("INR"),
  notes: text("notes"),
  status: productStatusEnum("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  skuIdx: uniqueIndex("products_sku_unique").on(t.sku),
  salesPriceCheck: check("products_sales_price_non_negative", sql`${t.salesPrice} >= 0`),
  costPriceCheck: check("products_cost_price_non_negative", sql`${t.costPrice} >= 0`),
}));

// ─── Product Variants ─────────────────────────────────────────────────────────

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 100 }),
  description: text("description"),
  extraPrice: numeric("extra_price", { precision: 12, scale: 2 }).notNull().default("0"),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull().default("0"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  productCodeIdx: uniqueIndex("product_variants_product_id_code_unique").on(t.productId, t.code),
  extraPriceCheck: check("product_variants_extra_price_non_negative", sql`${t.extraPrice} >= 0`),
}));

// ─── Plans ────────────────────────────────────────────────────────────────────

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("INR"),
  billingPeriod: billingPeriodEnum("billing_period").notNull(),
  minQuantity: integer("min_quantity").notNull().default(1),
  availableFrom: date("available_from"),
  availableTo: date("available_to"),
  autoClose: boolean("auto_close").notNull().default(false),
  closable: boolean("closable").notNull().default(true),
  pausable: boolean("pausable").notNull().default(false),
  renewable: boolean("renewable").notNull().default(true),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  productIdx: index("plans_product_id_idx").on(t.productId),
  priceCheck: check("plans_price_positive", sql`${t.price} >= 0`),
  minQuantityCheck: check("plans_min_quantity_positive", sql`${t.minQuantity} >= 1`),
  dateRangeCheck: check("plans_date_range_valid", sql`${t.availableTo} IS NULL OR ${t.availableFrom} IS NULL OR ${t.availableTo} >= ${t.availableFrom}`),
}));

// ─── Tax Rules ────────────────────────────────────────────────────────────────

export const taxRules = pgTable("tax_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }),
  rate: numeric("rate", { precision: 5, scale: 2 }).notNull(),
  type: varchar("type", { length: 30 }).notNull().default("PERCENTAGE"),
  description: text("description"),
  productId: integer("product_id").references(() => products.id, { onDelete: "restrict" }),
  category: varchar("category", { length: 100 }).references(() => productCategories.name, { onDelete: "restrict", onUpdate: "cascade" }),
  effectiveFrom: date("effective_from"),
  effectiveTo: date("effective_to"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  codeIdx: uniqueIndex("tax_rules_code_unique").on(t.code),
  rateCheck: check("tax_rules_rate_range", sql`${t.rate} >= 0 AND ${t.rate} <= 100`),
  dateRangeCheck: check("tax_rules_date_range_valid", sql`${t.effectiveTo} IS NULL OR ${t.effectiveFrom} IS NULL OR ${t.effectiveTo} >= ${t.effectiveFrom}`),
}));

// ─── Discounts ────────────────────────────────────────────────────────────────

export const discounts = pgTable("discounts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }),
  description: text("description"),
  type: discountTypeEnum("type").notNull(),
  value: numeric("value", { precision: 12, scale: 2 }).notNull(),
  scope: discountScopeEnum("scope").notNull(),
  productId: integer("product_id").references(() => products.id, { onDelete: "restrict" }),
  minPurchase: numeric("min_purchase", { precision: 12, scale: 2 }),
  minQuantity: integer("min_quantity"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  codeIdx: uniqueIndex("discounts_code_unique").on(t.code),
  usedCountCheck: check("discounts_used_count_non_negative", sql`${t.usedCount} >= 0`),
  valueCheck: check("discounts_value_positive", sql`${t.value} >= 0`),
  dateRangeCheck: check("discounts_date_range_valid", sql`${t.endDate} IS NULL OR ${t.startDate} IS NULL OR ${t.endDate} >= ${t.startDate}`),
}));

// ─── Staff Product Assignments ────────────────────────────────────────────────

export const staffProductAssignments = pgTable("staff_product_assignments", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  assignedBy: integer("assigned_by").notNull().references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniqueAssignment: uniqueIndex("staff_product_assignments_staff_product_unique").on(t.staffId, t.productId),
  staffIdx: index("staff_product_assignments_staff_id_idx").on(t.staffId),
  productIdx: index("staff_product_assignments_product_id_idx").on(t.productId),
}));

// ─── Quotation Templates ──────────────────────────────────────────────────────

export const quotationTemplates = pgTable("quotation_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  planId: integer("plan_id").references(() => plans.id, { onDelete: "restrict" }), // TEMP: dropped in a follow-up reviewed migration — lines carry their own planId now
  validityDays: integer("validity_days").notNull().default(30),
  defaultPaymentTerms: varchar("default_payment_terms", { length: 100 }),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "restrict" }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Template Lines ───────────────────────────────────────────────────────────

export const templateLines = pgTable("template_lines", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => quotationTemplates.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "restrict" }),
  planId: integer("plan_id").notNull().references(() => plans.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
});

// ─── Quotations ───────────────────────────────────────────────────────────────

export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  number: varchar("number", { length: 20 }).notNull().unique(),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "restrict" }),
  createdBy: integer("created_by").notNull().references(() => users.id, { onDelete: "restrict" }),
  templateId: integer("template_id").references(() => quotationTemplates.id, { onDelete: "restrict" }),
  status: quotationStatusEnum("status").notNull().default("DRAFT"),
  quotationDate: date("quotation_date").notNull().defaultNow(),
  validUntil: date("valid_until"),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  currency: varchar("currency", { length: 3 }).notNull().default("INR"),
  notes: text("notes"),
  termsAndConditions: text("terms_and_conditions"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  discountTotal: numeric("discount_total", { precision: 12, scale: 2 }).notNull().default("0"),
  taxTotal: numeric("tax_total", { precision: 12, scale: 2 }).notNull().default("0"),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull().default("0"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  acceptedBy: integer("accepted_by").references(() => users.id, { onDelete: "restrict" }),
  rejectedAt: timestamp("rejected_at", { withTimezone: true }),
  rejectionReason: text("rejection_reason"),
  convertedSubscriptionId: integer("converted_subscription_id").references((): AnyPgColumn => subscriptions.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  customerIdx: index("quotations_customer_id_idx").on(t.customerId),
  statusIdx: index("quotations_status_idx").on(t.status),
  grandTotalCheck: check("quotations_grand_total_non_negative", sql`${t.grandTotal} >= 0`),
}));

// ─── Quotation Lines ──────────────────────────────────────────────────────────

export const quotationLines = pgTable("quotation_lines", {
  id: serial("id").primaryKey(),
  quotationId: integer("quotation_id").notNull().references(() => quotations.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "restrict" }),
  planId: integer("plan_id").notNull().references(() => plans.id, { onDelete: "restrict" }),
  // Snapshots — immutable once written, never recomputed from current catalogue state.
  productName: varchar("product_name", { length: 255 }).notNull(),
  productCode: varchar("product_code", { length: 100 }),
  variantName: varchar("variant_name", { length: 255 }),
  planName: varchar("plan_name", { length: 255 }).notNull(),
  billingPeriod: billingPeriodEnum("billing_period").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  variantExtra: numeric("variant_extra", { precision: 12, scale: 2 }).notNull().default("0"),
  taxRuleId: integer("tax_rule_id").references(() => taxRules.id, { onDelete: "restrict" }),
  taxRatePct: numeric("tax_rate_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  discountId: integer("discount_id").references(() => discounts.id, { onDelete: "restrict" }),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
});

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  number: varchar("number", { length: 20 }).notNull().unique(),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "restrict" }),
  planId: integer("plan_id").references(() => plans.id, { onDelete: "restrict" }), // TEMP: dropped in a follow-up reviewed migration — lines carry their own planId now
  templateId: integer("template_id").references(() => quotationTemplates.id, { onDelete: "restrict" }),
  quotationId: integer("quotation_id").references(() => quotations.id, { onDelete: "restrict" }),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "restrict" }),
  assignedStaffId: integer("assigned_staff_id").references(() => users.id, { onDelete: "set null" }),
  status: subscriptionStatusEnum("status").notNull().default("DRAFT"),
  startDate: date("start_date").notNull(),
  expiryDate: date("expiry_date"),
  nextBillingDate: date("next_billing_date"),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  notes: text("notes"),
  pausedAt: timestamp("paused_at", { withTimezone: true }),
  pausedBy: integer("paused_by").references(() => users.id, { onDelete: "restrict" }),
  pauseReason: text("pause_reason"),
  resumedAt: timestamp("resumed_at", { withTimezone: true }),
  resumedBy: integer("resumed_by").references(() => users.id, { onDelete: "restrict" }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  closedBy: integer("closed_by").references(() => users.id, { onDelete: "restrict" }),
  closureReason: text("closure_reason"),
  renewedFromSubscriptionId: integer("renewed_from_subscription_id").references((): AnyPgColumn => subscriptions.id, { onDelete: "set null" }),
  renewedToSubscriptionId: integer("renewed_to_subscription_id").references((): AnyPgColumn => subscriptions.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  billingIdx: index("subscriptions_status_next_billing_date_idx").on(t.status, t.nextBillingDate),
  customerIdx: index("subscriptions_customer_id_idx").on(t.customerId),
}));

// ─── Subscription Lines ───────────────────────────────────────────────────────

export const subscriptionLines = pgTable("subscription_lines", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").notNull().references(() => subscriptions.id, { onDelete: "restrict" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "restrict" }),
  planId: integer("plan_id").references(() => plans.id, { onDelete: "restrict" }),
  // Snapshots — immutable once written, never recomputed from current catalogue state.
  productName: varchar("product_name", { length: 255 }),
  productCode: varchar("product_code", { length: 100 }),
  variantName: varchar("variant_name", { length: 255 }),
  planName: varchar("plan_name", { length: 255 }),
  billingPeriod: billingPeriodEnum("billing_period"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  variantExtra: numeric("variant_extra", { precision: 12, scale: 2 }).notNull().default("0"),
  taxRuleId: integer("tax_rule_id").references(() => taxRules.id, { onDelete: "restrict" }),
  taxRatePct: numeric("tax_rate_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  discountId: integer("discount_id").references(() => discounts.id, { onDelete: "restrict" }),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // final line total (subtotal - discount + tax)
});

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: varchar("number", { length: 20 }).notNull().unique(),
  subscriptionId: integer("subscription_id").notNull().references(() => subscriptions.id, { onDelete: "restrict" }),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "restrict" }),
  status: invoiceStatusEnum("status").notNull().default("DRAFT"),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  dueDate: date("due_date"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  amountPaid: numeric("amount_paid", { precision: 12, scale: 2 }).notNull().default("0"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniqueBillingPeriod: uniqueIndex("invoices_subscription_period_unique").on(t.subscriptionId, t.periodStart),
  statusDueDateIdx: index("invoices_status_due_date_idx").on(t.status, t.dueDate),
  customerCreatedAtIdx: index("invoices_customer_created_at_idx").on(t.customerId, t.createdAt),
  amountPaidCheck: check("invoices_amount_paid_check", sql`${t.amountPaid} >= 0 AND ${t.amountPaid} <= ${t.total}`),
  totalCheck: check("invoices_total_positive", sql`${t.total} >= 0`),
}));

// ─── Invoice Lines ────────────────────────────────────────────────────────────

export const invoiceLines = pgTable("invoice_lines", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id, { onDelete: "restrict" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "restrict" }),
  description: text("description"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  variantExtra: numeric("variant_extra", { precision: 12, scale: 2 }).notNull().default("0"),
  taxRuleId: integer("tax_rule_id").references(() => taxRules.id, { onDelete: "restrict" }),
  taxRatePct: numeric("tax_rate_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  discountId: integer("discount_id").references(() => discounts.id, { onDelete: "restrict" }),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
});

// ─── Payments ─────────────────────────────────────────────────────────────────

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  paidOn: date("paid_on").notNull(),
  note: text("note"),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  invoiceIdx: index("payments_invoice_id_idx").on(t.invoiceId),
  paidOnIdx: index("payments_paid_on_idx").on(t.paidOn),
  amountCheck: check("payments_amount_positive", sql`${t.amount} > 0`),
}));

// ─── Audit Log ────────────────────────────────────────────────────────────────

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "restrict" }),
  action: auditActionEnum("action").notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: integer("entity_id").notNull(),
  oldValues: text("old_values"),
  newValues: text("new_values"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  entityIdx: index("audit_logs_entity_idx").on(t.entityType, t.entityId),
  createdAtIdx: index("audit_logs_created_at_idx").on(t.createdAt),
}));

// ─── Type exports ─────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
export type TaxRule = typeof taxRules.$inferSelect;
export type NewTaxRule = typeof taxRules.$inferInsert;
export type Discount = typeof discounts.$inferSelect;
export type NewDiscount = typeof discounts.$inferInsert;
export type StaffProductAssignment = typeof staffProductAssignments.$inferSelect;
export type NewStaffProductAssignment = typeof staffProductAssignments.$inferInsert;
export type QuotationTemplate = typeof quotationTemplates.$inferSelect;
export type NewQuotationTemplate = typeof quotationTemplates.$inferInsert;
export type TemplateLine = typeof templateLines.$inferSelect;
export type NewTemplateLine = typeof templateLines.$inferInsert;
export type Quotation = typeof quotations.$inferSelect;
export type NewQuotation = typeof quotations.$inferInsert;
export type QuotationLine = typeof quotationLines.$inferSelect;
export type NewQuotationLine = typeof quotationLines.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type SubscriptionLine = typeof subscriptionLines.$inferSelect;
export type NewSubscriptionLine = typeof subscriptionLines.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceLine = typeof invoiceLines.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
