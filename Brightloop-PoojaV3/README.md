# BrightLoop Subscription Management System (V2)

BrightLoop is an enterprise-grade subscription billing and recurring revenue platform built end-to-end with **Next.js 16 (App Router)**, **TypeScript**, **Prisma ORM**, and **Neon PostgreSQL**.

---

## 🚀 Live Demo Credentials

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Admin** | `admin@brightloop.io` | `BrightLoop@2026` | `/admin/dashboard` (Full system control) |
| **Staff** | `staff.arun@brightloop.io` | `BrightLoop@2026` | `/staff/dashboard` (Customers & Quotes) |
| **Staff** | `staff.kavya@brightloop.io` | `BrightLoop@2026` | `/staff/dashboard` (Invoices & Payments) |
| **Customer** | `contact@apexretail.in` | `BrightLoop@2026` | `/portal/subscriptions` (Self-service portal) |
| **Customer** | `finance@bluewave.com` | `BrightLoop@2026` | `/portal/subscriptions` (Self-service portal) |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript (`export const runtime = "nodejs"` on ALL API routes).
- **Database & ORM**: Neon PostgreSQL (POOLED connection string) + Prisma 6.
- **Financial Arithmetic**: `Decimal(12,2)` strictly used for all monetary fields. Floats are never used in financial calculations.
- **Authentication**: `jose` JWT stored in `httpOnly`, `secure`, `sameSite: "lax"` cookies + `bcryptjs` password hashing.
- **Authorization**: Universal server-side RBAC guard (`requireAuth`) and Next.js middleware protection.
- **Styling**: Tailwind CSS + custom tokens (`--primary: #4F46E5`, `--accent: #14B8A6`, dark mode `--background: #0B1020`).
- **Icons & Typography**: `lucide-react`, `Plus Jakarta Sans`, `Inter`, `JetBrains Mono`.
- **Automated Billing Engine**: Idempotent daily runner with month-end date clamping and single-best-discount selector.
- **Unit & Logic Tests**: Vitest test runner.

---

## 📋 Core Architectural Guarantees

1. **Idempotent Billing (`@@unique([subscriptionId, periodStart])`)**:
   An invoice cannot be created twice for the same billing period under any circumstance.
2. **Server-Side Tenant Isolation**:
   Customer portal routes strictly resolve `customerId` from the verified JWT payload. Customers requesting records belonging to other tenants receive a `404 Not Found`.
3. **Strict State Machine**:
   Subscription lifecycle strictly follows: `Draft -> Quotation -> Confirmed -> Active -> Closed` and `Active <-> Paused` (only if allowed by plan flags).
4. **Plan Flag Enforcement**:
   - `pausable`: Pausing rejected with 400 if false.
   - `closable`: Early cancellation rejected with 400 if false.
   - `renewable`: Manual renewal rejected with 400 if false.
   - `autoClose`: Expired subscriptions closed automatically by daily job.
5. **Accurate Tax & Discount Math**:
   - Best qualifying discount selected automatically.
   - Taxes calculated per line item on the amount **after discount**, rounded to 2 decimals, then summed.
   - Variant pricing snapshotted onto subscription lines at creation time (e.g. Base ₹2,000 + Odoo Brand ₹560 = ₹2,560).
6. **Payment Invariants**:
   - Overpayment beyond remaining balance is rejected.
   - Partial payments tracked until balance reaches zero, upon which invoice flips to `PAID`.
   - Invoices with recorded payments cannot be cancelled unless payments are reversed via audit trail.

---

## ⚙️ Environment Variables

Configure these in `.env` or in your Vercel Project Settings:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL pooled connection string | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require&pgbouncer=true` |
| `JWT_SECRET` | 32+ character random secret for jose signing | `openssl rand -base64 64` |
| `RESEND_API_KEY` | Resend API key for emailing invoice links | `re_xxxxxxxxxxxx` |
| `CRON_SECRET` | Bearer token for Vercel Cron billing endpoint | `openssl rand -base64 32` |
| `APP_URL` | Base public URL of the application | `https://your-brightloop.vercel.app` |

---

## 🏃 Local Setup & Development

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema to database
npx prisma db push

# 5. Seed database
npx tsx prisma/seed.ts

# 6. Run test suite
npm test

# 7. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

---

## 🧪 Vitest Test Suite Overview

Run tests using:
```bash
npm test
```

Test coverage includes:
- **`tests/auth.test.ts`**: Password complexity rules (>8 chars, uppercase, lowercase, special char), bcrypt hashing, and jose JWT signing/decoding.
- **`tests/catalog.test.ts`**: Unit price variant addition (Odoo brand 2000 + 560 = 2560), plan behavior flag validation, best-discount selection, discount usage limits, and post-discount line tax rounding.
- **`tests/dates.test.ts`**: Billing period advancement and calendar month-end clamping (Jan 31 -> Feb 28/29, Mar 31 -> Apr 30).
- **`tests/subscriptions.test.ts`**: State machine legal vs illegal transitions and quotation validity period enforcement.
- **`tests/payments.test.ts`**: Overpayment prevention, partial payment balance tracking, and status transition to `PAID`.
- **`tests/reports.test.ts`**: MRR normalization for daily, weekly, monthly, and annual subscription cycles.

---

## 📌 Section 19 Stated Business Assumptions

1. **Paused Subscriptions**: Not back-billed on resume.
2. **Discount Rules**: If multiple discounts qualify, the single best discount (yielding maximum monetary saving) wins.
3. **Proration**: No proration for mid-period changes.
4. **Payments**: Recorded by staff/admin (no payment gateway integration).
5. **Currency**: Single currency (`INR` - `₹`).
6. **Invoice Printing**: Styled for standard browser Print to PDF / A4 paper with `no-print` control.
7. **Cron Execution**: Vercel Cron runs daily with the admin "Run Billing" button serving as an on-demand trigger and backup.

---

## ⚡ Performance Verification

- **Production Build**: Verified with zero compilation errors (`next build`).
- **Health Route**: `GET /api/health` Node.js runtime database ping.
- **Dashboard Response Time**: Sub-2-second response on aggregate queries via Prisma `$queryRaw`.
