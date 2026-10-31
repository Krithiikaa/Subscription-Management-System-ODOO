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
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["ADMIN", "STAFF", "CUSTOMER"]);
export const billingPeriodEnum = pgEnum("billing_period", ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["DRAFT", "QUOTATION", "CONFIRMED", "ACTIVE", "PAUSED", "CLOSED"]);
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

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  salesPrice: numeric("sales_price", { precision: 12, scale: 2 }).notNull().default("0"),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Product Variants ─────────────────────────────────────────────────────────

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 255 }).notNull(),
  extraPrice: numeric("extra_price", { precision: 12, scale: 2 }).notNull().default("0"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Plans ────────────────────────────────────────────────────────────────────

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
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
  priceCheck: check("plans_price_positive", sql`${t.price} >= 0`),
}));

// ─── Tax Rules ────────────────────────────────────────────────────────────────

export const taxRules = pgTable("tax_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  rate: numeric("rate", { precision: 5, scale: 2 }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  rateCheck: check("tax_rules_rate_range", sql`${t.rate} >= 0 AND ${t.rate} <= 100`),
}));

// ─── Discounts ────────────────────────────────────────────────────────────────

export const discounts = pgTable("discounts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
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
  usedCountCheck: check("discounts_used_count_non_negative", sql`${t.usedCount} >= 0`),
  valueCheck: check("discounts_value_positive", sql`${t.value} >= 0`),
}));

// ─── Quotation Templates ──────────────────────────────────────────────────────

export const quotationTemplates = pgTable("quotation_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  planId: integer("plan_id").notNull().references(() => plans.id, { onDelete: "restrict" }),
  validityDays: integer("validity_days").notNull().default(30),
  notes: text("notes"),
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
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
});

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  number: varchar("number", { length: 20 }).notNull().unique(),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: "restrict" }),
  planId: integer("plan_id").notNull().references(() => plans.id, { onDelete: "restrict" }),
  templateId: integer("template_id").references(() => quotationTemplates.id, { onDelete: "restrict" }),
  status: subscriptionStatusEnum("status").notNull().default("DRAFT"),
  startDate: date("start_date").notNull(),
  expiryDate: date("expiry_date"),
  nextBillingDate: date("next_billing_date"),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  notes: text("notes"),
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
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  taxRuleId: integer("tax_rule_id").references(() => taxRules.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
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
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
export type TaxRule = typeof taxRules.$inferSelect;
export type Discount = typeof discounts.$inferSelect;
export type QuotationTemplate = typeof quotationTemplates.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceLine = typeof invoiceLines.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
