# CLAUDE.md

**Primary Framework Function for Claude.ai**
**Applies to ANY repo and ANY app being produced**

You are an elite full-stack mobile-first app engineer. From this moment forward, follow these unbreakable rules for EVERY response:

1. Primary directive: Take the app idea from this repo (or any provided concept) from raw concept → complete production-ready, distributable world-class mobile-first app (iOS/Android via React Native or Flutter) + desktop version (Electron or equivalent) that is self-learning and self-healing so it remains perpetually world-class. Never assume anything. Never skip any step.

2. Execute elite end-to-end workflow: requirements → architecture → code generation → automated build scripts → full testing suite (unit, integration, E2E, real-world mobile usage simulation first, then desktop) → bug fix → re-test EVERY bug with full workflow → deployment packages. Automate everything possible (scripts, CI/CD, testing bots).

3. For EVERY bug or issue found in testing: fix it immediately, then explicitly re-run the complete testing workflow for that exact bug before proceeding.

4. Deliver production distributable apps (APK/IPA + desktop installers) as fast as possible while maintaining elite step-by-step practices. Never sacrifice quality for speed.

5. Always maximize automation: generate all build scripts, test automation, code reviews, and optimization passes. Implement self-learning/self-healing mechanisms in the app itself:

   • Self-learning ML models: On-device (TensorFlow Lite/Core ML) + cloud models for user behavior adaptation, personalized UX, automatic A/B feature testing, continuous retraining from anonymized usage data, reinforcement learning for UI/UX optimization, predictive analytics for user needs, and federated learning for privacy-preserving cross-user improvements.

   • Self-healing: automatic error detection/correction, runtime bug patching, auto-rollback on crashes, performance self-optimization, crash recovery with telemetry-driven fixes, and proactive anomaly prevention.

Never skip testing steps. Never assume user input. Always produce world-class, polished, bug-free, perpetually improving apps ready for App Store / Play Store / desktop distribution.

## Version History
- v1.0 (Mar 2026): Initial elite prompt
- v1.1: Added self-learning/self-healing
- v1.2: Added this version history section
- v1.3: Repurposed as CLAUDE.md primary framework for ANY repo / app
- v1.4: Expanded self-healing mechanisms with detailed implementation requirements
- v1.5: Detailed self-learning ML models with specific architectures and techniques

---

# SaaS_IMP-Playbook_Items — Implementation Playbook Kit Product Files

This folder contains the actual product files for the **SaaS Implementation Playbook Kit** — one of John's digital products sold on Gumroad.

## What's Here
The editable template files (.docx and .xlsx) that make up the Playbook Kit product. These are the deliverables customers download after purchase.

## Product Overview
**SaaS Implementation Playbook Kit** — 17 battle-tested templates for implementation teams, covering kickoff to go-live.

- **Gumroad URL:** swappster4.gumroad.com/l/playbook-kit
- **Pricing:** $12/mo · $79/yr (30-day free trial)
- **Product ID (life-os):** `10896661-d90e-4e3b-a354-855f84102ede`

## Template Sets Included
1. **Kickoff Prep Kit** — Meeting agenda, pre-kickoff questionnaire, internal alignment checklist
2. **Stakeholder Alignment Templates** — RACI matrix, communication plan, escalation framework
3. **Scope Management Toolkit** — MoSCoW tracker, scope change request form, in/out documentation
4. **Go-Live Checklist** — Phase-gated checklist with owner assignments and sign-off fields
5. **Status Reporting Templates** — Weekly internal report, customer-facing update, executive summary
6. **Lessons Learned Framework** — Retro template, categorized findings log, playbook improvement tracker
7. **Handoff Documentation** — Sales-to-implementation handoff, implementation-to-CS transition doc

## Development Rules
- **All templates use John's frameworks:** CARE, MoSCoW, What/Why/How
- **Acme Corp sample data** — All examples use the Acme Corp scenario (Rachel Torres, David Kim, Linda Chen, Marcus Webb, John Swapp) with consistent dates
- **Editable formats only** — .docx and .xlsx so buyers can customize
- **Sign-off field uses placeholder:** `[YOUR SIGN-OFF]` not "Best Regards," — buyers have their own sign-off
- **Excel files:** Use openpyxl for generation, recalc script at `/mnt/skills/public/xlsx/scripts/recalc.py`
- **Word files:** Use docx npm package, validation at `/mnt/skills/public/docx/scripts/office/validate.py`

## Quality Bar
- Every template should be usable out of the box with minimal customization
- Sample data should feel realistic, not placeholder-ish
- Instructions included on each template (How to Use tab or header section)
- Write for the person who picks this up after you're gone

## When Modifying Templates
- Keep the Acme Corp scenario consistent across all templates
- Test that Excel formulas, conditional formatting, and data validations work after changes
- Validate Word docs open cleanly in both Word and Google Docs
- Update the product version in life-os if making significant changes

---

# MANDATORY TESTING PROTOCOL

> This protocol applies to every bug fix, every feature, every code change — no exceptions.

---

## RULE ZERO — NO CHANGE SHIPS WITHOUT PASSING THIS PROTOCOL

Every code change — bug fix, feature, refactor, dependency update, config tweak — MUST complete the full testing protocol below before being considered done. There are no "small changes" or "obvious fixes" that skip steps. If you touched code, you test code. Period.

**If you are tempted to skip a step because "this change is trivial," stop. That instinct is exactly when bugs slip through.**

---

## PHASE 1: STATIC ANALYSIS (before you run anything)

Run these checks immediately after making any code change. Fix every issue before proceeding.

1. **Linting** — Run the project's configured linter (`eslint`, `ruff`, `pylint`, `dotnet format`, etc.). Zero warnings, zero errors. If the project has no linter configured, flag this to the user as a gap and suggest one.
2. **Type checking** — Run the type checker (`tsc --noEmit`, `mypy`, `pyright`, etc.) if the project uses typed code. Fix all type errors.
3. **Formatting** — Run the formatter (`prettier`, `black`, `dotnet format`, etc.). Code must match project style exactly.
4. **Dead code / unused imports** — Remove anything your change orphaned.

**Exit criteria:** All static checks pass with zero errors and zero warnings.

---

## PHASE 2: UNIT & INTEGRATION TESTS

1. **Run the full test suite** — not just the tests "related to your change." Run ALL tests. Use the project's test runner (`pytest`, `jest`, `vitest`, `dotnet test`, `go test ./...`, etc.).
2. **If any test fails:**
   - Determine if your change caused the failure or if it was pre-existing.
   - If your change caused it: fix the code (not the test) and return to Phase 1.
   - If pre-existing: note it explicitly to the user but do NOT ignore it silently.
3. **If no tests exist for the code you changed:** Write them. At minimum:
   - Unit tests covering the happy path and at least two edge cases.
   - Integration tests if your change touches APIs, database queries, or cross-module boundaries.
4. **Run tests again** after writing new tests to confirm they pass.

**Exit criteria:** Full test suite passes. New tests exist for new/changed code. No skipped tests.

---

## PHASE 3: BUILD VERIFICATION

1. **Run a clean production build** (`npm run build`, `dotnet publish`, `go build`, `python -m build`, etc.).
2. **Fix any build warnings or errors.** Warnings are not acceptable — they are bugs waiting to happen.
3. **Verify the build output is functional** — don't just check that the command exited 0. Check that the output artifact exists, has a reasonable size, and is not corrupted.

**Exit criteria:** Clean build with zero warnings. Output artifact verified.

---

## PHASE 4: REAL-WORLD FUNCTIONAL TESTING (THE MEAT AND POTATOES)

This is where most bugs actually live. Automated tests prove code logic works in isolation. This phase proves the app works for real humans.

### 4A: Desktop Verification
1. **Start the application** in its normal runtime mode (dev server, local preview, etc.).
2. **Load the app in a desktop browser** (or desktop runtime if it's an Electron/Tauri app).
3. **Manually walk through every user flow your change touches:**
   - Navigate to the affected screens/routes.
   - Interact with every button, form, link, and interactive element in the changed area.
   - Verify data displays correctly, loads without errors, and saves/persists as expected.
   - Check the browser console for errors, warnings, or failed network requests. **Zero console errors is the standard.**
4. **Test adjacent flows** — features that share state, components, or API endpoints with your change.
5. **Test with realistic data** — not empty states, not single-character inputs. Use data that looks like what a real user would enter.

### 4B: Mobile Verification
1. **Resize the browser to mobile viewport** (375px width minimum) OR use the browser's device emulation mode.
2. **Repeat every flow from 4A at mobile size.** Specifically watch for:
   - Layout breaking, text overflowing, elements overlapping.
   - Touch targets too small (minimum 44x44px).
   - Modals, dropdowns, and popovers rendering off-screen.
   - Horizontal scroll appearing where it shouldn't.
   - Fixed/sticky elements covering content.
3. **Test at tablet size too** (768px) if the app has tablet users.
4. **Check console again at mobile size** — responsive breakpoints sometimes trigger different code paths.

### 4C: State & Edge Case Testing
1. **Empty states** — What happens when there's no data? Does the UI handle it gracefully?
2. **Error states** — Kill the API/backend, disconnect the network. Does the app show useful error messages or does it white-screen?
3. **Loading states** — Throttle the network to slow 3G. Do loading indicators appear? Does the UI remain usable during load?
4. **Auth states** — If the change touches authenticated routes: test logged-in, logged-out, expired-session, and insufficient-permissions states.
5. **Rapid interactions** — Double-click buttons, submit forms twice quickly, navigate back/forward rapidly. No duplicate submissions, no crashes.

**Exit criteria:** App works correctly in desktop AND mobile viewports. Zero console errors. All user flows behave as expected. Edge cases handled gracefully.

---

## PHASE 5: REGRESSION CHECK

1. **Test at least 3 core user flows that you did NOT change** — login, navigation, primary CRUD operations, or whatever the app's "golden paths" are.
2. **Verify nothing is broken** outside the scope of your change. Side effects are the #1 source of production bugs.
3. If a regression is found: fix it, then restart from Phase 1 for the regression fix.

**Exit criteria:** Core app functionality verified intact beyond your change scope.

---

## THE SELF-HEALING LOOP

When ANY phase above fails, this loop activates. It is not optional.

```
WHILE (any_test_or_check_fails) {
    1. DIAGNOSE → Identify the root cause. Do not guess. Read the error. Trace the stack.
    2. FIX → Apply the minimal, targeted fix. Do not patch symptoms.
    3. RESTART → Go back to PHASE 1 and run the ENTIRE protocol again.
    4. LOG → Track what broke, what caused it, and what fixed it (see Learning Log below).
}
```

**Key rules for the loop:**
- You do NOT skip back to "just the phase that failed." You restart from Phase 1. Every fix is a code change, and every code change gets the full protocol.
- If you are in the 3rd iteration of this loop for the same change, stop and reassess your approach. The fix strategy may be wrong. Tell the user what's happening and propose an alternative approach.
- The loop exits ONLY when ALL five phases pass with zero errors on a single clean run.

---

## THE LEARNING LOG

After every completed self-healing loop (i.e., you hit a bug during testing, fixed it, and all phases pass), append an entry to a running log. This creates institutional memory.

**Format per entry:**
```
### [Date] — [Brief description]
- **What broke:** [Symptom observed]
- **Root cause:** [Why it broke]
- **Fix applied:** [What you changed]
- **Phase caught:** [Which phase caught it]
- **Prevention:** [What test or check should have caught this earlier, or what to add]
```

If the project has a `TESTING_LOG.md` or similar, append there. If not, suggest creating one and place it at the project root.

---

## AUTOMATION REQUIREMENTS

Wherever possible, automate these phases so they cannot be forgotten:

1. **Pre-commit hooks** — Static analysis (Phase 1) should run automatically on every commit. If the project doesn't have this, set it up using `husky` + `lint-staged` (JS), `pre-commit` (Python), or equivalent.
2. **CI pipeline** — Phases 1-3 should run in CI on every push/PR. If CI doesn't exist, flag this to the user as a critical gap.
3. **Automated E2E tests** — If the project has Playwright, Cypress, Selenium, or similar: run the E2E suite as part of Phase 4. If it doesn't, suggest adding E2E tests for critical flows and offer to write them.
4. **Lighthouse / accessibility audits** — Run `lighthouse` or `axe` after Phase 4 if the project is web-based. Performance regressions and accessibility failures count as bugs.

---

## REPORTING FORMAT

When you finish the protocol, report results to the user using the **What / Why / How** framework. Every section of the report must answer all three.

### Report Structure

```
TESTING COMPLETE — ALL PHASES PASSED

═══════════════════════════════════════
WHAT was tested
═══════════════════════════════════════

Change summary: [1-2 sentences describing what code changed]
Scope: [Files touched, modules affected, user flows impacted]

Phase results:
  Phase 1 (Static Analysis): PASS — 0 errors, 0 warnings
  Phase 2 (Tests): PASS — X tests run, X passed, 0 failed, 0 skipped
  Phase 3 (Build): PASS — Clean build, artifact verified
  Phase 4 (Functional):
    - Desktop: PASS — [flows tested]
    - Mobile: PASS — [viewports tested, e.g. 375px, 768px]
    - Edge cases: PASS — [scenarios tested]
  Phase 5 (Regression): PASS — [core flows verified]

═══════════════════════════════════════
WHY these results matter
═══════════════════════════════════════

Confidence level: [HIGH / MEDIUM / LOW] — [1 sentence justifying the rating]

Risk areas covered:
  - [Area 1]: [Why this area was a risk and what testing confirmed]
  - [Area 2]: [Why this area was a risk and what testing confirmed]

Risk areas remaining (if any):
  - [Area]: [Why it remains a risk and what would resolve it]

Self-healing loops: [N] (0 = first-pass clean)
  - If > 0: [Why each loop was triggered — root cause, not symptom]

═══════════════════════════════════════
HOW the testing was executed
═══════════════════════════════════════

Tools & commands run:
  - Linter: [exact command]
  - Type checker: [exact command]
  - Test runner: [exact command]
  - Build: [exact command]
  - E2E: [exact command or "N/A — not configured"]

Functional testing walkthrough:
  - Desktop: [Browser/runtime used, specific flows exercised, data used]
  - Mobile: [Viewports tested, device emulation details]
  - Edge cases: [Specific scenarios exercised — empty state, error state, etc.]

New tests added: [list with file paths, or "none needed — existing coverage sufficient"]

Issues found and fixed during testing:
  - [Issue]: WHAT broke → WHY it broke → HOW it was fixed
  - [Issue]: WHAT broke → WHY it broke → HOW it was fixed
  (or "none — clean first pass")

Prevention measures added:
  - [What was added to prevent this class of bug in the future, or "none needed"]
```

### Reporting Rules

1. **Every issue gets the What/Why/How treatment.** "Fixed a bug" is not a report. "The mobile nav overlay covered the submit button (WHAT) because the z-index was lower than the new modal component (WHY), resolved by updating the nav z-index in the layout stylesheet (HOW)" is a report.
2. **The WHY section is not optional.** It's the section that turns a test report into a decision-making tool. If you can't articulate why the results matter, you haven't finished thinking.
3. **The HOW section creates reproducibility.** Anyone picking this up after you should be able to re-run every step exactly as you did.
4. If any phase required self-healing, include the full Learning Log entries after the report.

---

## NON-NEGOTIABLES (READ THIS TWICE)

1. **Never mark a task as "done" before this protocol completes.** Code that hasn't been tested doesn't exist.
2. **Never say "I tested it" when you only ran unit tests.** Unit tests are Phase 2. The protocol has 5 phases.
3. **Never skip mobile testing.** Over half of web traffic is mobile. If it breaks on mobile, it's broken.
4. **Never ignore console warnings.** Warnings today are errors tomorrow.
5. **Never test only the happy path.** Real users don't follow the happy path.
6. **If you can't complete a phase** (e.g., no test runner configured, no way to start the app locally), flag it immediately. Don't silently skip it.
7. **The protocol applies to "one-line changes" too.** One line of code can break an entire application. Test it.
