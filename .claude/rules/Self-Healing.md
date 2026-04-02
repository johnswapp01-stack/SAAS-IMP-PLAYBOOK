# Self-Healing.md

## Mandatory Loop — Activates on Any Failure

When ANY test, build, lint, or type check fails, this loop is not optional.

```
WHILE (any_check_fails) {
    1. DIAGNOSE  → Read the actual error. Trace the stack. Do not guess.
    2. FIX       → Apply the minimal, targeted fix. Patch symptoms = technical debt.
    3. RESTART   → Return to Phase 1 of testing.md and run the ENTIRE protocol again.
    4. LOG       → Append an entry to Self-Learning.md.
}
```

## Rules for the Loop

- **Restart from Phase 1 every time.** A fix is a code change. Every code change gets the full protocol. No shortcuts back to "just the phase that failed."
- **If you are on the 3rd iteration for the same change:** stop. The fix strategy is wrong. State what's happening and propose an alternative approach before continuing.
- **The loop exits ONLY when all phases pass on a single clean run.** "It passed the test I just ran" is not exit criteria. All phases, clean run.

## Common Failure Patterns in This Repo

| Symptom | First place to look |
|---|---|
| TypeScript error after Supabase change | `src/types/supabase.ts` not regenerated |
| Build error after adding `"use client"` | Server Component receiving non-serializable props |
| Playwright test failing locally but not in CI | `baseURL` env var mismatch or auth state not seeded |
| Stripe webhook 400 error | `STRIPE_WEBHOOK_SECRET` not set in local `.env.local` |
| Supabase auth loop | Session cookie stale — check `@supabase/ssr` middleware config |
| React Query stale data after mutation | `invalidateQueries` missing in `onSuccess` callback |

## What NOT to Do
- Do not comment out failing tests to make the suite green.
- Do not disable TypeScript strict checks (`// @ts-ignore`, `// @ts-expect-error`) as a fix.
- Do not downgrade a package to escape a type error without understanding why.
- Do not mark a task done while any phase is still red.
