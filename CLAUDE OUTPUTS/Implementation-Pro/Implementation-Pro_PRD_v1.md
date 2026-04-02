# Implementation Pro — Product Requirements Document (PRD)

**Version:** 1.0
**Last Updated:** 2026-04-02
**Owner:** John Swapp
**Status:** Active — Living Document

---

## 1. Executive Summary

Implementation Pro is a mobile-first, AI-powered SaaS platform that manages, governs, and executes SaaS implementations. It replaces manual spreadsheets, disconnected templates, and tribal knowledge with a unified system where AI agents handle repeatable billable work — and implementation teams oversee outcomes.

**One-line pitch:** AI agents that run implementations. You run the show.

**Category:** Implementation Management (distinct from Project Management)

---

## 2. Problem Statement

### The Pain

SaaS implementation teams operate in a gap between sales hand-off and customer success hand-off. During that gap:

1. **No purpose-built tooling exists.** Teams cobble together Jira, Smartsheet, Google Docs, and email. Nothing is designed for the implementation lifecycle specifically.
2. **Tribal knowledge walks out the door.** When an experienced implementation consultant leaves, their playbook goes with them. New hires repeat the same mistakes.
3. **Scope creep is invisible until it's too late.** Without a system enforcing scope boundaries, customers expand requirements informally through email and meetings. The team absorbs the cost.
4. **Status reporting is manual and time-consuming.** Consultants spend hours each week compiling status updates, risk summaries, and client communications — billable hours lost to admin.
5. **Risk surfaces late.** By the time a project is flagged red, the damage is done. Early signals (timeline drift, stakeholder disengagement, scope expansion) go undetected because nobody is watching the data.
6. **Operations lack guardrails.** Resource over-allocation, unbilled time, and compliance gaps go unchecked until they become financial problems.

### Who Feels This Pain

- Implementation Managers / Consultants running 3-8 concurrent customer engagements
- Professional Services Directors managing teams of 5-50 implementation specialists
- CS leaders inheriting projects from implementation without clean handoff documentation

### What They Do Today

They use general-purpose PM tools (Asana, Monday, Jira), spreadsheets (MoSCoW trackers, RACI matrices, go-live checklists), email (status updates, stakeholder comms), and document editors (requirements docs, runbooks) — none of which talk to each other or learn from past engagements.

---

## 3. Product Vision

Build the operating system for SaaS implementation teams — a platform where:

- Every engagement follows a repeatable, governed process from kickoff to go-live
- AI agents handle the repeatable work (docs, comms, testing, analysis) while humans make the judgment calls
- The system gets smarter with every engagement (self-learning) and recovers from failures automatically (self-healing)
- Operations, governance, and execution are unified in a single workspace

### Three Operational Layers

| Layer | What It Does | Value |
|-------|-------------|-------|
| **L1: Operations Automation** | Enforces resourcing rules, time tracking policies, financial controls, compliance | Prevents operational blind spots before they become financial problems |
| **L2: Delivery Governance** | AI generates project plans, monitors delivery signals, surfaces risks early, sends client updates | Catches risk signals weeks before manual reviews would |
| **L3: Work Execution** | AI agents execute repeatable billable tasks (docs, configs, testing, migrations, comms, analysis) | Recovers 10-20 hours per engagement from manual admin work |

Plus two cross-cutting capabilities:

- **Self-Learning:** Captures feedback on every AI output, builds org-specific context (writing style, risk patterns, client preferences), and refines agent prompts over time
- **Self-Healing:** Monitors system health, auto-retries failed operations, activates circuit breakers, and escalates anomalies

---

## 4. Target Users & Personas

### Primary: Implementation Consultant ("The Operator")

- Runs 3-8 customer engagements simultaneously
- Needs to track scope, stakeholders, risks, and deliverables per engagement
- Spends 30-40% of time on admin (reports, docs, comms) instead of delivery
- Mobile access is critical — often at client sites or between meetings
- Values: efficiency, clear accountability, professional output

### Secondary: Professional Services Director ("The Governor")

- Oversees a team of 5-50 consultants
- Needs cross-engagement visibility: resource utilization, financial health, risk posture
- Cares about compliance (time tracking policies, scope approval workflows, billing accuracy)
- Values: governance without micromanagement, early risk detection, team scalability

### Tertiary: Customer Success Manager ("The Inheritor")

- Receives handoff documentation after go-live
- Needs clean transition: what was built, what decisions were made, what risks remain
- Values: complete handoff docs, relationship context, ongoing health visibility

---

## 5. Functional Requirements

### 5.1 Foundation (Core Platform)

| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| F-001 | User authentication via Supabase Auth (email/password, OAuth) | Must | Scaffolded |
| F-002 | Organization creation with slug-based routing | Must | Scaffolded |
| F-003 | Organization member management with role-based access (owner, admin, member, viewer) | Must | Scaffolded |
| F-004 | Engagement CRUD with status lifecycle (kickoff → in_progress → uat → go_live → complete) | Must | Scaffolded |
| F-005 | Engagement health tracking (green/yellow/red + 0-100 composite score) | Must | Schema exists |
| F-006 | Scope item management with MoSCoW prioritization (must/should/could/won't) | Must | Scaffolded |
| F-007 | Stakeholder registry per engagement (name, role, influence, communication preference) | Must | Scaffolded |
| F-008 | Decision log per engagement (decision, context, impact, reversibility, status) | Must | Scaffolded |
| F-009 | RACI matrix per engagement | Must | Scaffolded |
| F-010 | Checklist system (kickoff + go-live) with task status, ownership, sign-off fields | Must | Scaffolded |
| F-011 | Lessons learned capture with categorization (process, communication, technical, scope, timeline) | Must | Scaffolded |
| F-012 | Status report generation (internal, customer-facing, executive) | Must | Scaffolded |
| F-013 | Activity log for audit trail | Should | Schema exists |
| F-014 | Automation rules (trigger + action) | Could | Schema exists |
| F-015 | Mobile-first responsive UI across all views | Must | Not started |

### 5.2 Layer 1: Operations Automation

| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| L1-001 | Resource profiles (skills, capacity, rates, timezone) | Must | Schema exists |
| L1-002 | Resource allocation per engagement (role, hours/week, date range) | Must | Schema exists |
| L1-003 | Time entry tracking (date, hours, billable flag, category, description) | Must | Schema exists |
| L1-004 | Financial tracking per engagement (budget, consumed, margin target vs. actual) | Must | Schema exists |
| L1-005 | Compliance rule engine (configurable rules, severity levels, actions: warn/block/notify/auto-correct) | Should | Schema exists |
| L1-006 | Compliance violation tracking and resolution workflow | Should | Schema exists |
| L1-007 | Support for billing models: fixed fee, T&M, milestone-based | Must | Schema exists |

### 5.3 Layer 2: Delivery Governance

| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| L2-001 | AI-generated project plans from engagement context (milestones, phases, assumptions, constraints) | Must | Schema exists |
| L2-002 | Risk signal detection (timeline, scope, budget, stakeholder, technical, resource) with severity and confidence scoring | Must | Schema exists |
| L2-003 | Automated client update drafting (weekly status, milestone reached, risk alert, go-live countdown) | Must | Schema exists |
| L2-004 | Delivery signal monitoring (velocity, scope drift, stakeholder engagement) with trend analysis | Should | Schema exists |
| L2-005 | Client update approval workflow (draft → approved → sent) | Must | Schema exists |
| L2-006 | Health score computation from delivery signals | Should | Schema exists |

### 5.4 Layer 3: Work Execution (AI Agents)

Six AI agents, each with a defined execution mode:

| Agent | Type | Execution Mode | What It Does |
|-------|------|---------------|-------------|
| Documentation Agent | documentation | Propose-and-wait | Generates requirements docs, meeting agendas, configuration runbooks, handoff documents |
| Communication Agent | communication | Propose-and-wait | Drafts status updates, escalation emails, scope change notifications, go-live announcements |
| Testing Agent | testing | Propose-and-wait | Generates test plans, test cases from scope items, requirements traceability matrices |
| Migration Agent | migration | Assist | Plans data migrations, field mappings, validation checklists, rollback procedures |
| Configuration Agent | configuration | Assist | Configuration checklists, as-configured docs, drift detection |
| Analysis Agent | analysis | Auto-execute | Cross-engagement analysis: patterns, utilization, scope creep trends, lessons synthesis |

| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| L3-001 | Agent definition registry with system prompts, I/O schemas, execution modes | Must | Schema + seed data exists |
| L3-002 | Agent task queue (queued → running → completed/failed/cancelled/awaiting_approval) | Must | Schema exists |
| L3-003 | Agent execution logging (tokens, model, duration, cost, output) | Must | Schema exists |
| L3-004 | Agent artifact generation (document, test_report, migration_log, config_file, status_report, project_plan) | Must | Schema exists |
| L3-005 | Artifact approval workflow (draft → approved → delivered → archived) | Must | Schema exists |
| L3-006 | Agent console UI for triggering, monitoring, and reviewing agent work | Should | Page scaffolded |

### 5.5 Self-Learning

| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| SL-001 | Feedback pipeline: accepted/modified/rejected on every AI output | Must | Schema exists |
| SL-002 | Org-specific learning context storage (writing style, risk patterns, common issues, client preferences, process norms) | Must | Schema exists |
| SL-003 | Outcome correlation tracking (signal → action → result) | Should | Schema exists |
| SL-004 | Prompt refinement using accumulated feedback and context | Should | Not started |

### 5.6 Self-Healing

| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| SH-001 | System health checks (API availability, DB performance, agent success rate, queue depth, error rate) | Must | Schema exists |
| SH-002 | Self-healing event tracking (auto-retry, circuit break, fallback, graceful degradation, auto-rollback, anomaly detection) | Must | Schema exists |
| SH-003 | Error pattern recognition with auto-resolution suggestions | Should | Schema exists |

---

## 6. Non-Functional Requirements

### 6.1 Performance

- Page load time: < 2 seconds on 4G mobile connection
- API response time: < 500ms for standard CRUD operations
- AI agent task completion: < 30 seconds for document generation
- Support for 1,000 concurrent users without degradation

### 6.2 Security

- All data encrypted at rest (Supabase default: AES-256)
- All data encrypted in transit (TLS 1.3)
- Row Level Security (RLS) on all tables — users can only access data within their organization
- API keys and secrets stored in environment variables, never in code
- Supabase Auth handles session management, token refresh, and OAuth flows

### 6.3 Scalability

- Multi-tenant architecture with org-level data isolation via RLS
- Stateless API design — horizontal scaling via Vercel serverless functions
- Database connection pooling via Supabase (PgBouncer)

### 6.4 Reliability

- Self-healing system monitors and auto-recovers from common failures
- Circuit breakers prevent cascading failures in AI agent pipeline
- Graceful degradation: if AI service is unavailable, manual workflows remain functional

### 6.5 Mobile-First Design

- All UI designed mobile-first, then scaled up for desktop
- Touch targets minimum 44px
- No horizontal scroll on viewports 375px and wider
- Offline-capable for viewing cached engagement data (future)

### 6.6 Accessibility

- WCAG 2.1 AA compliance target
- Keyboard navigable
- Screen reader compatible

---

## 7. Technical Architecture Summary

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Frontend | Next.js 16 (App Router) | Server Components for performance, App Router for file-based routing |
| UI Framework | Tailwind CSS + shadcn/ui | Utility-first styling, consistent component library |
| Backend/DB | Supabase (PostgreSQL) | Auth, database, realtime, storage, edge functions in one platform |
| AI Engine | Anthropic Claude API (primary) | Best-in-class reasoning for document generation and analysis |
| AI Fallback | OpenAI (planned) | Redundancy for AI operations |
| Billing | Stripe | Subscription management, checkout, customer portal |
| Email | Resend | Transactional email delivery |
| Deployment | Vercel | Serverless hosting, edge network, preview deployments |
| Testing | Playwright | Cross-browser E2E testing including mobile viewports |

### Database Schema

33 tables across 6 domains:

- **Foundation (12 tables):** profiles, organizations, org_members, engagements, scope_items, stakeholders, decisions, raci_items, checklist_items, lessons_learned, status_reports, activity_log, automation_rules
- **L1 Operations (6 tables):** resource_profiles, resource_allocations, time_entries, financial_tracking, compliance_rules, compliance_violations
- **L2 Governance (4 tables):** project_plans, risk_signals, client_updates, delivery_signals
- **L3 Agents (4 tables):** agent_definitions, agent_tasks, agent_executions, agent_artifacts
- **Self-Learning (3 tables):** learning_feedback, org_learning_context, outcome_correlations
- **Self-Healing (3 tables):** system_health_checks, self_healing_events, error_patterns

41 custom enum types define controlled vocabularies across the schema.

RLS is enabled on all tables with org-scoped access policies. A helper function `is_org_member()` validates membership for all org-scoped queries.

---

## 8. Pricing Model

All billing through Stripe. Gumroad is deprecated.

| Tier | Monthly Price | Agent Tasks/Month | Target User |
|------|--------------|-------------------|-------------|
| Free | $0 | — | Individual consultants exploring the platform |
| Pro | $49/mo | 50 | Solo consultants or small teams (1-3 people) |
| Team | $149/mo | 500 | Implementation teams (4-15 people) |
| Enterprise | Custom | Unlimited | Large professional services organizations |

All paid plans include a 30-day free trial.

---

## 9. Success Metrics

### Product Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Monthly Active Engagements per org | ≥ 3 | Engagements with activity in trailing 30 days |
| Agent Task Adoption | ≥ 60% of eligible tasks use agents within 90 days | Agent tasks / manual equivalent tasks |
| Time Saved per Engagement | 10-20 hours over engagement lifecycle | Self-reported + agent task duration vs. manual estimate |
| Net Promoter Score | ≥ 50 | Quarterly survey |

### Business Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Paid Users | 100 | Month 6 post-launch |
| MRR | $10,000 | Month 9 post-launch |
| Churn Rate | < 5% monthly | Steady state |
| Trial-to-Paid Conversion | ≥ 15% | Steady state |

---

## 10. User Flows

### 10.1 First-Time User Flow

1. User visits landing page → signs up (email or OAuth)
2. Onboarding wizard: create organization → invite team (optional) → create first engagement
3. Dashboard shows engagement overview with health status
4. User navigates into engagement detail → tabbed interface for scope, stakeholders, RACI, checklist, etc.

### 10.2 Engagement Lifecycle Flow

1. **Kickoff:** Create engagement → populate stakeholders, scope items (MoSCoW), RACI → run kickoff checklist
2. **In Progress:** Track time → monitor delivery signals → generate status reports → manage scope changes
3. **UAT:** Run testing agent for test plans → track checklist completion → monitor risk signals
4. **Go-Live:** Execute go-live checklist → generate go-live communication → capture lessons learned
5. **Complete:** Generate handoff documentation → archive engagement → feed data into cross-engagement analysis

### 10.3 AI Agent Flow

1. User selects an engagement → opens agent console
2. Chooses agent type (documentation, communication, testing, etc.)
3. Agent receives engagement context as input → generates output
4. If propose-and-wait: user reviews, approves/modifies/rejects → feedback captured
5. If assist: agent provides recommendations, user takes action
6. If auto-execute: agent runs on schedule, logs results, surfaces anomalies

---

## 11. Assumptions & Dependencies

### Assumptions

- Target users are already running SaaS implementations and have established processes (this is not a "learn to implement" product)
- Users have reliable internet access (mobile data or Wi-Fi) for real-time features
- Organizations have 3+ concurrent engagements to justify the platform investment
- AI model quality (Claude) will continue improving, reducing need for manual output editing

### Dependencies

- Supabase for database, auth, and realtime — platform availability is a hard dependency
- Anthropic Claude API for all AI agent features — API outage degrades L3 entirely
- Stripe for billing — required for any paid tier functionality
- Vercel for deployment — required for production hosting
- Resend for transactional email — required for client update delivery

---

## 12. Out of Scope (Won't)

- **Project management features** (Gantt charts, sprint boards, backlog management) — this is not a PM tool
- **CRM functionality** — no lead/opportunity tracking, no sales pipeline
- **Custom integrations with specific SaaS products** (Salesforce, HubSpot, etc.) — future consideration only
- **White-label / OEM offering** — not in the 12-month roadmap
- **On-premise deployment** — SaaS only
- **Real-time collaboration** (Google Docs-style co-editing) — not in initial release

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| AI output quality insufficient for professional use | Medium | High | Propose-and-wait mode ensures human review; self-learning loop improves over time |
| Solo developer velocity limits feature delivery | High | Medium | Phased build plan; AI-assisted development; focus on foundation before layers |
| Market education required (new category) | Medium | High | Build-in-public content strategy; community building; free tier for adoption |
| Supabase or Anthropic API outage | Low | High | Self-healing system with circuit breakers; graceful degradation to manual workflows |
| Scope creep on the product itself | Medium | Medium | MoSCoW prioritization applied to own roadmap; strict phase gating |

---

## 14. Release Plan

| Phase | Timeframe | What Ships |
|-------|-----------|-----------|
| 1. Foundation | Weeks 1-6 | Auth, orgs, engagement CRUD, dashboard, mobile-first UI |
| 2. Templates | Weeks 7-12 | MoSCoW scope tracker, RACI matrix, checklists, status reports, lessons learned |
| 3. L1: Operations | Weeks 13-18 | Resource management, time tracking, financial tracking, compliance engine |
| 4. L2: Governance | Weeks 19-26 | AI risk detection, health scoring, delivery signals, automated client updates |
| 5. L3: Agents | Weeks 27-34 | Six AI agents, artifact generation, agent console |
| 6. Self-Learning | Weeks 27-34 | Feedback pipeline, org learning context, prompt refinement |
| 7. Self-Healing | Weeks 27-34 | Health monitoring, auto-recovery, circuit breakers, error pattern recognition |

---

## 15. Open Questions

1. **Domain:** Is implementationpro.com secured, or should alternatives be evaluated?
2. **Mobile app:** Is a native mobile app needed, or is a responsive PWA sufficient for mobile-first?
3. **AI model costs:** At scale (1,000 orgs × 50 agent tasks/month), what is the projected Anthropic API cost? Does the $49/mo Pro tier cover it?
4. **Gumroad migration:** What happens to existing Gumroad subscribers? Migration path, communication plan, timeline for sunset.
5. **Competitive landscape:** Are there emerging competitors in the "Implementation Management" category that need to be tracked?

---

*This is a living document. Updated as decisions are made and requirements evolve.*
