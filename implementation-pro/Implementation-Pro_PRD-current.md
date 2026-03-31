# Implementation Pro - Product Requirements Document

**Version:** 3.0  
**Date:** March 31, 2026  
**Status:** Current-state PRD with explicit roadmap boundaries  
**Owner:** John Swapp  
**Scope:** Implementation Pro repository and app

## 1. Purpose

This document defines what Implementation Pro is, what is confirmed in the current repository, what must be true for the product to ship safely, and what remains explicitly planned rather than implemented.

The main rule for this PRD is simple: if a capability is not supported by the repository evidence reviewed for this document, it is marked as proposed or future state. Nothing is assumed.

## 2. Research Method and Evidence Base

This PRD was written from the current repository state and from standard product documentation patterns used by mature product teams.

Repository evidence reviewed:
- README.md
- package.json
- src/app/page.tsx
- src/app/layout.tsx
- src/app/providers.tsx
- src/app/(auth)/*
- src/app/(dashboard)/*
- src/app/api/stripe/*
- src/components/layout/sidebar.tsx
- src/components/engagements/engagement-tabs.tsx
- src/lib/supabase/*
- src/lib/stripe/client.ts
- supabase/migrations/001_initial_schema.sql
- src/types/index.ts

External guidance used for structure:
- PRDs should define the problem, goals, scope, users, requirements, success criteria, dependencies, and release boundaries.
- Architecture and roadmap documents should keep current state separate from target state.
- Product plans should be explicit about assumptions, risks, and metrics.

## 3. Product Summary

Implementation Pro is an AI-powered professional services platform for SaaS implementation teams.

The current product shape is a multi-tenant web application that provides:
- marketing entry point
- auth and account creation
- protected dashboard shell
- engagement list and engagement detail views
- governance and AI agent placeholder pages
- settings page
- Stripe checkout, portal, and webhook endpoints
- Supabase-backed data model for implementation work

The repository also contains a broad schema for future operations automation, delivery governance, work execution, self-learning, and self-healing features.

## 4. Product Vision

Implementation teams need one system of record for every engagement, from kickoff to go-live.

The product vision is to replace scattered spreadsheets, ad hoc status tracking, manual client updates, and repetitive delivery work with a single, structured workflow that can later support AI-assisted and AI-executed delivery.

### Product promise
- Keep every engagement visible.
- Keep scope, stakeholders, decisions, and checklists in one place.
- Make status, billing, and governance measurable.
- Add AI only where it is safe, reviewable, and useful.

## 5. What Is Confirmed in the Current Repo

### Current shipped surface
- Marketing homepage exists at the root route.
- Login and signup pages exist.
- OAuth callback route exists.
- Authenticated dashboard layout exists and protects routes with Supabase auth.
- Engagements list page exists and reads from Supabase.
- Engagement detail page exists and renders a tabbed workspace.
- Settings page exists and shows profile and plan placeholders.
- Governance page exists as a placeholder for Layer 2.
- AI Agents page exists as a placeholder for Layer 3.
- Stripe checkout, billing portal, and webhook routes exist.
- Supabase migration defines the data model for the product.
- TypeScript database types are generated and committed.

### Current database scope
The migration already defines these major areas:
- organizations and org_members
- engagements
- scope_items
- stakeholders
- decisions
- raci_items
- checklist_items
- lessons_learned
- status_reports
- activity_log
- automation_rules
- resource_profiles and resource_allocations
- time_entries and financial_tracking
- compliance_rules and compliance_violations
- project_plans
- risk_signals, client_updates, and delivery_signals
- agent_definitions, agent_tasks, agent_executions, and agent_artifacts
- learning_feedback, org_learning_context, and outcome_correlations
- system_health_checks, self_healing_events, and error_patterns

### Important current-state constraint
The schema is broader than the implemented UI. The advanced AI and automation tables exist, but the repository does not yet contain production AI service code that uses them. That means these capabilities are planned architecture, not shipped product behavior.

## 6. Target Users

### Primary user: Implementation Lead
Owns day-to-day implementation execution across kickoff, scope, delivery, and go-live.

Core jobs to be done:
- keep the engagement organized
- track scope and change
- manage stakeholders
- maintain decisions and checklists
- produce status reports
- avoid surprises before go-live

### Secondary user: Professional Services Manager or Director
Owns delivery performance across multiple engagements and multiple consultants.

Core jobs to be done:
- view delivery risk across the portfolio
- understand team capacity
- control margin and time burn
- standardize process across the team
- improve consistency without adding admin work

### Tertiary user: Solo consultant
Needs the same structure as a team, but with less overhead.

Core jobs to be done:
- run more than one engagement cleanly
- reuse templates and repeatable work
- stay organized without a separate PM tool
- bill correctly and protect margin

## 7. Problem Statement

Implementation work is still too fragmented.

Teams typically manage engagements across multiple tools and manual processes:
- spreadsheets for scope and RACI
- documents for status and handoff notes
- email for approvals and client updates
- calendar reminders for follow-up
- memory for risk detection

That creates predictable failure modes:
- scope creep appears late
- status updates take too long to produce
- decisions get lost
- ownership is unclear
- billing and time tracking lag behind reality
- lessons learned do not feed back into the next engagement

Implementation Pro is designed to make those failure modes visible and manageable inside one system.

## 8. Product Principles

1. Human judgment stays in the loop for anything client-facing or high risk.
2. Every engagement should have a clear source of truth.
3. The product should reduce administrative friction, not add more of it.
4. The system should explain why it flags a risk or recommendation.
5. Automation must be auditable.
6. If a capability is not yet implemented, the product should say so plainly.
7. Multi-tenant isolation and RLS are non-negotiable.
8. Billing and plan enforcement should match the actual plan entitlements.

## 9. Current Product Scope

### 9.1 In scope now
- User authentication
- Organization-aware dashboard shell
- Engagement listing and detail navigation
- Basic plan and billing plumbing
- Supabase-backed data persistence
- Status and governance placeholders
- Foundation schema for delivery operations

### 9.2 In scope for the next build cycle
- Organization CRUD and membership management
- Engagement CRUD and edit flows
- Scope, stakeholder, decision, RACI, checklist, report, and lessons modules
- Plan enforcement and usage limits
- Real billing state sync from Stripe
- Better empty states and error states

### 9.3 In scope later
- Delivery governance intelligence
- AI-generated project plans and client updates
- Agent execution and artifact review
- Self-learning recommendations
- Self-healing operations

### 9.4 Out of scope for this release cycle
- Fully autonomous agent actions without review
- Enterprise billing in Stripe if not wired in code
- Native mobile apps
- Offline mode
- Complex integrations not visible in the repository

## 10. Functional Requirements

### 10.1 Account and tenant management
1. Users must be able to sign up and log in with email/password.
2. Users must be able to log in with Google OAuth where configured.
3. Authenticated users must be redirected to the app after callback completion.
4. The dashboard must prevent unauthenticated access.
5. Users must belong to at least one organization to work in the app.
6. Organization membership must be isolated by tenant.

### 10.2 Engagement management
1. Users must be able to see a list of engagements for their organization.
2. Engagements must display at least name, customer, status, health, and target go-live date.
3. Users must be able to open an engagement detail view.
4. Engagement details must present the core working tabs:
   - scope
   - stakeholders
   - decisions
   - RACI
   - kickoff
   - go-live
   - reports
   - lessons learned
   - agents
5. Engagement detail content must eventually be editable, not static.
6. The list and detail views must support empty and error states cleanly.

### 10.3 Core delivery artifacts
1. Scope items must support MoSCoW classification.
2. Stakeholder records must support influence and communication preference.
3. Decisions must support date, impact, reversibility, and status.
4. RACI items must support role assignment per deliverable.
5. Checklist items must support kickoff and go-live phases.
6. Status reports must store period, health, accomplishments, planned next steps, blockers, and risks.
7. Lessons learned must support category, impact, recommendation, and ownership.

### 10.4 Operations and billing
1. The product must support plan-based access control.
2. The product must support Stripe checkout for paid plans.
3. The product must support billing portal access for existing subscribers.
4. Webhook processing must update organization plan state from Stripe events.
5. Plan limits must be reflected in product messaging and enforcement.

### 10.5 Governance and intelligence
1. The product must support delivery health scoring as a first-class concept.
2. Risk signals must be explainable and traceable to evidence.
3. Delivery governance must be able to compare current engagements with historical patterns.
4. AI-generated outputs must be reviewable before they become official records.
5. The product must never claim AI execution if the execution service is not live.

### 10.6 Self-learning and self-healing
1. The system must capture user feedback on AI outputs.
2. The system must store organizational learning context.
3. The system must track outcome correlations over time.
4. The system must record health checks and self-healing events.
5. The system must support future automated recovery, but not hide failures from users.

## 11. Success Metrics

### Product activation
- First account created
- First organization created
- First engagement created
- First checklist or scope item entered
- First billing event completed for paid plans

### Delivery metrics
- Engagements updated weekly
- Reports generated on schedule
- Checklist completion rate
- Scope changes captured before go-live
- Stakeholder updates produced on time

### Business metrics
- Free to paid conversion
- Pro to Team conversion
- Monthly retention
- Activation by plan
- Billing error rate
- Support tickets per active org

### Future AI metrics
- Agent task acceptance rate
- Edit rate on AI drafts
- Time saved per agent task
- Risk false positive rate
- Self-learning recommendation adoption rate

## 12. Non-Functional Requirements

### Security and tenancy
- Supabase RLS must protect tenant boundaries.
- Service role usage must be restricted to server-side routes only.
- Billing and auth tokens must never be exposed to the browser.
- Multi-tenant access must be audited.

### Reliability
- Auth and dashboard routes should fail gracefully.
- Stripe webhooks must be idempotent and resilient to retries.
- Critical data writes should be transaction-safe where possible.

### Performance
- Engagement list and detail views should remain responsive with growing data.
- Dashboard routes should use server-side data loading where it reduces client cost.
- Query patterns should align with indexed columns in the migration.

### Usability
- Empty states must explain what to do next.
- Error states must state the problem and recovery step.
- Important actions should be discoverable in one click.

### Maintainability
- Shared types should come from the generated database definitions.
- New features should be added as discrete modules, not one-off page logic.
- AI capabilities should be separated from core CRUD logic.

## 13. Roadmap

### Phase 1 - Foundation and truthfulness
Goal: make the current scaffold reliable and clearly usable.
- auth
- tenant selection and membership flow
- dashboard shell polish
- accurate plan display
- billing sync
- better navigation and empty states

Exit criteria:
- a new user can sign up, log in, land in the app, and understand what to do next

### Phase 2 - Core implementation workspace
Goal: make the app a real operating workspace.
- organizations
- engagements create/edit/delete
- scope items
- stakeholders
- decisions
- RACI
- kickoffs and go-live checklists
- lessons learned
- status reports

Exit criteria:
- a consultant can run a real engagement inside the app without leaving the platform for core project records

### Phase 3 - Delivery controls
Goal: add operational control and billing discipline.
- time entries
- budget tracking
- resource allocations
- compliance rules
- compliance violations
- plan limits and upgrade flows

Exit criteria:
- team leads can see where work, cost, and policy are going off track

### Phase 4 - Delivery governance
Goal: add explainable risk and health intelligence.
- project plans
- health scoring
- risk signals
- client updates
- delivery signal trends

Exit criteria:
- the system can explain why an engagement is at risk and what action is recommended

### Phase 5 - Work execution
Goal: create safe, reviewable AI execution.
- agent definitions
- agent tasks
- agent execution logs
- artifacts and review UI
- learning feedback loop

Exit criteria:
- AI can draft work products, but nothing client-facing becomes official without review unless explicitly allowed by policy

### Phase 6 - Self-learning and self-healing
Goal: improve quality and resilience over time.
- org learning context
- outcome correlations
- health checks
- healing events
- error pattern tracking

Exit criteria:
- the system improves recommendations and response behavior based on measured history, not guesses

## 14. Dependencies

### Technical dependencies
- Supabase project and schema migration
- Stripe account and live price IDs for Pro and Team
- Auth environment variables
- A deployment target such as Vercel

### Product dependencies
- Finalized plan limits
- Finalized onboarding flow
- Finalized data ownership policy
- Finalized AI review policy

### Operational dependencies
- A support path for billing questions
- A release process for schema changes
- A logging and incident workflow for production issues

## 15. Risks

1. The product can overpromise on AI before AI is actually live.
2. Schema can get ahead of UI delivery and create the illusion of shipped capability.
3. Multi-tenant billing logic can drift from plan messaging.
4. Without tests, regressions may hide in auth, billing, and route protection.
5. The system can become overmodeled before real customer usage exists.

## 16. Explicit Open Questions

These are intentionally left unresolved because the repository does not prove the answer yet.
- Which AI provider is live in production, if any?
- Which exact email provider is wired for transactional communication, if any?
- Is enterprise billing planned only, or already supported outside the reviewed code?
- Which features are currently hidden behind feature flags, if any?
- What is the first customer segment to receive a full beta?

## 17. Acceptance Criteria for This PRD

This PRD is considered complete when:
- the current repo state is described without inventing functionality
- shipped features and planned features are separated clearly
- the requirements map to the actual schema and routes in the repository
- risks, dependencies, and open questions are explicit
- the roadmap is sequenced from current scaffold to target platform

## 18. Bottom Line

Implementation Pro is currently a real product scaffold with a meaningful implementation data model, auth, dashboards, billing routes, and roadmap direction. The next milestone is not to add more vision; it is to turn the current scaffold into a trustworthy operating system for implementation teams, one phase at a time.
