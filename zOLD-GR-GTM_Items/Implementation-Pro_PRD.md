# Implementation Pro — Product Requirements Document
### SaaS Platform for Implementation Teams
**Author:** John Swapp | **Version:** 1.0 | **Date:** March 30, 2026

---

## 1. Product Vision

**One sentence:** Implementation Pro is a purpose-built SaaS platform that gives implementation teams a single system to manage engagements from kickoff to go-live — replacing the patchwork of spreadsheets, Notion databases, and downloaded templates they currently cobble together.

**The problem we're solving:** Implementation teams run complex, multi-stakeholder projects but lack purpose-built tooling. They use project management software designed for product teams (Asana, Monday, Jira) and force-fit it to implementation workflows. The result: scope creep goes untracked, stakeholder communication is ad-hoc, go-live readiness is a guessing game, and lessons learned evaporate between engagements.

**Why this exists now:** The Gumroad product suite (Playbook Kit, Notion OS, Automation Workflows) validated that implementation teams will pay for structured process tools. Over 17 templates and 8 interconnected databases have been built and sold. The SaaS is the natural evolution: taking those static templates and making them interactive, connected, and automated inside a single platform.

**What success looks like at 12 months:**
- 500+ registered organizations
- 50+ paying teams on Pro or Team plans
- $5K+ MRR
- NPS > 50 from active users
- Gumroad fully sunset, all customers migrated

---

## 2. Target User

### Primary ICP: The Implementation Lead

**Who they are:** Mid-career professionals (3-10 years experience) who own the delivery of SaaS implementations. Their title might be Implementation Specialist, Implementation Consultant, Onboarding Manager, Customer Success Manager (with implementation responsibilities), Solutions Engineer, or Professional Services Consultant.

**Their day-to-day:**
- Managing 3-8 active engagements simultaneously
- Coordinating between internal teams (Sales, Product, CS, Engineering) and the customer
- Running kickoff meetings, tracking scope changes, chasing stakeholder sign-offs
- Producing weekly status reports for internal leadership and customers
- Documenting decisions so nothing gets lost when people rotate off
- Conducting go-live readiness reviews and post-implementation retros

**Their pain points (in their words):**
- "I spend more time updating spreadsheets than actually implementing."
- "Every new engagement I start from scratch because there's no system."
- "I can't see across all my engagements in one place."
- "Scope creep kills me — by the time I catch it, it's already baked in."
- "My status reports take an hour to assemble every week."
- "When I hand off to CS, half the context disappears."

**What they've tried:**
- Asana/Monday/Jira — Too generic, no implementation-specific frameworks
- Notion — Better, but requires building everything from scratch
- Excel/Word templates — Works but nothing is connected
- Custom internal tools — Expensive, poorly maintained, not portable

### Secondary ICP: The Implementation Team Manager

Manages a team of 3-15 implementation specialists. Needs cross-engagement visibility, resource allocation views, team performance metrics, and standardized processes across the team. Buys the Team plan.

### Tertiary ICP: The Solo Consultant

Independent consultant running implementations for multiple clients. Needs to look organized and professional. Wants a system that makes them look like a team of 10. Buys the Pro plan.

---

## 3. Product Architecture

### 3.1 Tech Stack

All selections optimized for solo-builder velocity and $0-50/mo infrastructure cost.

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14+ (App Router) | React-based, SSR for performance, Vercel-native deployment |
| **UI Framework** | Tailwind CSS + shadcn/ui | Rapid development, professional components, fully customizable |
| **Backend/DB** | Supabase (Postgres) | Already in use (life-os), auth built-in, realtime subscriptions, Row Level Security |
| **Auth** | Supabase Auth | Email/password + Google OAuth, magic links, MFA support |
| **File Storage** | Supabase Storage | PDF exports, uploaded attachments |
| **Deployment** | Vercel (Hobby → Pro) | Free tier generous, auto-deploys from GitHub, edge functions |
| **Email (Transactional)** | Resend | 100 emails/day free, React Email templates |
| **Email (Marketing)** | MailerLite | Already configured, migrate list when ready |
| **State Management** | TanStack Query (React Query) | Server state management, caching, optimistic updates |
| **Forms** | React Hook Form + Zod | Validation, type safety |
| **PDF Generation** | @react-pdf/renderer | Status reports, export to PDF |
| **Charts** | Recharts | Dashboard visualizations |
| **Rich Text** | Tiptap | Notes, descriptions, meeting agendas |
| **Drag & Drop** | dnd-kit | Kanban boards, priority reordering |

### 3.2 Free Tier Budget Breakdown

| Service | Free Tier Limits | When You'll Hit It |
|---------|-----------------|-------------------|
| Supabase | 500MB DB, 1GB storage, 50K MAU, 500K edge function invocations | ~200-500 active orgs |
| Vercel | 100GB bandwidth, serverless functions, 1 team member | ~10K monthly visitors |
| Resend | 100 emails/day, 3K/month | ~50-100 active users sending notifications |
| GitHub | Unlimited private repos | Never |
| **Total at launch** | **$0/month** | |
| **First upgrade trigger** | **~$25/mo (Supabase Pro)** | When DB exceeds 500MB or you need daily backups |

### 3.3 System Architecture

```
┌─────────────────────────────────────────────┐
│                 Client (Next.js)             │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │Dashboard │ │Templates │ │Automations   │ │
│  │  Views   │ │(MoSCoW,  │ │(Rules Engine)│ │
│  │          │ │RACI, etc)│ │              │ │
│  └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
│       │            │               │         │
│  ┌────┴────────────┴───────────────┴───────┐ │
│  │         TanStack Query Cache            │ │
│  └────────────────┬────────────────────────┘ │
└───────────────────┼──────────────────────────┘
                    │ Supabase Client SDK
┌───────────────────┼──────────────────────────┐
│               Supabase                       │
│  ┌────────────┐ ┌──────────┐ ┌────────────┐  │
│  │  Auth      │ │ Postgres │ │  Storage   │  │
│  │  (RLS)     │ │  (Data)  │ │  (Files)   │  │
│  └────────────┘ └──────────┘ └────────────┘  │
│  ┌────────────┐ ┌──────────┐                 │
│  │  Realtime  │ │  Edge    │                 │
│  │(Live sync) │ │Functions │                 │
│  └────────────┘ └──────────┘                 │
└──────────────────────────────────────────────┘
```

### 3.4 Multi-Tenancy Model

**Organization-based tenancy.** Every user belongs to an organization. All data is scoped to an organization via Supabase Row Level Security (RLS). Users can belong to multiple organizations (consultants managing multiple clients).

```
Organization
  ├── Members (users with roles: owner, admin, member, viewer)
  ├── Engagements
  │     ├── Scope Items (MoSCoW)
  │     ├── Stakeholders
  │     ├── Decisions
  │     ├── RACI Items
  │     ├── Kickoff Tasks
  │     ├── Go-Live Tasks
  │     ├── Lessons Learned
  │     └── Status Reports
  ├── Templates (system + custom)
  └── Automation Rules
```

---

## 4. Data Model

### Core Tables

**organizations**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| name | text | Company/team name |
| slug | text (unique) | URL-safe identifier |
| plan | enum | free, pro, team, enterprise |
| trial_ends_at | timestamptz | 30-day trial tracking |
| created_at | timestamptz | |
| settings | jsonb | Org-level preferences |

**org_members**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| org_id | uuid (FK → organizations) | |
| user_id | uuid (FK → auth.users) | |
| role | enum | owner, admin, member, viewer |
| invited_at | timestamptz | |
| accepted_at | timestamptz | null until accepted |

**engagements**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| org_id | uuid (FK) | Tenant isolation |
| name | text | Customer/project name |
| customer_name | text | External customer |
| status | enum | kickoff, in_progress, uat, go_live, complete, on_hold |
| health | enum | green, yellow, red |
| owner_id | uuid (FK → org_members) | |
| start_date | date | |
| target_go_live | date | |
| actual_go_live | date | nullable |
| description | text | |
| tags | text[] | Custom labels |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**scope_items** (MoSCoW tracker)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| engagement_id | uuid (FK) | |
| org_id | uuid (FK) | RLS |
| requirement | text | |
| priority | enum | must, should, could, wont |
| status | enum | approved, pending, rejected, deferred |
| requested_by | text | |
| date_added | date | |
| date_resolved | date | |
| notes | text | |
| sort_order | integer | Drag-and-drop ordering |

**stakeholders**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| engagement_id | uuid (FK) | |
| org_id | uuid (FK) | |
| name | text | |
| role | text | |
| organization | text | Internal or external |
| influence | enum | high, medium, low |
| communication_pref | enum | email, slack, call, in_person |
| key_concerns | text | |
| last_contact | date | |
| email | text | |

**decisions**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| engagement_id | uuid (FK) | |
| org_id | uuid (FK) | |
| decision | text | |
| context | text | Why this decision was made |
| made_by | text | |
| date | date | |
| impact | enum | high, medium, low |
| reversible | boolean | |
| status | enum | active, superseded, reversed |

**raci_items**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| engagement_id | uuid (FK) | |
| org_id | uuid (FK) | |
| deliverable | text | |
| responsible | text | |
| accountable | text | |
| consulted | text | |
| informed | text | |
| sort_order | integer | |

**checklist_items** (unified — kickoff + go-live)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| engagement_id | uuid (FK) | |
| org_id | uuid (FK) | |
| checklist_type | enum | kickoff, go_live |
| task | text | |
| phase | text | Pre-Kickoff, During Kickoff, etc. |
| owner | text | |
| status | enum | not_started, in_progress, complete, blocked, na |
| due_date | date | |
| sign_off | enum | pending, approved, na |
| notes | text | |
| sort_order | integer | |

**lessons_learned**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| engagement_id | uuid (FK) | |
| org_id | uuid (FK) | |
| finding | text | |
| category | enum | process, communication, technical, scope, timeline |
| impact | enum | high, medium, low |
| recommendation | text | |
| owner | text | |
| created_at | timestamptz | |

**status_reports**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| engagement_id | uuid (FK) | |
| org_id | uuid (FK) | |
| report_type | enum | internal, customer, executive |
| period_start | date | |
| period_end | date | |
| overall_health | enum | green, yellow, red |
| accomplished | jsonb | Array of items |
| planned_next | jsonb | Array of items |
| blockers | jsonb | Array of items |
| risks | jsonb | Array of items |
| generated_by | uuid (FK → org_members) | |
| pdf_url | text | Supabase Storage path |
| created_at | timestamptz | |

**automation_rules**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| org_id | uuid (FK) | |
| name | text | "Notify on status change" |
| trigger_type | enum | status_change, date_approaching, health_change, task_complete, manual |
| trigger_config | jsonb | Conditions |
| action_type | enum | email, in_app_notification, webhook, status_update |
| action_config | jsonb | What to do |
| is_active | boolean | |
| created_at | timestamptz | |

**activity_log**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| org_id | uuid (FK) | |
| engagement_id | uuid (FK) | nullable |
| user_id | uuid (FK) | |
| action | text | "updated scope item", "changed health to yellow" |
| entity_type | text | engagement, scope_item, decision, etc. |
| entity_id | uuid | |
| metadata | jsonb | Before/after values |
| created_at | timestamptz | |

---

## 5. Feature Specification

### MoSCoW Build Phases

Using John's own prioritization framework to sequence the build. All five feature areas ship in MVP, but they ship in phases so there's always something deployable.

---

### Phase 1: Foundation — MUST HAVE (Weeks 1-6)
*Goal: A working app that people can sign up for, create an org, and manage engagements.*

**1.1 Authentication & Onboarding**
- Email/password sign-up + Google OAuth via Supabase Auth
- Magic link login option
- Onboarding flow: Create organization → Invite team (optional) → Create first engagement
- Organization creation with name, slug
- User profile (name, avatar, email)

**1.2 Organization & Team Management**
- Invite members by email (generates invite link)
- Role assignment: owner (1 per org), admin, member, viewer
- Member list with role management
- User can belong to multiple organizations (org switcher in sidebar)

**1.3 Engagement Dashboard**
- Create/edit/archive engagements
- Dashboard views:
  - **Table view** (default): sortable, filterable list
  - **Kanban board**: grouped by status (kickoff → in_progress → uat → go_live → complete)
  - **Timeline view**: Gantt-style with start date → target go-live
- Health indicator (green/yellow/red) with color coding
- Quick filters: by status, health, owner, date range
- Search across engagement names and customer names
- Click into engagement → detail view with tabbed navigation (Scope | Stakeholders | Decisions | RACI | Checklists | Reports | Lessons)

**1.4 Navigation & Layout**
- Responsive sidebar: org name, engagement list, settings
- Top bar: search, notifications bell, user avatar/menu
- Breadcrumb navigation: Org → Engagement → Tab
- Mobile-responsive layout (works on tablet, functional on phone)
- Dark mode support via Tailwind/shadcn

---

### Phase 2: Interactive Templates — MUST HAVE (Weeks 7-12)
*Goal: All seven template sets from the Playbook Kit are now interactive, connected, and live inside each engagement.*

**2.1 MoSCoW Scope Tracker**
- Add/edit/delete scope items within an engagement
- Priority assignment with color-coded badges (Must=green, Should=blue, Could=yellow, Won't=red)
- Status tracking: approved, pending, rejected, deferred
- Drag-and-drop reordering within priority groups
- Filter by priority, status, requested by
- Scope change history (activity log entries)
- Summary stats: count by priority, count by status
- Inline editing (click to edit any field)

**2.2 RACI Matrix**
- Interactive matrix: rows = deliverables, columns = team members
- Click cell to assign R, A, C, or I (with color coding)
- Add/remove deliverables and team members
- Validation: each row must have exactly one A (Accountable)
- Export to PDF

**2.3 Go-Live Checklist**
- Phase-gated checklist (Pre-UAT → UAT → Pre-Launch → Launch Day → Post-Launch)
- Task status toggles: not started → in progress → complete → blocked
- Owner assignment per task
- Due date tracking with overdue highlighting
- Sign-off field per task (pending/approved/na)
- Progress bar per phase and overall
- Pre-populated from system template on engagement creation (customizable)

**2.4 Kickoff Checklist**
- Same structure as Go-Live but with kickoff phases (Pre-Kickoff → During Kickoff → Post-Kickoff)
- Pre-populated from system template
- Tracks meeting agenda items, questionnaire completion, alignment steps

**2.5 Stakeholder Matrix**
- Add/edit stakeholders per engagement
- Influence level (high/medium/low) with visual indicator
- Communication preference tracking
- Key concerns field (rich text)
- Last contact date with "days since" indicator
- Quick action: "Send update" (triggers email composition)

**2.6 Decision Log**
- Chronological log of decisions per engagement
- Required fields: decision, context (why), made by, date
- Impact level and reversibility flags
- Status: active, superseded, reversed
- Search and filter
- Timeline view showing decision history

**2.7 Lessons Learned**
- Add findings per engagement or cross-engagement
- Category tagging (process, communication, technical, scope, timeline)
- Impact rating
- Recommendation field
- Cross-engagement lessons view: see all lessons across all engagements, filterable by category
- "Apply to future engagements" flag

---

### Phase 3: Status Reports & Notifications — SHOULD HAVE (Weeks 13-16)
*Goal: Automated report generation and the notification backbone that powers automation.*

**3.1 Status Report Generator**
- Select engagement → generate report for date range
- Three report types:
  - **Internal**: detailed, includes blockers and risks
  - **Customer-facing**: polished, focused on progress and next steps
  - **Executive summary**: high-level, health + key metrics only
- Auto-populated from engagement data:
  - Health status pulled from engagement
  - Accomplished items from recently completed checklist tasks
  - Blockers from items marked "blocked"
  - Scope changes from recently added/modified scope items
- Editable before finalizing (add custom notes, adjust wording)
- Export to PDF with branding (org logo, colors)
- Email directly from the app (via Resend)
- Report history: view all past reports per engagement

**3.2 In-App Notifications**
- Notification center (bell icon in top bar)
- Notification types:
  - Engagement health changed
  - Task assigned to you
  - Checklist item completed/blocked
  - Scope item added or status changed
  - Status report generated
  - Team member joined organization
- Mark as read/unread
- Notification preferences per user (toggle each type on/off)

**3.3 Email Notifications**
- Configurable email digests: immediate, daily summary, weekly summary, off
- Transactional emails via Resend:
  - Invite to organization
  - Task assignment
  - Go-live countdown reminders (7 days, 3 days, 1 day)
  - Weekly engagement health summary
- Unsubscribe link in all emails

---

### Phase 4: Workflow Automation — SHOULD HAVE (Weeks 17-20)
*Goal: Rule-based automation that eliminates repetitive work.*

**4.1 Automation Rules Engine**
- Create automation rules per organization
- Trigger types:
  - **Status change**: when engagement status changes to X
  - **Health change**: when health changes to yellow or red
  - **Date approaching**: X days before target go-live
  - **Task complete**: when a specific checklist phase is 100%
  - **Scope change**: when new scope item is added
- Action types:
  - **Send email**: to specific stakeholders or roles
  - **In-app notification**: to specific team members
  - **Update status**: automatically advance engagement status
  - **Create checklist items**: auto-generate from template
  - **Webhook**: POST to external URL (enables Zapier/n8n integration)
- Pre-built automation templates:
  - "Go-live countdown" (7/3/1 day reminders)
  - "Health alert" (notify manager on yellow/red)
  - "Weekly status reminder" (prompt report generation every Monday)
  - "Kickoff auto-populate" (create checklists when engagement starts)
  - "Handoff notification" (email CS team when status → complete)
- Rule testing: "Dry run" mode shows what would happen without executing
- Execution log: see when automations fired and what they did

**4.2 Webhook Integration**
- Outbound webhooks on any trigger event
- Webhook payload includes: event type, engagement data, trigger context
- Retry logic (3 attempts with exponential backoff)
- Webhook log with success/failure tracking
- This enables integration with Zapier, n8n, Make, or any external system

---

### Phase 5: Team & Polish — COULD HAVE (Weeks 21-24)
*Goal: Multi-user experience refinements and the features that make teams adopt fully.*

**5.1 Team Workspace**
- Organization-level dashboard: all engagements, all team members, aggregate health
- Resource view: which team member owns which engagements, workload distribution
- Team activity feed: recent actions across all engagements

**5.2 Role-Based Access**
- **Owner**: full access, billing, can delete org
- **Admin**: manage members, all engagements, automation rules
- **Member**: create/edit engagements they own, view all
- **Viewer**: read-only access to all engagements (for stakeholders, executives)
- External sharing: generate read-only link for specific engagement (no login required, configurable expiry)

**5.3 Engagement Templates**
- Save an engagement's structure as a reusable template
- System templates (pre-built): Standard SaaS Implementation, Quick Onboarding, Data Migration, Enterprise Rollout
- Custom templates: save your own checklist items, RACI structure, scope defaults
- "New engagement from template" one-click setup

**5.4 Activity Feed & Audit Log**
- Per-engagement activity timeline showing all changes
- Who changed what, when
- Filterable by user, entity type, date range
- Exportable for compliance

**5.5 Onboarding & Empty States**
- Interactive product tour for new users (highlight key features)
- Sample engagement with pre-populated data (Acme Corp scenario)
- Meaningful empty states with clear CTAs ("Add your first scope item")
- Help tooltips on complex features

---

### Post-MVP — WON'T HAVE (Backlog)
*Documented for future reference. Not in scope for the 3-6 month build.*

- Native mobile app (iOS/Android)
- Direct integrations (Slack, Jira, Salesforce, HubSpot)
- AI-powered features (risk prediction, auto-generate reports, smart recommendations)
- Custom template builder (drag-and-drop)
- White-labeling for consultancies
- Client portal (external stakeholder login)
- Time tracking per engagement
- Billing/invoicing integration
- Marketplace for community templates
- SSO/SAML (enterprise)
- Data import from spreadsheets (migrate existing tracking)

---

## 6. Pricing Model

### Tier Structure

| | **Free** | **Pro** | **Team** | **Enterprise** |
|---|---|---|---|---|
| **Price** | $0 forever | $29/mo or $249/yr | $79/mo or $699/yr | Custom |
| **Engagements** | 2 | Unlimited | Unlimited | Unlimited |
| **Users** | 1 | 3 | 25 | Unlimited |
| **Templates** | System only | System + custom | System + custom | Custom + white-label |
| **Status Reports** | — | 5/month | Unlimited | Unlimited |
| **Automation Rules** | — | 3 rules | Unlimited | Unlimited + API |
| **PDF Export** | — | Yes | Yes | Yes |
| **External Sharing** | — | — | Yes | Yes |
| **Activity Log** | 30 days | 1 year | Unlimited | Unlimited |
| **Support** | Community | Email (48hr) | Priority (24hr) | Dedicated |
| **Trial** | — | 30 days free | 30 days free | Custom |

### Pricing Rationale

- **Free tier exists to drive adoption.** Solo consultants start here. Two engagements is enough to prove value but forces upgrade when they get busy.
- **Pro at $29/mo** targets the solo consultant or small-team lead who manages 3-8 engagements. This is the primary revenue tier. Comparable to Notion Team ($10/user/mo) but specialized, so higher per-seat value.
- **Team at $79/mo** targets implementation team managers with 5-25 members. This is the expansion tier. Cross-engagement visibility and resource management drive the upgrade.
- **Enterprise is custom** for now. Don't build enterprise features until someone asks and is willing to pay for them.

### Gumroad Migration Path

Since Gumroad is being sunset:
1. Existing Gumroad subscribers get **Pro tier free for 6 months** (loyalty + beta feedback)
2. Gumroad lifetime purchasers get **Pro tier free for 2 years**
3. All Gumroad customers get early access to the beta
4. Template files (.docx/.xlsx) remain downloadable as an export feature within the SaaS
5. Gumroad listings updated with "We've moved" notices pointing to the SaaS, then delisted after 90 days

---

## 7. Non-Functional Requirements

### Performance
- Page load: < 2 seconds (P95) on 3G connection
- Dashboard render: < 1 second with 50 engagements
- Search results: < 500ms
- PDF generation: < 5 seconds

### Security
- All data encrypted at rest (Supabase default)
- TLS 1.3 for all connections
- Row Level Security on every table (org_id scoping)
- OWASP Top 10 compliance
- Session management via Supabase Auth (JWT, refresh tokens)
- Rate limiting on auth endpoints

### Reliability
- 99.9% uptime target (Supabase + Vercel SLAs cover this)
- Daily database backups (Supabase Pro, triggered at ~$25/mo)
- Error tracking via Sentry (free tier: 5K events/month)
- Health check endpoint for monitoring

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Screen reader support for core flows
- Minimum color contrast ratios

---

## 8. Milestone Schedule

### Month 1-2: Foundation (Phase 1)
| Week | Deliverable |
|------|------------|
| 1 | Project setup: Next.js + Supabase + Vercel + GitHub. Auth flow working. |
| 2 | Database schema deployed. Organization + member CRUD. |
| 3 | Engagement CRUD. Table view with sort/filter. |
| 4 | Kanban board view. Engagement detail page with tab navigation. |
| 5 | Timeline view. Search. Mobile responsiveness pass. |
| 6 | Invite flow. Role-based access. Onboarding flow. Alpha-ready. |

**Checkpoint:** Internal alpha — John using it daily for real engagements.

### Month 3-4: Templates + Reporting (Phase 2 + 3)
| Week | Deliverable |
|------|------------|
| 7 | MoSCoW scope tracker (CRUD + drag-and-drop + filters). |
| 8 | RACI matrix (interactive grid). Go-Live checklist. |
| 9 | Kickoff checklist. Stakeholder matrix. |
| 10 | Decision log. Lessons learned (per-engagement + cross-engagement). |
| 11 | Status report generator (auto-populate + edit + PDF export). |
| 12 | Notification system (in-app + email). Report history. |

**Checkpoint:** Closed beta — invite 10-20 Gumroad customers.

### Month 4-5: Automation + Team (Phase 4 + 5)
| Week | Deliverable |
|------|------------|
| 13 | Automation rules engine (triggers + actions). |
| 14 | Pre-built automation templates. Webhook outbound. |
| 15 | Team workspace dashboard. Resource view. |
| 16 | Role-based access refinements. External sharing links. |
| 17 | Engagement templates (system + custom). |
| 18 | Activity feed. Audit log. |

**Checkpoint:** Open beta — public sign-up with "beta" badge.

### Month 5-6: Polish + Launch (Hardening)
| Week | Deliverable |
|------|------------|
| 19 | Onboarding tour. Empty states. Sample data. |
| 20 | Performance optimization. Error handling audit. |
| 21 | Billing integration (Stripe via Supabase or LemonSqueezy). |
| 22 | Landing page. Documentation/help center. |
| 23 | Gumroad migration communications. |
| 24 | Public launch. Product Hunt. LinkedIn campaign. |

**Checkpoint:** GA (General Availability) — public, paid product.

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Scope creep on the SaaS build itself | High | High | Apply MoSCoW rigorously. Ship phases, not perfection. |
| Solo builder burnout | Medium | High | 3-6 month timeline gives breathing room. Ship alpha at Week 6 for motivation. |
| Free tier limits hit before revenue | Low | Medium | Supabase Pro is $25/mo — a single Pro subscriber covers it. |
| Existing Gumroad customers resist migration | Medium | Medium | 6-month free Pro tier, early access, personal outreach. |
| Feature parity pressure (vs. Asana/Monday) | Medium | Low | Don't compete on features. Compete on fit. "Built for implementation teams" is the moat. |
| Auth/security incident | Low | High | Use Supabase Auth (battle-tested), RLS on everything, no custom auth code. |

---

## 10. Success Metrics

### North Star: Monthly Recurring Revenue (MRR)

### Leading Indicators
| Metric | Month 3 Target | Month 6 Target | Month 12 Target |
|--------|---------------|----------------|-----------------|
| Registered orgs | 50 | 200 | 500 |
| Active orgs (weekly) | 10 | 50 | 150 |
| Paid subscriptions | 0 (beta) | 20 | 50 |
| MRR | $0 | $1,000 | $5,000 |
| Churn (monthly) | — | < 10% | < 5% |
| NPS | — | > 40 | > 50 |

### Engagement Health Metrics (product usage)
- Engagements created per org per month
- Templates used (MoSCoW, RACI, checklists) per engagement
- Status reports generated per month
- Automation rules active per org
- DAU/MAU ratio (target: > 30%)

---

## Appendices

### A. Competitive Landscape

| Product | What It Does | Why Implementation Pro Wins |
|---------|-------------|---------------------------|
| Asana / Monday / Jira | Generic project management | Not built for implementation workflows. No MoSCoW, no RACI, no go-live checklists. Teams force-fit. |
| Notion | Flexible workspace | Requires building everything from scratch. No automation. No opinionated structure. |
| Rocketlane | Implementation + PSA platform | Closest competitor. But expensive ($19-49/user/mo), enterprise-focused, heavy. |
| GuideCX | Customer onboarding | Customer-facing portals, not internal implementation management. |
| Taskray (Salesforce) | Implementation on Salesforce | Locked to Salesforce ecosystem. |
| Spreadsheets + Word docs | DIY templates | Nothing is connected. No automation. No team visibility. |

**Positioning:** Implementation Pro is the mid-market answer. More opinionated than Notion, more affordable than Rocketlane, more specialized than Asana. Built by a practitioner, not a product team guessing what implementation teams need.

### B. Framework Alignment

Every feature maps to John's frameworks:

| Framework | How It Shows Up |
|-----------|----------------|
| **CARE** | Commitment (checklists track follow-through), Advocacy (stakeholder matrix), Rigor (decision log, audit trail), Efficiency (automation rules) |
| **MoSCoW** | Scope tracker IS the MoSCoW framework, digitized |
| **What/Why/How** | Decision log requires context (why). Status reports structure around what happened, why it matters, how we proceed. |
| **KISS** | UI is clean and opinionated. No customization for customization's sake. Sensible defaults. |
