# pre-task-checklist.md

## Before Starting Any Task

Run through this checklist before writing a single line of code or modifying any file.

### 1. Scope Definition
- [ ] Can I state the task in one sentence? If not, it's too vague — ask for clarification.
- [ ] Do I know which files will change? List them before touching them.
- [ ] Is this a UI change, data change, API change, or DB change? Each has different ripple effects.
- [ ] Does this touch Supabase schema? If yes, a migration file is required.
- [ ] Does this touch billing (Stripe)? If yes, verify against the existing webhook handler and product/price IDs.
- [ ] Does this touch auth? If yes, test all auth states: logged-in, logged-out, expired session.

### 2. Anti-Pattern Scan
Before writing, check you're not about to introduce these known issues:

- **`useEffect` for data fetching** — use Server Components or React Query instead.
- **`"use client"` on a page that doesn't need it** — keep as much Server Component as possible.
- **Hardcoded Supabase URLs or API keys** — always use `process.env.NEXT_PUBLIC_SUPABASE_URL` etc.
- **Direct DB calls from Client Components** — data mutations go through Route Handlers or Server Actions.
- **Modifying `001_initial_schema.sql`** — create a new numbered migration instead.
- **`get-content -Raw` in any PowerShell scripts** — use `[System.IO.File]::ReadAllBytes()`.
- **Duplicate logic between CLAUDE.md and a rules file** — single source of truth, always.

### 3. Context Read
- Read the existing code in the files you're about to change. Don't assume structure — verify it.
- If touching a component in `src/components/`, check if similar components already exist that you can extend.
- If adding a new Supabase query, check `src/lib/` for existing query patterns to stay consistent.

### 4. Post-Change Steps
After every change, before marking done:
- [ ] Run `npm run lint` — zero errors, zero warnings.
- [ ] Run `npm run build` — clean build, no TypeScript errors.
- [ ] Run `npx playwright test` for any change touching UI or API routes.
- [ ] If schema changed: regenerate `src/types/supabase.ts` and commit alongside the migration.
- [ ] If this change ships to users: update the product version in life-os if significant.

See `testing.md` for the full 5-phase testing protocol.
