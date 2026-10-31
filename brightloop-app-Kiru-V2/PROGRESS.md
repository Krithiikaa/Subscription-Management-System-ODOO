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
