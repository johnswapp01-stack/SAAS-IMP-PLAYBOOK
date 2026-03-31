# Implementation Pro - Go-to-Market Plan

**Version:** 3.0  
**Date:** March 31, 2026  
**Status:** Current-state GTM with launch sequencing for future AI releases  
**Owner:** John Swapp

## 1. Purpose

This plan defines how Implementation Pro should be positioned, launched, and sold based on the current repository state.

The guiding rule is strict: market only what the product actually supports today, and separately stage the narrative for future AI capabilities that are modeled but not yet live in the code review.

## 2. GTM Reality Check

### What can be sold now
- a structured implementation workspace
- engagement management from kickoff to go-live
- scope, stakeholders, decisions, RACI, checklists, reports, lessons learned
- auth and billing plumbing
- a multi-tenant foundation

### What should not be promised as live today
- autonomous AI execution
- self-learning recommendations as a shipped feature
- self-healing as a production capability
- AI-generated governance output if the service layer is not yet built

### Why this matters
The repository is strong on schema and roadmap, but the visible app surface is still a scaffold. The GTM needs to match the current reality or the product will lose trust before it has a chance to compound.

## 3. Market Category

### Current category
Implementation management workspace for SaaS delivery teams.

### Target category
AI-powered implementation operating system.

### Category strategy
Do not jump straight to the target category in every message if the product cannot yet support the promise.
Use a phased narrative:
1. current: structured implementation workspace
2. near-term: delivery governance and automation
3. future: AI execution and learning loop

## 4. Positioning

### Current positioning statement
Implementation Pro gives SaaS implementation teams one workspace to manage engagements, scope, stakeholders, decisions, checklists, reports, and billing from kickoff to go-live.

### Future positioning statement
Implementation Pro becomes the operating system for implementation teams, with AI agents that generate, monitor, and execute repeatable delivery work.

### Messaging rule
Lead with current value first. Use the AI story as roadmap, not as a substitute for what exists now.

## 5. Buyer Segments

### Segment 1 - Solo implementation consultant
Needs a clean system to run multiple engagements without living in spreadsheets.

Primary pains:
- too many moving parts
- no single source of truth
- recurring admin work
- inconsistent handoffs

Buy motion:
- self-serve
- low-friction upgrade path
- quick onboarding

### Segment 2 - Implementation lead
Needs control over delivery details inside a team or client engagement.

Primary pains:
- scope drift
- missed follow-up
- weak visibility on decisions and ownership
- status reporting overhead

Buy motion:
- self-serve Pro or Team
- founder-led support and onboarding
- examples and templates that feel ready to use

### Segment 3 - Professional Services manager or director
Needs visibility across multiple engagements and team members.

Primary pains:
- uneven process across the team
- lack of portfolio visibility
- margin pressure
- hard-to-spot risk

Buy motion:
- Team plan
- direct outreach
- design partner beta

### Segment 4 - Enterprise services organization
Needs deeper governance, controls, and custom workflows.

Primary pains:
- standardization
- auditability
- access controls
- operational scale

Buy motion:
- custom / future enterprise motion only after the product proves governance and agent reliability

## 6. Packaging and Pricing

### Current confirmed pricing in code
- Free - up to 2 engagements, 1 user, core templates, basic reports
- Pro - $49/mo, unlimited engagements, 3 users, AI status report generation listed in plan metadata, 50 AI agent tasks/month
- Team - $149/mo, unlimited engagements, 25 users, all AI agent types listed in plan metadata, 500 AI agent tasks/month
- Enterprise - represented in data types, but not yet wired through the Stripe plan code reviewed

### GTM packaging guidance
- Free should be treated as activation, not revenue.
- Pro should be the self-serve conversion tier.
- Team should be the serious delivery-control tier.
- Enterprise should remain custom until governance, security, and billing are proven.

### Packaging principle
Package by operational maturity, not by feature count alone.

## 7. Core Message Architecture

### Message 1 - current truth
One workspace to run SaaS implementations from kickoff to go-live.

### Message 2 - problem statement
Implementation teams lose time and accuracy because work lives across spreadsheets, docs, email, and memory.

### Message 3 - outcome
Implementation Pro makes scope, stakeholders, decisions, checklists, reports, and billing visible in one place.

### Message 4 - roadmap story
The schema already prepares the platform for AI governance, AI execution, learning, and healing. Those capabilities will be introduced only when they are real and reviewable.

### Message 5 - future differentiator
When the agent layer ships, the product will do more than manage work. It will help execute work.

## 8. Proof Points to Use Now

These are the claims the current codebase can support:
- login and signup exist
- protected dashboard exists
- engagements are stored and listed from Supabase
- engagement detail pages exist
- the app already models scope, stakeholders, decisions, RACI, checklists, reports, lessons, billing, governance, and agent tables
- Stripe checkout, billing portal, and webhook routes exist

Do not claim these as live if the user-facing experience is not yet polished or fully wired.

## 9. Channel Strategy

### Channel 1 - founder-led LinkedIn
Primary awareness channel.

Use for:
- build-in-public updates
- product screenshots
- implementation lessons from John's lived experience
- short demos of what is actually shipping

Best content types:
- before/after process posts
- short product walkthrough clips
- lessons from real implementation work
- roadmap transparency posts

### Channel 2 - direct outreach
Best for design partners and early team buyers.

Targets:
- implementation leads
- PS directors
- consultancy founders
- current Gumroad or template buyers

Use a direct message that offers:
- early access
- influence on roadmap
- a structured onboarding path
- clear explanation of what is live today

### Channel 3 - existing audience and product migration
If the existing audience includes template buyers, they are the highest-intent migration path.

Use for:
- conversion from static templates to the live product
- upgrade messaging from manual playbooks to a working system
- early adopter feedback

### Channel 4 - Substack or long-form content
Use for category education and trust-building.

Topics:
- why implementation teams need a single system of record
- why generic PM tools do not fit implementation work well
- how scope, decisions, and governance should be structured
- how AI should be introduced with human review

### Channel 5 - launch directories and SEO
Use later, after the product has enough visible value.

Use for:
- Product Hunt
- comparison pages
- implementation templates SEO
- AI implementation workflow content

## 10. Launch Phases

### Phase 1 - Design partner beta
Goal: prove that the current workspace saves time and reduces confusion.

Offer:
- free or discounted access
- fast support
- close feedback loop

What to validate:
- can users create and manage real engagements
- do they understand the structure quickly
- do they return weekly
- do they ask for governance and automation next

### Phase 2 - Paid self-serve launch
Goal: convert solo consultants and small teams.

Offer:
- Free plan for activation
- Pro for solo consultants
- Team for small delivery teams

What to validate:
- billing works
- plan limits are understandable
- the app feels valuable before any AI promise

### Phase 3 - Governance launch
Goal: introduce delivery health, risk signals, and client update drafting once those features are actually built.

Offer:
- more control
- less manual status work
- portfolio visibility

What to validate:
- risk and health explanations are trusted
- users act on recommendations
- the output is reviewable and useful

### Phase 4 - AI execution launch
Goal: introduce agent execution only after the agent layer is real.

Offer:
- draft generation
- review and approval workflows
- artifact tracking
- measured time savings

What to validate:
- outputs are accepted or edited, not ignored
- the system improves with feedback
- AI is a productivity gain rather than a trust problem

## 11. Funnel Design

### Awareness
- LinkedIn impressions
- newsletter reads
- direct referrals
- product demos

### Interest
- landing page visits
- signup rate
- waitlist or beta request rate

### Activation
- first account created
- first organization created
- first engagement created
- first checklist or scope item entered

### Revenue
- free to Pro conversion
- Pro to Team conversion
- renewal rate

### Retention
- weekly active organizations
- weekly updated engagements
- repeated use of reports and checklists

### Expansion
- additional users added
- additional engagements created
- upgrade to Team

### Future AI activation
- first drafted report accepted
- first risk signal reviewed
- first agent artifact approved

## 12. Content Engine

### Content pillars
1. implementation workflow clarity
2. scope and governance discipline
3. billing and delivery operations
4. AI with human review
5. lessons learned from real implementation work

### Content principles
- show real product surfaces, not mockups dressed up as shipped features
- teach the workflow before selling the future
- use practical language over hype
- separate current state from roadmap language

### Example content themes
- how to run kickoff, scope, and go-live in one system
- why implementation teams need a better source of truth than spreadsheets
- how billing and delivery control fit together
- what AI should and should not do in a delivery workflow

## 13. Sales Motion

### Self-serve motion
Best for:
- solo consultants
- small teams
- people already looking for a structured implementation workspace

### Founder-led motion
Best for:
- design partners
- professional services leaders
- customers who need reassurance about roadmap and workflow fit

### Sales qualification questions
- How many active engagements do you run?
- Where do scope, decisions, and checklists live today?
- How often do you produce status reports?
- Do you need team visibility or solo workflow control?
- Are you buying a workspace now, or do you need AI execution later?

## 14. Metrics

### Core GTM metrics
- signup conversion rate
- activation rate
- week 1 return rate
- week 4 retention
- upgrade rate from Free to Pro
- upgrade rate from Pro to Team
- churn
- support questions per active org

### Trust metrics for the future AI layer
- AI acceptance rate
- edit rate on AI output
- rejection reasons
- time saved per task
- user confidence in recommendations

## 15. Launch Guardrails

1. Do not say the product has autonomous agents unless that service is live.
2. Do not sell self-learning as a finished feature if it is only modeled in schema.
3. Do not lead with enterprise if enterprise billing and controls are not ready.
4. Do not overclaim AI results before real customer data exists.
5. Do not hide the roadmap gap - transparency is part of the trust strategy.

## 16. Risks

### Risk 1 - category confusion
If the product is marketed as a full AI platform too early, buyers may expect a level of automation the app cannot yet provide.

### Risk 2 - feature mismatch
If billing and plan language outpace the actual UI, users will find the discrepancy quickly.

### Risk 3 - weak proof
If the product is sold before the core workspace is strong, the market will not have a reason to trust the AI roadmap later.

### Risk 4 - audience mismatch
Generic PM messaging will miss the implementation-specific pain.

### Risk 5 - channel dilution
Trying to use every channel at once will dilute a product that is still in early maturity.

## 17. Immediate Next Actions

1. Align landing page messaging with the current truth.
2. Pick the first design partner segment.
3. Build the workspace features that support real usage now.
4. Make billing and entitlements truthful.
5. Publish one clear roadmap post that distinguishes current value from future AI value.

## 18. Bottom Line

Implementation Pro should be sold today as a focused implementation workspace with a strong roadmap into governance and AI execution. The winning GTM is not hype. It is a disciplined sequence: prove the workspace, earn trust, then introduce AI once it is real and reviewable.
