# coding-patterns.md

## Language & Compiler
- TypeScript strict mode (`"strict": true`) — no `any`, no `as unknown as X` escapes.
- Target ES2017. Module resolution: `bundler`. `noEmit: true` — Next.js owns the emit.
- All files `.ts` or `.tsx`. Never `.js` for new code.

## React / Next.js App Router
- Server Components are the default. Only add `"use client"` when the component needs interactivity, browser APIs, or hooks.
- Data fetching happens in Server Components or Route Handlers — never `useEffect` for initial data.
- Use `async/await` in Server Components directly. Do not wrap in `useEffect`.
- Client Components use TanStack React Query for server state (`useQuery`, `useMutation`). No manual fetch in `useEffect`.
- Page files live in `src/app/(group)/page.tsx`. Layout files in `src/app/(group)/layout.tsx`.
- Route Handlers live in `src/app/api/[route]/route.ts`. Export named HTTP methods (`GET`, `POST`, etc.).

## Component Architecture
- Use `class-variance-authority` (cva) for variant-driven components. No inline conditional class strings for variants.
- Use `tailwind-merge` (via `cn()` utility) for merging class names. Import `cn` from `@/lib/utils`.
- Component files: one component per file, named export matching the filename (e.g., `EngagementCard.tsx` exports `EngagementCard`).
- Co-locate component-specific types in the component file. Shared types belong in `src/types/`.

## Forms & Validation
- All forms use `react-hook-form` + `zod` resolver (`@hookform/resolvers/zod`).
- Define Zod schemas in `src/lib/validations/` or co-located with the form. Schema first, then infer the TypeScript type (`z.infer<typeof schema>`).
- Never validate form data manually. The schema is the contract.

## Error Handling
- Server Actions and Route Handlers return typed result objects: `{ data, error }` — never throw bare strings.
- Use `try/catch` around all Supabase calls and Stripe calls. Log errors server-side; return safe messages to the client.
- Client error boundaries: use the `error.tsx` convention at the route group level.

## Naming Conventions
- Variables/functions: `camelCase`
- Components: `PascalCase`
- Types/Interfaces: `PascalCase`, prefix interfaces with `I` only when disambiguating from a class
- Constants: `SCREAMING_SNAKE_CASE` for true module-level constants; `camelCase` for config objects
- Zod schemas: `camelCase` with `Schema` suffix (e.g., `engagementSchema`)
- Database column → TS property: snake_case DB columns map to camelCase via explicit mapping in `src/types/`

## Import Order (enforced by ESLint)
1. React / Next.js framework imports
2. Third-party packages
3. Internal `@/` path aliases (lib, types, hooks)
4. Internal `@/components`
5. Relative imports
6. Types (`import type`)

No default exports from non-page/non-layout files. Pages and layouts may use default exports (Next.js requirement).
