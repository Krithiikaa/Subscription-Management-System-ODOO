# Brightloop Subscription Management System — Progress Log

Scope: `brightloop-app-Kiru-V2/` (Kiruthigaa's module in the 3-person hackathon repo).

## Repo / Team Structure

Single GitHub repo, three independent folders (one per teammate, each deployable as its own separate Vercel project):

| Folder | Owner | Stack |
|---|---|---|
| `brightloop-app-Kiru-V2` | Kiruthigaa (this track) | Next.js 14 + Drizzle + Neon |
| `paviv1` | Pavithra | Vite + React (UI prototype) |
| `Brightloop-V2` | Pooja | Next.js + Prisma |

Repo: `github.com/Krithiikaa/Subscription-Management-System-ODOO`

## Infrastructure Set Up

- **Neon org**: `Kiruthigaa` (`org-flat-bar-59644591`)
- **Neon project**: `brightloop-subscription-mgmt` (`wispy-snow-07627596`), region `aws-ap-southeast-1` (Singapore)
- **Vercel project**: `brightloop-app`, Root Directory set to `brightloop-app-Kiru-V2` (so it builds only this folder, independent of the other two)
- **Live URL**: https://brightloop-app.vercel.app
- Production + Preview env vars set on Vercel: `DATABASE_URL`, `DIRECT_URL`, `DATABASE_URL_UNPOOLED`, `JWT_SECRET`, `CRON_SECRET`

## Phase 0 — Scaffold (✅ Complete)

- Next.js 14 App Router + TypeScript scaffold
- Tailwind design tokens: dark terminal theme + light Swiss theme, `prefers-reduced-motion` support, fluid type via `clamp()`
- shadcn/ui initialized against the existing tokens
- Drizzle schema — all 16 entities (users, customers, products, variants, plans, tax rules, discounts, quotation templates/lines, subscriptions/lines, invoices/lines, payments, audit log) with FK constraints, check constraints, and the required indexes:
  - `subscriptions(status, nextBillingDate)`
  - `invoices(status, dueDate)`, `invoices(customerId, createdAt desc)`, unique `invoices(subscriptionId, periodStart)`
  - `payments(paidOn)`, `payments(invoiceId)`
- Schema pushed to Neon and verified live via `psql` (16 tables, all check constraints confirmed)
- JWT session helpers (`jose`) + role-gating middleware (Admin/Staff/Customer)
- Deployed to Vercel, health check and landing page confirmed live (`200 OK`)

### Bugs fixed along the way
- `schema.ts` check constraints referenced non-existent snake_case keys (`t.used_count`, `t.amount_paid`) instead of Drizzle's camelCase accessors — this silently broke `drizzle-kit push` with a cryptic Postgres syntax error. Fixed to `t.usedCount` / `t.amountPaid`.
- `@types/node` was pinned to `^20`, conflicting with vitest's peer requirement (`^22`) — blocked every `npm install`. Bumped to `^22` (matches the installed Node 22 runtime).
- Middleware didn't allowlist `/` (landing page) or `/api/health`, so both redirected to `/login` instead of being publicly reachable. Fixed.
- A broken placeholder `login/page.tsx` (contained unused API-route imports) failed the production build's lint step — replaced with a valid placeholder page.

## Phase 1 — Auth & User Management (✅ Complete)

- Signup, login, logout, forgot-password, reset-password — all live, tested end-to-end against the real Neon DB (26 manual scenarios: duplicate email, weak password, role-injection blocked, wrong/unregistered-email login, rate limiting, inactive-account rejection, staff-cannot-create-staff, token reuse rejection, old-password-rejected-after-reset).
- Role-based access: Admin dashboard, Staff dashboard (shared `/admin/dashboard`, role-aware), Admin-only staff management (`/admin/staff`) with create + activate/deactivate.
- Nodemailer + Brevo SMTP for reset emails (per your explicit choice over the original spec's Resend — `resend` package removed). Dev fallback logs the reset link to console when SMTP isn't configured; production never fakes a successful send.
- DB-backed login rate limiting (5 failed attempts / 15 min), no Redis.
- Idempotent seed script (`npm run db:seed`) — Admin/Staff/Customer demo accounts, re-running skips existing users.
- 22 Vitest unit tests (validation schemas, password hashing round-trip, reset-token hashing/expiry logic) — all passing.

### Bugs fixed during Phase 1
- **`db.transaction()` doesn't exist on the `neon-http` driver at all** — found while testing reset-password (which needs an atomic password-update + token-consume). Switched `src/db/index.ts` from `drizzle-orm/neon-http` to `drizzle-orm/neon-serverless` (WebSocket `Pool`). This also unblocks the Phase 4 billing engine's required "one transaction per invoice."
- The new Pool must use the **direct** connection string, not the pooled/PgBouncer one — combining Neon's own WebSocket pooling with PgBouncer caused silent connection drops.
- Next.js was **webpack-bundling `ws`**, breaking its WebSocket connections (manifested as a ~15s hang then "Connection terminated unexpectedly"). Fixed via `experimental.serverComponentsExternalPackages: ["@neondatabase/serverless", "ws"]` in `next.config.mjs`.
- `useSearchParams()` on `/login` and `/reset-password` needed a `Suspense` boundary or the production build fails.

### Known limitation (documented, not fixed this pass)
- Password reset does not invalidate the user's *other* existing JWT sessions — they remain valid until their 7-day expiry. Proper invalidation would need a DB lookup on every request (checking token-issued-at against a `passwordChangedAt` column), which the current stateless-JWT middleware deliberately avoids for performance. Flagging in case this matters for the demo.

### Demo credentials
Seeded via `npm run db:seed` — passwords were randomly generated and printed once to the terminal (not committed anywhere). Admin email: `admin.brightloopoddohack@gmail.com`.

## UI Redesign — Concept A "Premium Golden" (✅ Complete)

Per your explicit design directive (superseding Phase 0's original dark-terminal-first UI direction): light-mode-primary, golden amber (#E5A50A) accent, Montserrat + Playfair Display + JetBrains Mono. Implemented as a token swap in `globals.css` plus new layout chrome — most existing component markup re-themes automatically since it was already built against CSS custom properties rather than hardcoded colors.

- Rewrote design tokens: light theme is now the default (`:root`), dark theme via `[data-theme="dark"]` or `prefers-color-scheme`, restrained success/danger/warning mapped to Emerald/Coral/Amber.
- Built `ThemeToggle` and `ReducedMotionToggle` client components (persisted to `localStorage`) — these were spec'd in Phase 0 but never actually built until now.
- Built `AdminShell` (sidebar + topbar layout) for `/admin/*` — nav items are role-aware (Staff only sees Dashboard; Admin also sees Staff) and reflect only routes that actually exist; no dead links to not-yet-built modules.
- Restyled buttons/badges/tables per the "restrained minimalism" brief (e.g. `.btn-danger` is now a tinted outline instead of a solid fill).
- Updated landing page and all four auth pages for the new palette/typography.
- Verified end-to-end after the change: build + 22 Vitest tests pass, and re-ran the full login/role-nav/access-control check (admin sees Staff nav + page, staff doesn't see the link and gets 403 hitting it directly, customer portal unaffected).

**Caveat:** I verified this via build output, compiled CSS (grepped for the new hex values and font names) and HTTP/HTML structure — I do not have browser screenshot capability in this environment, so I have not visually inspected it rendered. Worth a quick look at https://brightloop-app.vercel.app once deployed to confirm it reads the way you intended.

**Scope note:** most "modules" in your redesign brief (catalog, subscriptions, invoices, payments, product-wise staff assignment) don't exist in code yet — only Phase 0 (scaffold) and Phase 1 (auth) are built. Those pages will inherit these tokens automatically when built in Phases 2–6; there was nothing to redesign for them yet.

## Brand Logo Integration (✅ Complete)

You supplied a proper asset set (`public/brightloop-icon-{256,512,1024}.png`, `favicon.ico`, `apple-touch-icon.png`) — confirmed via PIL that the PNGs have real alpha transparency (corner pixel `(0,0,0,0)`), so the golden glow reads correctly on both light and dark backgrounds without a black box.

- Built a reusable `BrightloopLogo` component (`full` / `compact` / `symbol` variants, configurable size and colors) — single source of truth, no more duplicated inline SVG/logo markup.
- Wired it into `AuthShell` (login/signup/forgot/reset), `AdminShell` sidebar, and the customer portal header.
- Replaced the stale default Next.js `favicon.ico` and wired `apple-touch-icon.png` into `layout.tsx` metadata.
- Removed the unused leftover Geist font files from the original scaffold (never referenced in our CSS).

## Root Redirect Fix

`/` now redirects straight to `/login` (per your request — judges shouldn't land on a marketing page first). Implemented in `middleware.ts`, not as a page-level `redirect()` call — found during testing that an unconditional `redirect()` in a statically-optimized page doesn't reliably emit an HTTP `Location` header under `next start` in this Next.js version (confirmed via `curl -v`: 307 status but no `location:` header at all). Middleware-based redirects don't have this problem (verified: proper `location: /login` header).

## Phase 2 — Catalogue, Variants, Plans, Tax, Discounts, Staff Assignment (✅ Complete)

Full plan presented and approved before any schema change (see plan-mode transcript). Extended the Phase 0 catalogue tables rather than replacing them — all five (`products`, `product_variants`, `plans`, `tax_rules`, `discounts`) had 0 rows live, confirmed via `psql` before touching anything, so this carried zero data-loss risk; the 4 Phase-1 users and 1 customer were verified intact afterward.

**Schema changes** (`src/db/schema.ts`):
- `products`: added `sku` (unique), `category`, `description`, `currency`; replaced the `active` boolean with a 3-state `status` enum (`ACTIVE`/`INACTIVE`/`ARCHIVED`).
- `product_variants`: added `code` (unique per product), `description`, `costPrice`.
- `plans`: added the missing `productId` FK (plans weren't linked to a product at all before), `description`, `currency`.
- `tax_rules`: added `code`, `type`, `description`, `productId`/`category` applicability, `effectiveFrom`/`effectiveTo`.
- `discounts`: added `code`.
- New table `staff_product_assignments` (staffId, productId, assignedBy, unique on staff+product, indexed both ways).
- Added DB check constraints for all the "cannot be negative" / "end date ≥ start date" rules, on top of Zod validation.

**Migration approach**: `drizzle-kit push` needs a TTY for its rename-ambiguity resolver, which isn't available in this environment, and the safety-sandbox correctly blocked a blind `--force` auto-approve-all-destructive-statements run. Split into (1) a fully additive push — new enum, new table, new columns, zero drops — applied cleanly, and (2) one explicit, reviewed `ALTER TABLE products DROP COLUMN active` (dead code at that point, 0 rows) run directly. Re-ran `push` afterward to confirm zero remaining diff.

**API** (`src/app/api/`): full REST CRUD for products, variants, plans, tax rules, discounts, and staff assignments, all Zod-validated and role-gated via the existing `requireApiRole` helper. `POST /api/pricing-preview` recomputes everything server-side using a new integer-paise money utility (`src/lib/money.ts`) and a pure, independently-testable calculation module (`src/lib/pricing.ts`) — no floating-point arithmetic anywhere in the money path. Staff get a scoped `GET /api/products` (assigned products only, cost price stripped) and `GET /api/staff-assignments/me`.

**UI** (`src/app/admin/...` + `src/components/admin/*`): table + drawer pattern throughout (new shared `Drawer` component), a new "Catalogue" nav group in `AdminShell`, and a staff-only "My Products" / "Pricing Preview" view. `middleware.ts` extended with the new admin-only route prefixes.

**Seed**: `npm run db:seed:catalogue` — idempotent, matches the Phase 1 seed's check-before-insert pattern. Seeds the 10-product catalogue from the spec, BrightCloud's 3 storage-tier variants, one Monthly plan per product, a demo GST 18% tax rule, and the 3 named demo discounts. Verified idempotent by running twice.

**Testing**: 46 new Vitest unit tests (money math, pricing/discount-eligibility engine, catalogue Zod schemas) — all pure-function tests, no DB needed. 68/68 total passing (22 original + 46 new), `tsc --noEmit` clean, `next lint` clean, production build green (35/35 static pages). Beyond unit tests, ran a live end-to-end smoke pass against the real Neon DB using the existing demo-login flow: confirmed staff product-list/detail scoping, cost-price hiding, 403s on staff write attempts and on unassigned-product access, and the pricing preview's discount/tax math against hand-computed values — then deleted the one test assignment row created for that pass.

**Known limitations** *(resolved in Phase 2.1 below, except where noted)*: no automated test coverage for route-handler authorization logic itself (covered by live smoke passes instead, since there's no existing route-handler test harness in this project to extend).

## Phase 2.1 — Stabilisation, Security & Quality Fix (✅ Complete)

- **Security**: found a GitHub PAT embedded in `origin`'s URL in `.git/config` (local-only — never part of a clone/push, so never actually exposed on GitHub, but still rotated out of caution). Replaced with a clean HTTPS URL; `credential.helper=store` was already configured globally so future auth isn't affected. Scanned all git-tracked files for other secret patterns — only placeholder example strings found (`.env.example`, a teammate's README). **The token itself still needs manual revocation** — Claude never read its value (by design), so it can't identify which entry in your GitHub token list to revoke; that's a step only you can do (Settings → Developer settings → Personal access tokens).
- **Dependencies**: `@tsparticles/react`, `@tsparticles/slim`, `motion` had appeared in `package.json`/lockfile from outside this session (confirmed via `npm ls` + a full `grep` for imports — zero usage anywhere in `src/`). Removed; lockfile updated; build/tests reverified clean afterward.
- **Tax-rule overlap validation**: added `src/lib/tax-overlap.ts` — two *active* rules conflict only when they share the same name (case-insensitive), the same exact (productId, category) scope, and overlapping effective date ranges (nulls = open-ended). Matching on name is a deliberate design choice so legitimate multi-component taxes (e.g. "CGST 9%" + "SGST 9%" for the same scope) are never blocked, while an accidental duplicate "GST 18%" for the same scope/period is. Wired into `POST`/`PATCH /api/tax-rules`, each wrapped in `db.transaction()`. 9 new tests cover overlapping/adjacent/open-ended ranges, different product/category scopes, legitimate multi-component stacking, and inactive rules. Verified live against the real DB (duplicate rejected, distinct component allowed, different scope allowed).
- **Product categories**: added a `product_categories` table (id, name unique, active) with `products.category` and `tax_rules.category` converted to real foreign keys (`ON UPDATE CASCADE`, `ON DELETE RESTRICT`) — renaming a category now cascades to every product/tax rule using it automatically, and a category can't be deleted while in use (no delete endpoint exposed at all; only deactivate). Migrated in the correct order (table created and seeded with the original 11 names *before* the FK was added) so all 10 existing seeded products stayed valid throughout — verified via `psql` at each step. New `GET/POST /api/categories`, `PATCH /api/categories/[id]`, and a small `CategoryManager` panel on the Products page. Verified live: case-insensitive duplicate rejected, rename cascaded to an existing product, then reverted.
- **Regression + data integrity**: re-ran the full Vitest suite (82/82 passing — 68 from Phase 2 + 14 new), `tsc --noEmit`, `next lint`, and a production build (36/36 pages) — all clean. Final row-count check: 4 users, 1 customer, 10 products, 11 categories, 1 tax rule, 3 discounts, 0 staff assignments — matches expectations exactly, no data loss, no duplicate seed rows. `paviv1/` and `Brightloop-PoojaV3/` untouched.

No push performed.

## Not Yet Done (Phases 3–7)

| Phase | Scope |
|---|---|
| 3 | Quotation templates, subscriptions, status state machine + stepper UI |
| 4 | Billing engine: cron + "Run billing now", invoice generation with locking/idempotency, Vitest coverage |
| 5 | Payments: record/partial/auto-settle, idempotency, overpayment rejection |
| 6 | Finance dashboard, customer portal, public pricing page |
| 7 | Seed ~3,000 subscriptions / ~15,000 invoices, performance pass, mobile pass, final deploy |

## Notes

- GitHub's repo-homepage "Contributors" sidebar widget briefly showed a stale "claude" entry after a commit-history rewrite (removing an accidental `Co-Authored-By` trailer); confirmed via GitHub's own Contributors API that the real data was already clean — just a slow-clearing UI cache, not a data issue.
- Git remote currently has a GitHub personal access token embedded in plaintext in the push URL (`.git/config`) — worth rotating/moving to a credential helper when convenient.
