# testing.md

## Test Stack
- **E2E only:** `@playwright/test` — this is the primary (and only configured) test runner.
- No Jest or Vitest is installed. Unit tests are not currently part of the pipeline.
- Playwright config: `playwright.config.ts` at root.
- E2E test files: `e2e/` directory.
- Projects: `chromium` (Desktop Chrome) + `mobile-chrome` (Pixel 5 emulation).

## Test Commands
```powershell
npx playwright test                  # Full E2E suite (headless)
npx playwright test --ui             # Interactive UI mode
npx playwright test --headed         # Visible browser
npx playwright test e2e/auth.spec.ts # Single spec file
npm run lint                         # ESLint
npx tsc --noEmit                     # TypeScript type check
npm run build                        # Production build (also catches TS errors)
```

## Mandatory 5-Phase Testing Protocol

Every code change — no exceptions — completes all 5 phases before being marked done.

---

### Phase 1: Static Analysis
Run immediately after any code change. Fix everything before proceeding.

1. `npm run lint` — zero errors, zero warnings
2. `npx tsc --noEmit` — zero type errors
3. Remove dead code and unused imports your change orphaned

**Exit:** All static checks pass with zero errors.

---

### Phase 2: Build Verification
```powershell
npm run build
```
- Fix any build warnings or errors. Warnings are bugs in waiting.
- Verify `.next/` output exists and has a reasonable size — don't just check exit code 0.

**Exit:** Clean build, zero warnings, artifact verified.

---

### Phase 3: E2E Tests
```powershell
npx playwright test
```
- Run the full suite — not just tests for your change area.
- If a test fails: determine if your change caused it (fix the code) or if it's pre-existing (flag it explicitly — do not silently ignore).
- If no E2E tests exist for the flow you changed: write them. At minimum cover the happy path and one error state.

**Exit:** Full suite passes. New tests exist for changed flows.

---

### Phase 4: Real-World Functional Testing

**4A: Desktop** — Start `npm run dev`. Navigate to every affected screen. Interact with every changed button, form, and link. Check browser console: zero errors.

**4B: Mobile** — Resize to 375px width (or use Playwright mobile-chrome project). Repeat all flows from 4A. Watch for: layout breaks, overlapping elements, touch targets under 44px, horizontal scroll.

**4C: State & Edge Cases:**
- Empty state: no data in the list/view — does the UI handle it?
- Error state: kill the API or pass bad data — does it show a useful error or white-screen?
- Loading state: throttle network to Slow 3G — do loaders appear?
- Auth states (if relevant): logged-in, logged-out, expired session, insufficient org role.
- Double-submit: click a form submit button twice quickly — no duplicate records.

**Exit:** All flows work on desktop AND mobile. Zero console errors. Edge cases handled.

---

### Phase 5: Regression Check
Manually test at least 3 core flows you did NOT change:
1. Auth flow (login → dashboard)
2. Primary CRUD on engagements
3. Template download or core dashboard feature

If a regression is found: fix it, restart from Phase 1 for that fix.

**Exit:** Core app functionality verified intact.

---

## Self-Healing Loop
If any phase fails, activate the loop in `Self-Healing.md`. Do not skip ahead to "just the failing phase." Restart Phase 1 after every fix. Log the incident in `Self-Learning.md`.

## Reporting Format (What / Why / How)
When the full protocol passes, report results using the What/Why/How framework:
- **What** was tested (change summary, files touched, flows exercised)
- **Why** these results matter (confidence level, risk areas covered and remaining)
- **How** the testing was executed (exact commands, viewports, data used, any self-healing loops)
