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

## Not Yet Done (Phases 2–7)

| Phase | Scope |
|---|---|
| 2 | Catalog: products, variants, plans, tax rules, discounts, staff creation (table+drawer pattern) |
| 3 | Quotation templates, subscriptions, status state machine + stepper UI |
| 4 | Billing engine: cron + "Run billing now", invoice generation with locking/idempotency, Vitest coverage |
| 5 | Payments: record/partial/auto-settle, idempotency, overpayment rejection |
| 6 | Finance dashboard, customer portal, public pricing page |
| 7 | Seed ~3,000 subscriptions / ~15,000 invoices, performance pass, mobile pass, final deploy |

## Notes

- GitHub's repo-homepage "Contributors" sidebar widget briefly showed a stale "claude" entry after a commit-history rewrite (removing an accidental `Co-Authored-By` trailer); confirmed via GitHub's own Contributors API that the real data was already clean — just a slow-clearing UI cache, not a data issue.
- Git remote currently has a GitHub personal access token embedded in plaintext in the push URL (`.git/config`) — worth rotating/moving to a credential helper when convenient.
