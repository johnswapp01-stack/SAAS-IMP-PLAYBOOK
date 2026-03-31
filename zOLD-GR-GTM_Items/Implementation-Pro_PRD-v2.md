# Implementation Pro — Product Requirements Document v2
### AI-Powered Implementation Delivery Platform
**Author:** John Swapp | **Version:** 2.0 | **Date:** March 30, 2026
**Changelog:** v2.0 — Added AI Agent Architecture (three layers), Self-Learning System, Self-Healing System. Updated vision, architecture, data model, phasing, and pricing.

---

## 1. Product Vision (Updated)

**One sentence:** Implementation Pro is an AI-powered delivery platform that manages, governs, and executes SaaS implementations — replacing the manual tracking, ad-hoc communication, and repetitive busywork that drain implementation teams.

**The evolution:**
- **v0 (Gumroad):** Downloaded templates. Static. Manual. Disconnected.
- **v1 (SaaS Platform):** Interactive workspace. Connected. Structured. Human-operated.
- **v2 (AI Delivery Platform):** Intelligent system. Automated. Predictive. AI agents execute work alongside humans.

**The three-layer thesis:**

Implementation work happens at three levels. Today, humans do all three manually. Implementation Pro automates each level progressively:

| Layer | What It Does | Human Role Today | AI Role in Implementation Pro |
|-------|-------------|-----------------|------------------------------|
| **Operations Automation** | Resource rules, time policies, financial controls, compliance | Manual enforcement, spreadsheet tracking | Automatic enforcement, real-time alerts, policy compliance |
| **Delivery Governance** | Project plans, health monitoring, client updates, risk detection | Weekly status meetings, gut-feel risk assessment | Continuous monitoring, AI-drafted updates, predictive risk scoring |
| **Work Execution** | Migrations, configurations, documentation, testing | Humans do everything, even repetitive tasks | AI agents execute repeatable tasks, humans oversee and apply judgment |

**What success looks like at 18 months:**
- 500+ registered organizations
- 100+ paying teams on Pro or Team plans
- $10K+ MRR
- AI agents completing 30%+ of repeatable engagement tasks
- Self-learning system reducing time-to-go-live by 20% for returning users
- NPS > 50
- Gumroad fully sunset

---

## 2. Target User (Updated)

### Primary ICP: The Implementation Lead
*(same persona and pain points from PRD v1)*

**New pain points addressed by AI layers:**
- "I spend 3 hours every Friday assembling status reports." → *Delivery Governance: AI drafts the report from live engagement data. You review and send.*
- "I know this engagement is going to go red, but I can't prove it until it does." → *Delivery Governance: Risk detection surfaces patterns 2-3 weeks before health changes.*
- "Every data migration follows the same steps, but I still have to do them manually." → *Work Execution: Migration agent generates mapping docs, transformation rules, and validation criteria.*
- "Our team doesn't follow the same process — every specialist does it differently." → *Operations Automation: Process rules enforce consistent workflows across the team.*

### New ICP: The Professional Services Director

VP/Director of Professional Services or Implementation at a SaaS company. Manages 5-30 specialists. Responsible for utilization rates, on-time delivery, and customer satisfaction. Needs operational control, financial visibility, and scalable delivery capacity.

**Their pain points:**
- "I can't scale delivery without hiring more people." → *Work Execution agents increase capacity without headcount.*
- "I don't know which engagements are at risk until the weekly review." → *Delivery Governance provides continuous, real-time health monitoring.*
- "Our margins are eroding because we over-service accounts." → *Operations Automation enforces time and budget controls.*

This persona buys the **Team** or **Enterprise** plan and is the primary revenue driver.

---

## 3. Product Architecture (Updated)

### 3.1 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14+ (App Router) | React-based, SSR, Vercel-native |
| **UI Framework** | Tailwind CSS + shadcn/ui | Rapid development, professional look |
| **Backend/DB** | Supabase (Postgres) | Auth, RLS, Realtime, Edge Functions, pgvector |
| **Auth** | Supabase Auth | Email/password, Google OAuth, magic links |
| **File Storage** | Supabase Storage | PDFs, attachments, agent outputs |
| **Deployment** | Vercel | Auto-deploy, edge functions, AI SDK native |
| **AI Engine** | Anthropic Claude API (via Vercel AI SDK) | Primary LLM for all AI agents |
| **Vector Search** | Supabase pgvector | Similarity search for engagement patterns, risk matching |
| **Background Jobs** | Supabase Edge Functions + pg_cron | Scheduled agent tasks, monitoring loops |
| **Agent Framework** | Vercel AI SDK (tool use + structured outputs) | Typed agent execution with tool calling |
| **Email** | Resend (transactional) + MailerLite (marketing) | Notifications, client updates |
| **State Management** | TanStack Query | Server state, optimistic updates |
| **PDF Generation** | @react-pdf/renderer | Reports, exports |
| **Charts** | Recharts | Dashboards, analytics |
| **Rich Text** | Tiptap | Notes, AI-drafted content editing |
| **Telemetry** | Custom Supabase tables + Sentry | Self-learning data, error tracking |

### 3.2 AI Agent Lifecycle

Every AI agent in the system follows the same lifecycle. No agent executes without human oversight.

```
1. TRIGGER
   ├── Scheduled (cron: "every Monday 8am, draft status reports")
   ├── Event-driven (engagement status changed → run risk assessment)
   ├── User-initiated ("Generate project plan from this SOW")
   └── Threshold-crossed (budget burn > 80% → alert operations)

2. CONTEXT ASSEMBLY
   ├── Pull engagement data (scope, stakeholders, decisions, history)
   ├── Vector search: find similar past engagements and outcomes
   ├── Pull organizational preferences and templates
   └── Build structured prompt with all context

3. EXECUTION
   ├── Call Claude API with assembled context + agent system prompt
   ├── Use structured outputs (Zod schemas) for typed responses
   ├── Stream results to UI for real-time visibility
   └── Log all inputs/outputs to agent_executions table

4. REVIEW (Human-in-the-Loop)
   ├── Present agent output in review UI
   ├── User can: Approve / Edit / Reject / Re-run with feedback
   ├── Approved outputs committed to the engagement
   └── Rejected outputs logged with reason (feeds self-learning)

5. COMMIT
   ├── Approved work becomes part of the engagement record
   ├── Activity log captures: what, by which agent, approved by whom
   └── Billable work tracked separately

6. LEARN
   ├── Outcome data feeds back into self-learning system
   ├── Approval rate tracked per agent (quality signal)
   ├── Edit patterns analyzed (where does the AI miss?)
   └── Prompts refined based on rejection reasons
```

**Agent trust levels:**

| Trust Level | Behavior | Examples |
|-------------|----------|---------|
| **Advisory** | Suggests actions, human decides | Risk alerts, recommendations, benchmarks |
| **Draft** | Creates output for review, human approves before commit | Status reports, project plans, documentation |
| **Supervised** | Executes automatically, human can override within window | Notifications, checklist pre-population, data validation |
| **Autonomous** | Executes without review (low-risk, high-confidence) | Error recovery, performance optimization, data cleanup |

New agents start at Advisory and earn higher trust levels based on approval rates.

---

## 4. Self-Learning System

The platform gets smarter with every engagement through specific, measurable mechanisms.

### 4.1 Telemetry Collection

Every user action feeds the learning system automatically.

| Signal | What It Captures | Why It Matters |
|--------|-----------------|----------------|
| Task completion velocity | How fast checklist items move to complete | Predicts timeline accuracy |
| Scope change frequency | New scope items added per week | Leading indicator of scope creep |
| Blocker aging | How long items stay blocked | Predicts health degradation |
| Stakeholder response time | Time between update sent and acknowledgment | Predicts communication breakdowns |
| Health change patterns | Sequence of health transitions with timing | Pattern matching for risk prediction |
| Decision density | Decisions per engagement phase | Correlates with complexity and risk |
| Agent approval rate | % of outputs approved vs edited vs rejected | Agent quality signal |
| Time-to-go-live | Actual vs target go-live date | Outcome metric for all predictions |
| Template usage patterns | Items used, skipped, or custom-added | Adaptive template optimization |

### 4.2 Risk Prediction Model

Transparent, rule-based scoring enhanced by pattern matching:

```
risk_score = weighted_sum(
  scope_velocity_score     × 0.25,
  blocker_aging_score      × 0.20,
  timeline_deviation_score × 0.20,
  stakeholder_engagement   × 0.15,
  historical_similarity    × 0.10,
  decision_backlog_score   × 0.10
)
```

Each sub-score has clear, explainable rules. When the system flags a risk, it shows **why**.

**Risk thresholds:** 0-30 Green | 31-60 Yellow | 61-80 Orange | 81-100 Red

**Action triggers:**
- Score crosses 60 → In-app notification to engagement owner
- Score crosses 80 → Email alert to owner + team manager
- Rising 15+ points in 7 days → Governance agent drafts risk mitigation plan

### 4.3 Recommendation Engine

Contextual suggestions at the right time:

| When | Suggestion | Data Source |
|------|-----------|-------------|
| New engagement created | "Based on 47 similar engagements, these 3 scope items are almost always needed." | Historical scope + vector similarity |
| Engagement enters week 2 | "Engagements like this that complete stakeholder mapping by day 10 deliver 2x faster." | Telemetry patterns |
| Scope item added | "This requirement was rejected in 68% of similar engagements. Consider 'Could'." | Historical outcomes |
| Health turns yellow | "Top 3 actions that reversed yellow→green in similar engagements: [list]" | Health transition patterns |

### 4.4 Adaptive Templates

Templates evolve based on aggregate anonymized usage:
1. Track which checklist items are used vs. skipped across all engagements
2. Track which items are custom-added frequently
3. Monthly analysis identifies candidates for addition/removal
4. Changes **suggested to admins**, never auto-applied
5. Organizations can lock templates to prevent suggestions

---

## 5. Self-Healing System

### 5.1 Error Detection & Recovery

| Layer | Detection | Recovery |
|-------|-----------|----------|
| **API Errors** | Sentry captures unhandled exceptions | Auto-retry (3x, exponential backoff) for transient errors |
| **AI Agent Failures** | Execution timeout (30s) or malformed output | Retry with simplified prompt; 2nd fail → fallback to manual + notify user |
| **Database Issues** | Connection pool monitoring, query timeouts | Pool auto-recycling, slow query alerts |
| **Frontend Errors** | Error boundaries on every route | Graceful fallback UI with retry option |
| **Webhook Failures** | HTTP status monitoring | 3 retries (1min, 5min, 30min backoff) |

### 5.2 Data Consistency Engine

Runs daily at 3 AM UTC via Edge Function:
- Orphaned records (scope items referencing deleted engagements) → Auto-archive + notify
- Missing relationships (engagements without owners) → Flag to org admin
- Stale data (in_progress with no activity 30+ days) → "Still active?" notification
- RLS integrity (spot-check for cross-org leakage)
- Agent output validation (no hallucinated IDs or references)

### 5.3 Performance Self-Optimization

| What | How | When |
|------|-----|------|
| Slow queries | Identify > 500ms queries, add indexes | Weekly analysis |
| Cache misses | Increase stale times for stable data | Continuous |
| Large payloads | Implement pagination for > 100KB responses | Monthly review |
| Edge function cold starts | Pin hot functions, optimize bundles | Post-deployment |

### 5.4 Health Monitoring

Internal admin dashboard showing: API response times (P50/P95/P99), error rates, agent success rates, DB utilization, free tier headroom.

Alerts when: error rate > 1% for 15min, agent success < 85%, any free tier > 80% used.

---

## 6. AI Layer 1: Operations Automation

*Enforces resourcing rules, time policies, financial controls, and compliance automatically.*

### 6.1 Resource Management Agent

- Track engagement count per team member
- Configurable capacity rules ("No member > X active engagements")
- Alert on violation, suggest rebalancing
- Skill-based matching (tag members with skills, suggest assignment by engagement type)
- **Trust level:** Advisory

### 6.2 Time & Budget Controller

- Budget fields on engagements (planned hours, planned revenue, hourly rate)
- Simple time logging (hours per week per engagement per member)
- Burn rate: hours consumed vs. remaining vs. timeline remaining
- Alerts: 60% burn with <40% timeline → Warning; 80% burn → Escalation
- Overservice detection: complete with hours > 120% of budget
- Weekly auto-generated budget summary
- **Trust level:** Supervised

### 6.3 Compliance Engine

- Configurable rules per organization:
  - "RACI must be complete before status → in_progress"
  - "All Must Have scope items need an owner"
  - "Go-live checklist 100% before status → complete"
- Compliance dashboard: per-engagement score (% of rules met)
- Block or warn on status transitions if rules unmet
- Full audit trail via activity_log
- **Trust level:** Supervised (configurable: warn-only or enforce)

---

## 7. AI Layer 2: Delivery Governance

*Generates project plans, monitors delivery signals, drafts client updates, surfaces risks early.*

### 7.1 Plan Generation Agent

**Input:** SOW upload or structured form (project type, timeline, deliverables, team, constraints)

**Output (for review):**
- Phased project plan with milestones and dates
- Pre-populated go-live and kickoff checklists (customized to project type)
- Suggested RACI matrix
- Initial scope items (MoSCoW classified)
- Estimated effort breakdown

**How:** Claude API with input + org templates + similar past engagements (pgvector) + best practice patterns. Structured output via Zod. Review UI with side-by-side editing. **Trust level:** Draft

### 7.2 Delivery Health Monitor

**Signals:** Checklist velocity, scope change rate, blocker count/aging, stakeholder response latency, decision backlog, budget burn, days to go-live.

**Output:** Health score (0-100) with breakdown, trend, recommendations, comparison to similar engagements.

**Execution:** Daily cron for all active engagements. Auto-updates health field on threshold crossings. Logs to health_history for trends. **Trust level:** Supervised

### 7.3 Client Communication Agent

| Type | Trigger | Output |
|------|---------|--------|
| Weekly status update | Scheduled or manual | Email-ready report: accomplishments, next steps, blockers |
| Milestone notification | Phase 100% complete | Completion announcement |
| Risk escalation | Health > 60 | Internal risk summary + external proactive comm |
| Meeting agenda | 24hr before meeting | Agenda from engagement state |
| Go-live countdown | 7/3/1 days out | Readiness summary |
| Handoff summary | Status → complete | Full CS handoff document |

Drafts appear in Communication tab. User reviews in Tiptap editor, sends via Resend. **Trust level:** Draft

### 7.4 Risk Detection Engine

1. Health Monitor feeds current state to Risk Engine
2. pgvector finds 10 most similar past engagements (industry, scope size, timeline, team)
3. Identifies which similar engagements had negative outcomes
4. Extracts leading indicators that appeared before negative outcomes
5. Checks if current engagement shows those indicators
6. Surfaces specific, actionable alerts: "3 of 5 similar engagements that added 4+ scope items by week 3 missed their go-live. You've added 3 so far."

**Trust level:** Advisory

---

## 8. AI Layer 3: Work Execution

*AI agents execute repeatable, billable delivery tasks within project plans. Teams oversee outcomes.*

### 8.1 Agent Registry

All agents registered in `agent_definitions` table with: system prompt, input/output schemas (Zod), trust level, version. Every execution logged to `agent_executions` with full I/O, review status, token usage, and cost.

Agents can be linked to specific checklist items via `agent_task_assignments` — enabling auto-execution when a task becomes active.

### 8.2 Migration Agent

**Generates:** Data mapping documents, transformation rules, validation criteria, migration plan, test data sets.
**Input:** Source/target system info, business rules, volume estimates.
**Trust level:** Draft

### 8.3 Configuration Agent

**Generates:** Configuration checklists, settings validation matrix, best practice recommendations, drift detection reports.
**Input:** Target system type, requirements from scope items, existing config docs.
**Trust level:** Draft

### 8.4 Documentation Agent

**Generates:** Meeting notes (from transcripts), decision documents, handoff documentation, SOW amendment drafts, lessons learned reports, training material outlines.
**Input:** Engagement context (auto-pulled) + uploaded documents.
**Trust level:** Draft

### 8.5 Testing Agent

**Generates:** Test cases from requirements, UAT scripts, regression checklists, test result templates, defect report drafts.
**Input:** Scope items (Must/Should), acceptance criteria, configuration details, integration points.
**Trust level:** Draft

### 8.6 Validation Agent

**Checks:** Scope coverage (all Must/Should items addressed?), RACI completeness (one Accountable per row?), checklist completeness vs. timeline, document completeness, go-live readiness score.
**Input:** Engagement data (auto-pulled).
**Output:** Validation report (pass/fail per check), gap list, readiness score.
**Trust level:** Supervised (runs at phase transitions, results reviewed)

---

## 9. Updated Data Model

### New Tables for AI Layers

| Table | Purpose |
|-------|---------|
| engagement_telemetry | Usage signals for self-learning |
| health_history | Health snapshots for trend analysis |
| engagement_embeddings | Vector embeddings (pgvector) for similarity search |
| risk_alerts | AI-generated risk notifications |
| communication_log | Sent client communications |
| agent_definitions | Registry of all AI agents |
| agent_executions | Log of every agent run with I/O and review status |
| agent_task_assignments | Links agents to checklist items |
| team_member_capacity | Capacity and skills per member |
| engagement_budget | Budget and financial tracking |
| time_entries | Hours logged per engagement |
| compliance_rules | Configurable org-level policies |
| system_health | Platform health metrics |

**Total: ~25 tables** — all in Supabase Postgres with RLS.

---

## 10. Updated Pricing

| | **Free** | **Pro** | **Team** | **Enterprise** |
|---|---|---|---|---|
| **Price** | $0 | $49/mo · $449/yr | $149/mo · $1,349/yr | Custom |
| **Engagements** | 2 | Unlimited | Unlimited | Unlimited |
| **Users** | 1 | 5 | 30 | Unlimited |
| **AI Agent Runs** | 10/mo | 100/mo | 500/mo | Unlimited |
| **Agent Types** | Docs only | All agents | All + custom | All + custom + API |
| **Ops Automation** | — | Alerts only | Full rules + enforce | Full + custom rules |
| **Delivery Governance** | — | Health monitoring | Full suite | Full + white-label |
| **Work Execution** | — | Docs + Testing | All agents | All + custom agents |
| **Self-Learning** | — | Recommendations | Full predictions | Full + data export |

**API cost per agent execution:** ~$0.01-0.12. At Team tier (500/mo): ~$15-30/mo API cost. Margin > 80%.

---

## 11. Updated Milestone Schedule

| Phase | Months | What Ships |
|-------|--------|-----------|
| **1-5: Platform Foundation** | 1-6 | Core management platform (auth, engagements, templates, reports, automation rules, team features). Telemetry collection from day 1. AI-assisted status reports in Phase 3. |
| **6: Self-Learning + Self-Healing** | 7-8 | Telemetry analysis, health history, pgvector similarity, pattern detection, recommendations, error recovery, data consistency, health monitoring |
| **7: Delivery Governance** | 9-10 | Agent framework, health monitor, risk detection, client comms agent, plan generation agent |
| **8: Operations Automation** | 11-12 | Time/budget tracking, resource management, budget controller, compliance engine, ops dashboard |
| **9: Work Execution Agents** | 13-15 | Documentation, Testing, Validation, Migration, Configuration agents. Agent-task linking. |
| **10: Optimization** | 16-18 | Trust level graduation, adaptive templates, custom agent builder, Enterprise API |

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| AI hallucinations in agent outputs | All agents start at Draft trust. Structured outputs constrain format. Human review before commit. |
| API costs exceed margin | Token tracking per execution. Rate limits per tier. Haiku for simple tasks. |
| Users don't trust AI | Start with low-risk agents (Docs, Recommendations). Build trust incrementally. Always show reasoning. |
| Cold start (insufficient learning data) | Seed with John's engagement patterns. First 50 engagements build baseline. Graceful degradation when sparse. |
| Security with AI processing customer data | Anthropic API is SOC 2. No data stored outside Supabase. DPA in ToS. Org-level opt-in for AI. |

---

## Appendix: Competitive Moat

Generic AI tools (ChatGPT, Copilot) help with individual tasks. Implementation Pro embeds AI into workflow context — the agent knows the engagement, scope, stakeholders, history, and patterns from similar past implementations. That contextual intelligence cannot be replicated by prompting a general-purpose LLM.

| Competitor | AI | Implementation Pro Advantage |
|-----------|-----|------------------------------|
| Asana/Monday | Generic AI assistant | No implementation intelligence |
| Rocketlane | Some automation, no AI agents | No work execution. $19-49/user/mo. |
| Notion AI | General writing assistant | No engagement context, no governance |
| Implementation Pro | Three-layer AI: Ops + Governance + Execution | Domain-specific agents with contextual intelligence, self-learning from every engagement |
