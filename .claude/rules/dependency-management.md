# dependency-management.md

## Package Manager
- **npm only.** Do not use yarn, pnpm, or bun. `package-lock.json` is the lock file — never delete or manually edit it.
- Always commit `package-lock.json` changes alongside `package.json` changes.

## Installing Dependencies
```powershell
npm install <package>          # production dependency
npm install -D <package>       # dev dependency
npm install                    # restore from lock file (CI / fresh clone)
```
Never use `--force` or `--legacy-peer-deps` without understanding the consequence. If a peer dep conflict blocks install, investigate before overriding.

## Version Pinning Strategy
- `^` (caret) is acceptable for most dependencies — allows minor + patch updates.
- Pin exactly (`"x.y.z"` no caret) for: Stripe SDK, Supabase client, Anthropic SDK. These have breaking surface areas and must be intentionally upgraded.
- Never use `*` or `latest`.

## Upgrading Dependencies
1. Check the changelog / release notes for breaking changes first.
2. Upgrade one major dependency at a time.
3. Run the full test suite (Playwright E2E) after any dependency upgrade before committing.
4. For Supabase SDK upgrades: re-run `npx supabase gen types` and update `src/types/supabase.ts`.

## Key Dependencies & Purposes
| Package | Purpose |
|---|---|
| `next` | Framework — App Router, Server Components, Route Handlers |
| `@supabase/supabase-js` + `@supabase/ssr` | Database + Auth client (SSR-aware) |
| `@anthropic-ai/sdk` | AI agent features |
| `stripe` | Subscription billing |
| `@tanstack/react-query` | Server state management on client |
| `react-hook-form` + `@hookform/resolvers` | Form handling |
| `zod` | Schema validation |
| `resend` | Transactional email |
| `tailwindcss` + `tailwind-merge` + `class-variance-authority` | Styling |
| `@playwright/test` | E2E testing (dev only) |

## What NOT to Add
- No duplicate state management libraries (no Redux, Zustand, Jotai — React Query handles server state, React state handles UI state).
- No additional CSS frameworks — Tailwind is the system.
- No ORM (Prisma, Drizzle) — Supabase client is the data layer.
