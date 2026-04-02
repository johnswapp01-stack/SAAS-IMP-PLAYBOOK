# structure.md

## Full Directory Layout

```
SaaS_IMP-Playbook_Items/
├── .claude/
│   ├── rules/              ← 9 standard operational rules files
│   └── reference/          ← On-demand reference docs
│       ├── stack-and-architecture.md
│       └── claude-md-health-framework.md
├── docs/                   ← Project documentation (currently empty)
├── e2e/                    ← Playwright E2E tests
├── src/
│   ├── app/                ← Next.js App Router
│   │   ├── (auth)/         ← Auth route group (unauthenticated)
│   │   │   ├── callback/route.ts     ← OAuth callback handler
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/    ← Authenticated app (requires session)
│   │   │   ├── layout.tsx            ← Dashboard shell (sidebar + nav, checks auth)
│   │   │   ├── dashboard/page.tsx    ← Overview dashboard
│   │   │   ├── engagements/
│   │   │   │   ├── page.tsx          ← Engagement list view
│   │   │   │   ├── new/page.tsx      ← Create engagement form
│   │   │   │   └── [id]/page.tsx     ← Engagement detail (tabbed)
│   │   │   ├── agents/page.tsx       ← AI agent console
│   │   │   ├── governance/page.tsx   ← Risk + delivery governance
│   │   │   ├── intelligence/page.tsx ← Cross-engagement analytics
│   │   │   ├── onboarding/page.tsx   ← First-time org setup wizard
│   │   │   └── settings/page.tsx     ← Org + profile settings
│   │   ├── (marketing)/    ← Public pages (no auth required)
│   │   ├── api/            ← Route Handlers
│   │   │   ├── agents/execute/route.ts
│   │   │   ├── email/send/route.ts
│   │   │   ├── engagements/create/route.ts
│   │   │   ├── org/create/route.ts
│   │   │   ├── seed/route.ts
│   │   │   ├── stripe/
│   │   │   │   ├── checkout/route.ts
│   │   │   │   ├── portal/route.ts
│   │   │   │   └── webhook/route.ts
│   │   │   └── waitlist/route.ts
│   │   ├── layout.tsx      ← Root layout (html, body, Providers)
│   │   ├── page.tsx        ← Landing page (public, 14.6 KB)
│   │   ├── providers.tsx   ← React Query provider wrapper
│   │   ├── error.tsx       ← Global error boundary
│   │   └── not-found.tsx   ← 404 page
│   ├── components/
│   │   ├── agents/         ← AI agent UI components
│   │   ├── engagements/    ← Engagement-specific UI
│   │   │   ├── engagement-header.tsx
│   │   │   ├── engagement-tabs.tsx
│   │   │   └── tabs/       ← 16 tab components
│   │   │       ├── agents-tab.tsx
│   │   │       ├── budget-tab.tsx
│   │   │       ├── checklist-tab.tsx
│   │   │       ├── client-updates-tab.tsx
│   │   │       ├── decisions-tab.tsx
│   │   │       ├── delivery-trends-tab.tsx
│   │   │       ├── health-tab.tsx
│   │   │       ├── lessons-tab.tsx
│   │   │       ├── project-plan-tab.tsx
│   │   │       ├── raci-tab.tsx
│   │   │       ├── reports-tab.tsx
│   │   │       ├── resources-tab.tsx
│   │   │       ├── risk-signals-tab.tsx
│   │   │       ├── scope-tab.tsx
│   │   │       ├── stakeholders-tab.tsx
│   │   │       └── time-entries-tab.tsx
│   │   ├── governance/     ← Governance/RACI/scope UI
│   │   ├── landing/        ← Marketing page components
│   │   │   └── waitlist-form.tsx
│   │   ├── layout/         ← Shell components
│   │   │   ├── dashboard-shell.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── sidebar.tsx
│   │   ├── settings/
│   │   │   └── compliance-rules-section.tsx
│   │   └── ui/             ← Primitive/shared UI components
│   ├── hooks/
│   │   └── use-org.tsx     ← Organization context hook (org ID, role, settings)
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts   ← Anthropic SDK instance
│   │   │   └── prompts.ts  ← Agent system prompts (also seeded in agent_definitions)
│   │   ├── agents/         ← Agent execution utilities
│   │   ├── email/
│   │   │   ├── client.ts   ← Resend SDK instance
│   │   │   └── templates.ts ← Email templates
│   │   ├── self-healing/   ← Self-healing utilities
│   │   ├── self-learning/  ← Self-learning utilities
│   │   ├── stripe/
│   │   │   └── client.ts   ← Stripe SDK instance
│   │   ├── supabase/
│   │   │   ├── client.ts   ← Browser client (createBrowserClient — Client Components only)
│   │   │   └── server.ts   ← Server client (createServerClient — Server Components + Route Handlers)
│   │   └── utils.ts        ← cn() utility (tailwind-merge + clsx) + shared helpers
│   ├── styles/
│   │   └── globals.css     ← Tailwind base + custom CSS
│   └── types/
│       ├── database.types.ts  ← Auto-generated Supabase types (do not hand-edit)
│       └── index.ts           ← Hand-authored domain types and contracts
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  ← 846-line baseline (33 tables, 41 enums, RLS, triggers — never modify)
│   └── seed/
│       └── acme_corp.sql           ← Standard dev/test seed data
├── e2e/                    ← Playwright E2E tests
├── CLAUDE.md
├── package.json
├── next.config.js
├── playwright.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Architectural Rules

### Server vs. Client Boundary
- Route groups `(auth)`, `(dashboard)`, `(marketing)` are Server Component territory by default.
- Add `"use client"` only at the **leaf component level** — never on page or layout files unless forced.
- Server Components fetch data directly via `createServerClient` from `@supabase/ssr`.
- Client Components use `createBrowserClient` from `@supabase/ssr` — never the server client.

### Two Supabase Clients — Never Mix Them
| Client | File | Where to Use |
|--------|------|-------------|
| Browser | `src/lib/supabase/client.ts` | Client Components only |
| Server | `src/lib/supabase/server.ts` | Server Components, Route Handlers, middleware |

### Data Flow
- Server Components fetch directly via server client.
- Mutations from Client Components go through Server Actions (`"use server"`) or Route Handlers (`src/app/api/`).
- Client Components read reactive data via React Query — not raw `useEffect` + fetch.
- `onSuccess` in React Query mutations must call `invalidateQueries()` to refresh stale data.

### Import Aliases
- `@/` maps to `./src/`. Always use `@/` imports, never relative `../../` paths that cross more than one level.

### Types
- `src/types/database.types.ts` — auto-generated by `npx supabase gen types`. Do not hand-edit.
- `src/types/index.ts` — hand-authored domain types, prop interfaces, API contracts.

### Component Organization
- Feature-specific components live in their feature folder (`components/engagements/`, `components/governance/`, etc.)
- Truly shared/primitive components live in `components/ui/`.
- Do not put feature logic into `components/ui/` — keep it generic.
- One component per file, named export matching the filename.

### Route Handler Conventions
- Named HTTP method exports: `GET`, `POST`, `PUT`, `DELETE`
- Response format: `{ data: T, error: null }` on success; `{ data: null, error: string }` on failure
- `try/catch` around all external calls (Supabase, Stripe, Anthropic, Resend)
