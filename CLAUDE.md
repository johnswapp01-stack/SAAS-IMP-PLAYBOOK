# SaaS_IMP-Playbook_Items

## What This Repo Is

The codebase for **Implementation Pro** — an AI-powered professional services platform for SaaS implementation teams. Built on Next.js (App Router), Supabase, Stripe, and the Anthropic SDK.

It also houses the product files for the **SaaS Implementation Playbook Kit** — the 17-template digital product sold on Gumroad that this platform is built around.

## Version History
- v1.0 (Mar 2026): Initial build
- v1.5: Self-learning/self-healing architecture added
- v2.0 (Apr 2026): CLAUDE.md restructured to lean format; all operational detail moved to `.claude/rules/`

---

## Gumroad Product

**SaaS Implementation Playbook Kit** — 17 battle-tested templates for implementation teams, kickoff to go-live.

- **URL:** swappster4.gumroad.com/l/playbook-kit
- **Pricing:** $12/mo · $79/yr (30-day free trial)
- **Product ID (life-os):** `10896661-d90e-4e3b-a354-855f84102ede`

### Template Sets Included
1. **Kickoff Prep Kit** — Meeting agenda, pre-kickoff questionnaire, internal alignment checklist
2. **Stakeholder Alignment Templates** — RACI matrix, communication plan, escalation framework
3. **Scope Management Toolkit** — MoSCoW tracker, scope change request form, in/out documentation
4. **Go-Live Checklist** — Phase-gated checklist with owner assignments and sign-off fields
5. **Status Reporting Templates** — Weekly internal report, customer-facing update, executive summary
6. **Lessons Learned Framework** — Retro template, categorized findings log, playbook improvement tracker
7. **Handoff Documentation** — Sales-to-implementation handoff, implementation-to-CS transition doc

### Template Standards
- All templates use the CARE, MoSCoW, and What/Why/How frameworks
- Sample data uses the Acme Corp scenario: Rachel Torres, David Kim, Linda Chen, Marcus Webb, John Swapp
- Sign-off placeholder: `[YOUR SIGN-OFF]` — not "Best Regards," (buyers use their own)
- Format: `.docx` and `.xlsx` only (editable by buyers)
- Excel generation: openpyxl; Word generation: docx npm package
- Every template includes a "How to Use" section
- Write for the person who picks this up after you're gone

---

## Folder Protocol

**Write folder — deliver all outputs here:**
- `CLAUDE OUTPUTS/` — one subfolder per project

**Source artifacts — read and reference, do not overwrite without explicit request:**
- `supabase/migrations/001_initial_schema.sql` — deployed DB baseline
- `supabase/seed/acme_corp.sql` — standard seed data

---

## Rules Reference

Operational detail lives in `.claude/rules/`. CLAUDE.md does not duplicate it.

| When you need... | Read this file |
|---|---|
| TypeScript, React, component patterns | `coding-patterns.md` |
| npm, package versions, what to install | `dependency-management.md` |
| Commit format, branch naming | `git-workflow.md` |
| Schema changes, Supabase migrations | `migrations.md` |
| Pre-task checklist, anti-pattern scan | `pre-task-checklist.md` |
| Bug fix / test failure loop | `Self-Healing.md` |
| Incident log | `Self-Learning.md` |
| Folder layout, import conventions | `structure.md` |
| Test commands, 5-phase protocol | `testing.md` |
