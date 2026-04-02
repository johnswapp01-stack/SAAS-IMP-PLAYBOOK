# structure.md

## Root Layout
```
SaaS_IMP-Playbook_Items/
├── .claude/
│   └── rules/              ← operational rules (9 standard files)
├── docs/                   ← project documentation (currently empty)
├── e2e/                    ← Playwright end-to-end tests
├── src/
│   ├── app/                ← Next.js App Router
│   │   ├── (auth)/         ← Auth route group (login, signup, reset)
│   │   ├── (dashboard)/    ← Authenticated app routes
│   │   ├── (marketing)/    ← Public marketing pages
│   │   └── api/            ← Route Handlers
│   ├── components/
│   │   ├── agents/         ← AI agent UI components
│   │   ├── engagements/    ← Engagement management UI
│   │   ├── governance/     ← Governance/RACI/scope UI
│   │   ├── landing/        ← Marketing/landing page components
│   │   ├── layout/         ← Nav, sidebar, shell components
│   │   ├── settings/       ← Account/org settings UI
│   │   ├── templates/      ← Playbook template components
│   │   └── ui/             ← Primitive/shared UI (buttons, modals, etc.)
│   ├── hooks/              ← Custom React hooks
│   ├── lib/                ← Shared utilities and service clients
│   ├── styles/             ← Global CSS (Tailwind base)
│   └── types/              ← Shared TypeScript types + supabase.ts
├── supabase/
│   ├── migrations/         ← SQL migration files (NNN_name.sql)
│   └── seed/               ← Seed data (Acme Corp scenario)
├── CLAUDE.md               ← Project context (lean — see rules/ for detail)
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Architectural Rules

**Server vs. Client boundary:**
- Route groups `(auth)`, `(dashboard)`, `(marketing)` are Server Component territory by default.
- Only add `"use client"` at the leaf component level — never on page or layout files unless required.
- Supabase server client: `createServerClient` from `@supabase/ssr` in Server Components and Route Handlers.
- Supabase browser client: `createBrowserClient` from `@supabase/ssr` in Client Components.

**Data flow:**
- Server Components fetch directly via Supabase server client.
- Mutations from Client Components go through Server Actions (`"use server"`) or Route Handlers (`src/app/api/`).
- Client Components read cached/reactive data via React Query — not raw fetch.

**Import aliases:**
- `@/` maps to `./src/`. Always use `@/` imports, never relative `../../` paths that traverse more than one level.

**API Routes:**
- Stripe webhooks: `src/app/api/stripe/webhook/route.ts`
- Anthropic AI proxy: `src/app/api/` (check existing route structure before adding new ones)
- Auth callbacks: handled by Supabase SSR middleware

**Shared types:**
- `src/types/supabase.ts` — auto-generated from Supabase schema. Do not hand-edit.
- `src/types/` — hand-authored types for domain models, props, and API contracts.

**Component organization:**
- Feature-specific components live in their feature folder (`components/engagements/`, etc.).
- Truly shared/primitive components live in `components/ui/`.
- Do not put feature logic into `components/ui/` — keep it generic.
