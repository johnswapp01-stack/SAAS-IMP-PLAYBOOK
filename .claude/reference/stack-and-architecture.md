# Stack and Architecture — Implementation Pro

Read this file when a task involves stack decisions, architecture discussions, data flow questions, API design, or understanding how the system is built.

---

## 1. Technology Stack

### Decided and In Use

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 16.2.1 | App Router, Server Components, Route Handlers, SSR |
| Language | TypeScript | 6.0.2 | Strict mode, ES2017 target, bundler module resolution |
| UI Library | React | 18.3.1 | Component rendering |
| Styling | Tailwind CSS | 3.4.17 | Utility-first CSS |
| Component Variants | class-variance-authority | 0.7.1 | Variant-driven component styling |
| Class Merging | tailwind-merge | 3.5.0 | Conflict-free class composition via `cn()` |
| Icons | lucide-react | 1.7.0 | Consistent icon set |
| State (Server) | TanStack React Query | 5.95.2 | Cache and sync server state in Client Components |
| State (UI) | React built-in hooks | — | Local UI state — no external state management library |
| Forms | react-hook-form | 7.72.0 | Form state management |
| Validation | zod | 4.3.6 | Schema validation + type inference (`@hookform/resolvers` 5.2.2) |
| Database | Supabase (PostgreSQL) | supabase-js 2.101.0, ssr 0.10.0 | Multi-tenant database, auth, realtime, storage |
| AI (Primary) | Anthropic Claude API | SDK 0.82.0 | Document generation, risk analysis, agent execution |
| AI (Fallback) | OpenAI | Planned | Redundancy for AI operations if Anthropic is unavailable |
| Billing | Stripe | 21.0.1 | Subscription management, checkout, customer portal |
| Email | Resend | 6.10.0 | Transactional email (client updates, invitations) |
| Deployment | Vercel | — | Serverless hosting, edge CDN, preview deployments |
| E2E Testing | Playwright | 1.59.1 | Cross-browser (chromium + mobile-chrome/Pixel 5) |
| Package Manager | npm | — | Only permitted package manager |

**AI Model in use:** `claude-sonnet-4-20250514` (stored in `agent_executions.model_used`)

### Not Permitted

| What | Why |
|------|-----|
| Redux, Zustand, Jotai | React Query handles server state; React hooks handle UI state |
| Additional CSS frameworks | Tailwind is the sole styling system |
| Prisma, Drizzle (ORMs) | Supabase client is the data layer |
| Jest, Vitest | Playwright E2E is the sole test runner |
| yarn, pnpm, bun | npm only — `package-lock.json` is the lock file |

---

## 2. Design Principles

1. **Server-first rendering.** Server Components are the default. `"use client"` only at the leaf level when interactivity or browser APIs are required.
2. **Separation of concerns.** Each operational layer has its own tables, API routes, and UI components. Layers communicate through the database, not direct function calls.
3. **Schema-driven contracts.** Zod schemas define validation for all forms and API inputs. TypeScript types are inferred from schemas — never hand-authored separately.
4. **Org-scoped data isolation.** Every data table includes `org_id`. RLS policies enforce org membership via `is_org_member(org_id)` helper.
5. **Mobile-first design.** All UI designed for 375px first, enhanced for tablet (768px) and desktop (1024px+). Touch targets minimum 44px.
6. **Graceful degradation.** If AI service is unavailable, core engagement management features remain functional.

---

## 3. Data Flow Patterns

**Server Component Data Fetching:**
```
Browser Request → Vercel Edge
  → Next.js Server Component
    → createServerClient() from @supabase/ssr
      → Supabase PostgreSQL (RLS enforced)
    → Return rendered HTML
```

**Client Component Mutations:**
```
User Action → Client Component ("use client")
  → React Query useMutation()
    → POST to Route Handler (src/app/api/*)
      → createServerClient() from @supabase/ssr
        → Supabase PostgreSQL (RLS enforced)
      → Return { data, error }
    → onSuccess: invalidateQueries() to refresh cache
```

**AI Agent Execution:**
```
User triggers agent (or scheduled trigger)
  → POST /api/agents/execute
    → Load agent_definition (system_prompt, I/O schema)
    → Build context from engagement data
    → Call Anthropic Claude API (claude-sonnet-4-20250514)
    → Store execution log (tokens, duration, cost) in agent_executions
    → Store artifact in agent_artifacts
    → If propose-and-wait: return for user review
    → If auto-execute: apply output directly
```

**Stripe Billing:**
```
User selects plan → POST /api/stripe/checkout → Stripe Checkout Session
  → User completes payment
  → Stripe webhook → POST /api/stripe/webhook
    → Handle: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
    → Update organization.plan in Supabase

User manages subscription → POST /api/stripe/portal → Stripe Customer Portal URL
```

---

## 4. Authentication Architecture

- **Provider:** Supabase Auth (email/password + OAuth)
- **Session management:** Cookie-based via `@supabase/ssr` middleware
- **Route protection:** `(dashboard)` layout.tsx checks auth state, redirects to `/login` if unauthenticated
- **OAuth callback:** `/app/(auth)/callback/route.ts` exchanges auth code for session
- **Profile auto-creation:** DB trigger `on_auth_user_created` creates a `profiles` row on signup

---

## 5. Multi-Tenancy Model

- Every data table (except `profiles`, `agent_definitions`, `system_health_checks`, `error_patterns`) has `org_id`
- RLS helper function `is_org_member(org_id)` validates authenticated user's org membership
- Org roles: `owner`, `admin`, `member`, `viewer`
- Admin-only operations have additional RLS policies checking the `role` column in `org_members`

---

## 6. Database Schema

**Baseline:** `supabase/migrations/001_initial_schema.sql` (846 lines — never modify)
**33 tables across 6 domains, 41 custom enum types, 41 indexes**

| Domain | Table Count | Tables |
|--------|------------|--------|
| Foundation | 13 | profiles, organizations, org_members, engagements, scope_items, stakeholders, decisions, raci_items, checklist_items, lessons_learned, status_reports, activity_log, automation_rules |
| L1 Operations | 6 | resource_profiles, resource_allocations, time_entries, financial_tracking, compliance_rules, compliance_violations |
| L2 Governance | 4 | project_plans, risk_signals, client_updates, delivery_signals |
| L3 Agents | 4 | agent_definitions (6 seeded agents), agent_tasks, agent_executions, agent_artifacts |
| Self-Learning | 3 | learning_feedback, org_learning_context, outcome_correlations |
| Self-Healing | 3 | system_health_checks, self_healing_events, error_patterns |

**Indexing strategy:** 41 indexes covering org-scoped lookups, engagement-scoped lookups, status filters, and time-series queries.

**pgvector:** Extension is commented out in 001. Enable only when Phase 6 semantic search begins.

---

## 7. API Routes

### Current Route Handlers

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/agents/execute` | POST | Trigger AI agent execution |
| `/api/email/send` | POST | Send transactional email |
| `/api/engagements/create` | POST | Create a new engagement |
| `/api/org/create` | POST | Create a new organization |
| `/api/seed` | POST | Seed Acme Corp dev data |
| `/api/stripe/checkout` | POST | Create Stripe Checkout session |
| `/api/stripe/portal` | POST | Generate Stripe Customer Portal URL |
| `/api/stripe/webhook` | POST | Handle Stripe webhook events |
| `/api/waitlist` | POST | Add email to pre-launch waitlist |

### API Routes Needed (Not Yet Built)

| Route | Method | Phase |
|-------|--------|-------|
| `/api/engagements/[id]` | GET, PUT, DELETE | Phase 1 |
| `/api/engagements/[id]/scope` | GET, POST, PUT, DELETE | Phase 2 |
| `/api/engagements/[id]/stakeholders` | GET, POST, PUT, DELETE | Phase 2 |
| `/api/engagements/[id]/raci` | GET, POST, PUT, DELETE | Phase 2 |
| `/api/engagements/[id]/checklist` | GET, POST, PUT | Phase 2 |
| `/api/engagements/[id]/reports` | GET, POST | Phase 2 |
| `/api/engagements/[id]/time-entries` | GET, POST, PUT | Phase 3 |
| `/api/engagements/[id]/financials` | GET, PUT | Phase 3 |
| `/api/engagements/[id]/risks` | GET | Phase 4 |
| `/api/engagements/[id]/client-updates` | GET, POST, PUT | Phase 4 |
| `/api/agents/[id]/tasks` | GET | Phase 5 |
| `/api/agents/[id]/feedback` | POST | Phase 6 |

### API Design Conventions
- Named HTTP method exports: `GET`, `POST`, `PUT`, `DELETE`
- Request validation via Zod schemas
- Response format: `{ data: T, error: null }` on success / `{ data: null, error: string }` on failure
- `try/catch` around all external service calls (Supabase, Stripe, Anthropic)
- Server-side error logging; safe messages returned to client

---

## 8. External Service Configuration

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon key (public, RLS-restricted)
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (server-side only, bypasses RLS — use only for system operations)

### Anthropic
- `ANTHROPIC_API_KEY` — Server-side only
- Default model: `claude-sonnet-4-20250514`

### Stripe
- `STRIPE_SECRET_KEY` — Server-side only
- `STRIPE_WEBHOOK_SECRET` — Server-side only (webhook signature verification)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Client-side

### Resend
- `RESEND_API_KEY` — Server-side only

---

## 9. Deployment Architecture

| Environment | Platform | Purpose |
|-------------|---------|---------|
| Local Dev | `npm run dev` (localhost:3000) | Development and manual testing |
| Preview | Vercel Preview Deployments | PR-level preview URLs |
| Production | Vercel Production | Live application |

**CI/CD:** Currently manual via `npx vercel`. Planned: automated on push to `main` via Vercel Git integration (Phase 1 tech debt).

**Pre-deployment checklist:**
1. All 5 testing phases pass locally
2. `npm run build` succeeds
3. No `.env` files in the commit
4. Feature branch merged to `main` via PR

---

## 10. Development Phases

| Phase | Weeks | Scope | Status |
|-------|-------|-------|--------|
| 1: Foundation | 1-6 | Auth, orgs, engagement CRUD, dashboard, mobile-first UI | In progress |
| 2: Templates & Data Entry | 7-12 | All 16 engagement tabs with functional CRUD | Not started |
| 3: L1 Operations | 13-18 | Resource management, time tracking, financials, compliance | Not started |
| 4: L2 Governance | 19-26 | AI risk detection, health scoring, client updates | Not started |
| 5: L3 Agents | 27-34 | Six AI agents, artifact generation, console UI | Not started |
| 6: Self-Learning | 27-34 (parallel) | Feedback pipeline, org context, prompt refinement | Not started |
| 7: Self-Healing | 27-34 (parallel) | Health monitoring, auto-recovery, error patterns | Not started |

---

## 11. Known Technical Debt

| Item | Type | Impact | Phase to Address |
|------|------|--------|-----------------|
| No unit tests (Playwright E2E only) | Testing gap | Medium | Phase 2+ |
| pgvector disabled | Feature gap | Low until Phase 6 | Phase 6 |
| `db:migrate` script is a no-op | DX friction | Low | Phase 1 |
| No automated CI/CD pipeline | Process gap | Medium | Phase 1 |
| OpenAI fallback not implemented | Reliability gap | Medium | Phase 5 |
| No rate limiting on API routes | Security gap | Medium | Phase 3 |
| Server Actions body limit 2MB | Constraint | Low | Monitor |

---

## 12. Security Architecture

- Supabase Auth for identity (email/password + OAuth)
- Cookie-based sessions via `@supabase/ssr`
- RLS on all tables — no data access without authenticated session and org membership
- Admin-only operations gated by `role` in `org_members`
- Data encrypted at rest (AES-256) and in transit (TLS 1.3)
- API keys in environment variables only — never in code
- `.env.local` and `.env*.local` in `.gitignore`
- Stripe webhooks verified via `STRIPE_WEBHOOK_SECRET` signature check
- Route Handlers validate all input via Zod before processing
- Server Actions body size limited to 2MB (`next.config.js`)
