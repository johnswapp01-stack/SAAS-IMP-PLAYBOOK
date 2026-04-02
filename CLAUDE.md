# SaaS_IMP-Playbook_Items — Implementation Pro

## What This Repo Is

The codebase for **Implementation Pro** — a mobile-first, AI-powered SaaS platform that manages, governs, and executes SaaS implementations. It replaces manual spreadsheets, disconnected templates, and tribal knowledge with a unified system where AI agents handle repeatable billable work and implementation teams oversee outcomes.

**One-line pitch:** AI agents that run implementations. You run the show.

**Category:** Implementation Management (distinct from Project Management — this distinction matters in all messaging and code decisions)

---

## Version History
- v1.0 (Mar 2026): Initial scaffold — Gumroad digital product model
- v1.5: Self-learning/self-healing architecture added
- v2.0 (Apr 2026): CLAUDE.md restructured to lean format; all operational detail moved to `.claude/rules/`
- v2.1 (Apr 2026): Full SaaS pivot — Stripe billing, Gumroad deprecated, PRD/Arch/GTM docs published

---

## Product Overview

### Pricing (Stripe-Billed — Gumroad is fully deprecated)

| Tier | Price | Agent Tasks/Month | Target |
|------|-------|-------------------|--------|
| Free | $0 | None | Individual consultants exploring |
| Pro | $49/mo | 50 | Solo consultants / small teams (1-3) |
| Team | $149/mo | 500 | Implementation teams (4-15) |
| Enterprise | Custom | Unlimited | Large PS organizations |

All paid tiers include a 30-day free trial. Annual billing planned for later.

### Gumroad Sunset (in progress)
The prior product — SaaS Implementation Playbook Kit ($12/mo · $79/yr, `swappster4.gumroad.com/l/playbook-kit`, Product ID `10896661-d90e-4e3b-a354-855f84102ede`) — is being sunset. No new Gumroad sales. Existing subscribers migrated to Pro with 3-month free coupon via Stripe. See GTM doc for full sunset timeline.

### Three Operational Layers
- **L1: Operations Automation** — resourcing rules, time tracking, financial controls, compliance engine
- **L2: Delivery Governance** — AI project plans, risk signal detection, health scoring, client updates
- **L3: Work Execution (AI Agents)** — six agents (Documentation, Communication, Testing, Migration, Configuration, Analysis)

Plus two cross-cutting capabilities: **Self-Learning** (feedback pipeline, org context, prompt refinement) and **Self-Healing** (health monitoring, auto-retry, circuit breakers).

### The 17 Templates → SaaS Features Mapping
The former Gumroad Playbook Kit templates are now embedded as SaaS features:
- Kickoff Prep Kit → Onboarding wizard + Checklist tab (kickoff type)
- Stakeholder Alignment → Stakeholder tab + RACI tab
- Scope Management → Scope tab (MoSCoW tracker)
- Go-Live Checklist → Checklist tab (go-live type)
- Status Reporting → Reports tab + Communication Agent
- Lessons Learned → Lessons tab
- Handoff Documentation → Documentation Agent artifacts

### Data Standards
- Acme Corp scenario (Rachel Torres, David Kim, Linda Chen, Marcus Webb, John Swapp) is the standard seed/sample data
- Seed file: `supabase/seed/acme_corp.sql`
- Sign-off placeholder in any generated docs: `[YOUR SIGN-OFF]`

---

## Development Status

| Phase | Scope | Status |
|-------|-------|--------|
| 1: Foundation | Auth, orgs, engagement CRUD, dashboard, mobile-first UI | In progress |
| 2: Templates | Scope, Stakeholders, RACI, Checklist, Decisions, Reports, Lessons | Not started |
| 3: L1 Operations | Resource management, time tracking, financials, compliance | Not started |
| 4: L2 Governance | AI risk detection, health scoring, client updates | Not started |
| 5: L3 Agents | Six AI agents, artifact generation, agent console | Not started |
| 6: Self-Learning | Feedback pipeline, org context, prompt refinement | Not started |
| 7: Self-Healing | Health monitoring, auto-recovery, error patterns | Not started |

Phases 5, 6, and 7 run in parallel (Weeks 27-34).

---

## Folder Protocol

**Write folder — deliver all outputs here:**
- `CLAUDE OUTPUTS/` — one subfolder per project

**Source artifacts — read and reference, do not overwrite without explicit request:**
- `supabase/migrations/001_initial_schema.sql` — deployed DB baseline (846 lines, 33 tables, never modify)
- `supabase/seed/acme_corp.sql` — standard seed data

---

## Rules Reference

Operational detail lives in `.claude/rules/`. CLAUDE.md does not duplicate it.

| When you need... | Read this file |
|---|---|
| TypeScript, React, App Router, component patterns | `coding-patterns.md` |
| npm, package versions, what to install | `dependency-management.md` |
| Commit format, branch naming | `git-workflow.md` |
| Schema changes, Supabase migrations | `migrations.md` |
| Pre-task checklist, anti-pattern scan | `pre-task-checklist.md` |
| Bug fix / test failure loop | `Self-Healing.md` |
| Incident log | `Self-Learning.md` |
| Folder layout, import conventions, route handlers | `structure.md` |
| Test commands, 5-phase protocol | `testing.md` |

On-demand reference (load only when needed):

| When you need... | Read this file |
|---|---|
| Full stack decisions, data flows, DB schema, dev phases, tech debt | `.claude/reference/stack-and-architecture.md` |
| Running the Health Framework on this CLAUDE.md | `.claude/reference/claude-md-health-framework.md` |
