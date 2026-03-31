# Implementation Pro — Go-to-Market Plan
### From Gumroad Templates to SaaS Platform
**Author:** John Swapp | **Version:** 1.0 | **Date:** March 30, 2026

---

## 1. Strategic Context

### Where We Are

Implementation Pro exists today as a suite of five digital products on Gumroad (templates, Notion workspace, automation workflows) generating subscription revenue from implementation professionals. The brand, audience, and product-market fit are validated. LinkedIn is the primary distribution channel with Substack as secondary.

### Where We're Going

A purpose-built SaaS platform that replaces the Gumroad product suite entirely. Everything that was downloadable becomes interactive. Everything that was manual becomes automated. The Gumroad storefront sunsets. Implementation Pro becomes a hosted platform with a free tier, paid subscriptions, and team plans.

### Why This GTM Plan Matters

The transition from digital products to SaaS changes the business model fundamentally:
- **Revenue model shifts** from one-time/low-commitment subscriptions ($9-15/mo) to higher-value SaaS subscriptions ($29-79/mo)
- **Customer relationship deepens** from "download and go" to ongoing platform usage
- **Distribution changes** from Gumroad marketplace discovery to direct acquisition
- **Competitive positioning sharpens** from "template seller" to "platform for implementation teams"

The GTM plan must manage this transition without losing existing customers, while opening up a larger addressable market.

---

## 2. Market Analysis

### Total Addressable Market (TAM)

The SaaS implementation and professional services market is large and growing:

- **Implementation teams at SaaS companies:** ~15,000 companies with 5+ person implementation teams globally
- **Professional services consultancies:** ~50,000 firms doing SaaS implementation consulting
- **Solo implementation consultants:** ~100,000+ independent consultants
- **Adjacent roles (CS Managers with impl responsibilities):** ~200,000+

**Conservative serviceable market:** 10,000 teams/individuals actively seeking implementation-specific tooling, willing to pay $29-79/mo.

**Revenue potential at maturity:** 500 paying customers x $50 avg MRR = $25K MRR / $300K ARR. That's the 3-year target. Year 1 target is $60K ARR ($5K MRR).

### Competitive Positioning

**The gap in the market:** There's a clear whitespace between "generic project management" (Asana, Monday) and "enterprise professional services automation" (Rocketlane, Kantata, Taskray). Mid-market implementation teams — the ones with 2-15 specialists — have no purpose-built, affordable platform.

**Implementation Pro's positioning statement:**

> Implementation Pro is the operating system for SaaS implementation teams. Built by a practitioner who runs implementations for a living — not a product team guessing what you need. Purpose-built frameworks (MoSCoW, RACI, CARE), automated workflows, and a single dashboard that shows every engagement's health at a glance. Start free. Scale with your team.

**Category creation vs. category entry:**

We're not entering "project management." We're defining "implementation management" as its own category. This matters because:
- Category leaders command premium pricing
- First-mover in a new category owns the vocabulary
- Smaller TAM but higher win rate and lower CAC

### Buyer Psychology (Schwartz Awareness Levels)

| Segment | Awareness Level | GTM Approach |
|---------|----------------|-------------|
| **Existing Gumroad customers** | Most Aware — already know the brand and bought products | Direct migration: "The templates you love are now a platform. Here's your free Pro access." |
| **LinkedIn followers** | Product Aware — know John's content, may know the products | Nurture: Build-in-public content showing the platform, then invite to beta. |
| **Implementation professionals on LinkedIn** | Solution Aware — know they need better tools, seen competitors | Differentiate: "Built by a practitioner, not a PM tool with implementation bolted on." |
| **Implementation teams using spreadsheets** | Problem Aware — feel the pain of manual tracking, haven't looked for solutions | Agitate + educate: "Here's what happens when scope creep goes untracked for 6 weeks." |
| **CS/Onboarding managers** | Unaware to Problem Aware — don't identify as "implementation" yet | Story + identity: "If you're managing customer onboarding, you're running implementations. Here's what that means." |

---

## 3. Pricing & Monetization Strategy

### Pricing Tiers (from PRD)

| | Free | Pro ($29/mo) | Team ($79/mo) | Enterprise |
|---|---|---|---|---|
| Target | Solo consultants, evaluators | Solo leads, small teams | Implementation team managers | Large orgs, consultancies |
| Key limit | 2 engagements, 1 user | 3 users, 5 reports/mo, 3 automations | 25 users, unlimited everything | Custom |

### Pricing Psychology

**Anchoring strategy:** The landing page shows Team ($79/mo) first, making Pro ($29/mo) feel like a deal. Enterprise ("Let's talk") anchors high. Free tier is positioned as a starting point, not the destination.

**Annual discount:** 30% off (Pro: $249/yr saves $99; Team: $699/yr saves $249). Annual plans improve cash flow and reduce churn.

**No lifetime tier.** The Gumroad products had lifetime options. The SaaS does not. Lifetime pricing signals "this product might not exist in a year." SaaS signals ongoing value.

### Revenue Projection (Conservative)

| Month | Free Orgs | Pro Subs | Team Subs | MRR | Cumulative |
|-------|----------|---------|----------|-----|-----------|
| 1 (Beta) | 30 | 0 | 0 | $0 | $0 |
| 2 | 60 | 0 | 0 | $0 | $0 |
| 3 | 100 | 5 | 0 | $145 | $145 |
| 4 | 140 | 10 | 1 | $369 | $514 |
| 5 | 180 | 15 | 2 | $593 | $1,107 |
| 6 (Launch) | 250 | 25 | 3 | $962 | $2,069 |
| 9 | 350 | 40 | 5 | $1,555 | $6,734 |
| 12 | 500 | 60 | 10 | $2,530 | $16,924 |

**Break-even on infrastructure:** A single Pro subscriber ($29/mo) covers Supabase Pro ($25/mo). By Month 3, infrastructure costs are covered.

### Gumroad Sunset Timeline

| When | Action |
|------|--------|
| SaaS beta launch | Email all Gumroad customers: "You're getting free Pro access." |
| Beta + 30 days | Update Gumroad listings: "We've moved to a full platform. Your subscription includes Pro access." |
| Beta + 60 days | Stop accepting new Gumroad subscriptions. Existing subs continue. |
| Beta + 90 days | Final Gumroad email: "Your subscription has been migrated. Gumroad access ends in 30 days." |
| Beta + 120 days | Delist all Gumroad products. Redirect URLs to SaaS landing page. |

---

## 4. Distribution Channels

### Channel 1: LinkedIn (Primary — Owned)

**Why it's primary:** John already has an audience here. Implementation professionals are active on LinkedIn. Content marketing on LinkedIn is free and compounds over time.

**GTM Content Strategy — Three Phases:**

**Phase A: Build-in-Public (Months 1-3 of development)**

Share the journey of building Implementation Pro. This does three things simultaneously: builds anticipation, establishes authority, and creates a waitlist.

Content calendar (2-3 posts/week):
- **Monday — Behind the Build:** Technical decisions, architecture choices, feature previews. "Here's why I chose Supabase over Firebase for Implementation Pro." Screenshot of the actual product being built.
- **Wednesday — Implementation Wisdom:** Framework posts that demonstrate expertise. These are the same posts John already writes, but now they tie back to the platform. "The MoSCoW framework saved an engagement last week. Here's the story — and it's now a built-in feature of what I'm building."
- **Friday — Community + Ask:** Polls, questions, and engagement posts. "Implementation teams: what's the first thing you check on Monday morning? I'm designing the dashboard for exactly this."

**Waitlist CTA (in first comment, every post):**
"Building a platform purpose-built for implementation teams. Join the beta waitlist → [link]"

**Phase B: Beta Invitation (Months 3-4)**

Shift from "I'm building" to "You can try it." Content becomes proof-oriented.

- Feature demo videos (60-90 second Loom recordings)
- Beta user testimonials (even 1-2 early quotes)
- "Before/after" posts: "Here's how [task] used to work with spreadsheets vs. inside Implementation Pro"
- Direct outreach to engaged commenters: "You commented on my MoSCoW post — want early access?"

**Phase C: Launch & Growth (Months 5-6+)**

Full launch push. Content shifts to customer stories, outcomes, and growth.

- Customer case studies (even if they're short)
- Feature announcements
- "How I use it" posts showing John's actual dashboard
- Engagement with implementation community (comment on others' posts, participate in discussions)

**LinkedIn Rules (carry forward from existing GTM):**
- NEVER put product links in the post body — links suppress reach
- Product/UTM links always go in the FIRST COMMENT
- Social UTM: `?utm_source=linkedin&utm_medium=social&utm_campaign=impl-pro-saas-launch`

### Channel 2: Substack (Secondary — Owned)

**"The Implementation Brief"** at johnswapp.substack.com becomes the deeper-dive companion to LinkedIn.

- **Weekly article (Tuesdays):** Longer-form content on implementation methodology, with natural ties to the platform. "How to run a scope review meeting" includes screenshots from the MoSCoW tracker.
- **Daily Notes:** Quick tips, observations, industry commentary. Lightweight engagement.
- **Subscriber-only content:** Beta access announcements, behind-the-scenes updates, early feature previews. Creates exclusivity and drives subscriptions.

### Channel 3: Product Hunt (One-Time — Earned)

**Timing:** Launch day (Month 5-6).

**Preparation (start 4 weeks before):**
1. Create Product Hunt maker profile
2. Upload assets: logo, screenshots, demo video
3. Write tagline: "The operating system for SaaS implementation teams"
4. Write description (250 words, benefit-focused)
5. Line up 10-15 people to upvote and leave genuine reviews on launch day
6. Schedule launch for Tuesday or Wednesday (highest traffic days)

**Launch day:**
- Post to LinkedIn: "We just launched on Product Hunt" (link in first comment)
- Email list: "We're live on Product Hunt — here's the link"
- Respond to every comment on PH within 2 hours

**Realistic expectation:** Product Hunt drives 500-2,000 visitors on launch day. Conversion to free sign-up: 5-10%. That's 25-200 new registrations. The long-tail SEO value of the PH listing persists for months.

### Channel 4: Content Marketing / SEO (Long-Term — Owned)

**Blog on the main site** (implementationpro.com/blog or similar):

Target keywords that implementation professionals search:
- "saas implementation checklist"
- "implementation kickoff meeting agenda"
- "moscow prioritization template"
- "raci matrix for implementation"
- "go live checklist saas"
- "implementation scope creep"
- "customer onboarding automation"

**Content format:** In-depth guides (1,500-2,500 words) that rank for these terms. Each guide includes screenshots from the platform and a CTA to try it free.

**Timeline:** Start publishing after launch. 2 posts/month minimum. SEO compounds — expect meaningful organic traffic at Month 9-12.

### Channel 5: Direct Outreach (Targeted — Manual)

**Dream 100 approach** (from Traffic Secrets):

Identify 100 people/communities where implementation professionals gather:
- LinkedIn groups focused on implementation, onboarding, professional services
- Slack communities (SaaS Implementation, Customer Success, Professional Services)
- Reddit: r/projectmanagement, r/SaaS, r/consulting
- Podcasts that cover implementation, customer success, professional services
- Conference speakers and authors in the space

**Outreach strategy:**
1. Engage genuinely in these communities (no spam)
2. Share the free tier as a helpful resource
3. Offer to guest on podcasts or write guest posts
4. Build relationships with 5-10 "sneezers" (influencers) who can amplify

### Channel 6: Gumroad Customer Migration (One-Time — Owned)

This is the easiest channel — people who already paid for your products.

**Migration sequence:**
1. **Email 1 (Beta launch):** "You bought the Playbook Kit. I turned it into a platform. Here's your free Pro access for 6 months."
2. **Email 2 (Beta + 2 weeks):** "Here's what's new in Implementation Pro this week" — feature update
3. **Email 3 (Beta + 4 weeks):** "How [feature] replaces [template they downloaded]" — migration guide
4. **Email 4 (Beta + 6 weeks):** "Your feedback is shaping the product" — ask for testimonial
5. **Email 5 (before Gumroad sunset):** "Gumroad access ends [date]. Your Pro access continues here."

---

## 5. Messaging Framework

### Core Messaging

**Tagline:** "Run implementations, not spreadsheets."

**Value proposition (elevator pitch):**
"Implementation Pro is the first platform built specifically for SaaS implementation teams. Manage every engagement from kickoff to go-live — scope tracking, stakeholder alignment, go-live readiness, status reports, and automated workflows — in one place. Built by an implementation specialist, not a project management company. Start free."

**One-liner (StoryBrand format):**
Problem + Solution + Result:
"Implementation teams waste hours on spreadsheet tracking and manual reports. Implementation Pro gives you a single dashboard with built-in MoSCoW scope tracking, automated status reports, and go-live checklists — so you can focus on the actual implementation."

### Messaging by Audience

**For the solo consultant:**
"Look like a team of 10. Run every engagement with the same structured process, the same professional reports, the same stakeholder management — without the overhead. Implementation Pro is your back office."

**For the team lead:**
"See every engagement's health in one glance. Know who's blocked, what's behind, and where scope is creeping — before the customer tells you. Implementation Pro is your command center."

**For the team manager:**
"Standardize how your team runs implementations. Same frameworks, same checklists, same reporting — across every specialist, every engagement. Implementation Pro is your operating system."

### Objection Handling

| Objection | Response |
|-----------|---------|
| "We already use Asana/Monday" | "Those are great for generic project management. Implementation Pro is built for implementation-specific workflows — MoSCoW scope tracking, RACI matrices, go-live checklists, stakeholder management. Things you'd need to build from scratch in Asana." |
| "We built our own system in Notion" | "Notion is flexible, but you have to build everything yourself and nothing is automated. Implementation Pro gives you the structure Notion requires you to create, with automation built in. Your team can start running implementations on day one." |
| "Why should I pay when I can use templates?" | "Templates are where we started too. But templates don't connect to each other, don't automate reminders, don't generate reports, and don't give you cross-engagement visibility. The platform is what happens when templates grow up." |
| "It's just you building this. Will it last?" | "Fair question. The product is built on Supabase and Vercel — enterprise-grade infrastructure. Your data is always exportable. And the free tier means you can evaluate without risk. But more importantly — this is built by someone who runs implementations every day. I'm not going anywhere." |
| "We need Salesforce/Jira integration" | "Webhook integration is built in, which connects to Zapier, n8n, or Make for any integration. Direct Salesforce and Jira integrations are on the roadmap and will be driven by customer demand." |

---

## 6. Launch Playbook

### Pre-Launch (Development Months 1-3)

**Week 1-2: Infrastructure**
- [ ] Register domain (implementationpro.com or impl-pro.com)
- [ ] Set up landing page with waitlist form (simple Next.js page on Vercel)
- [ ] Create "Join the Beta" email list in MailerLite (separate from Gumroad list)
- [ ] Update LinkedIn bio to mention "Building Implementation Pro"
- [ ] First "build-in-public" LinkedIn post

**Week 3-8: Content Drumbeat**
- [ ] 2-3 LinkedIn posts/week (build-in-public + implementation wisdom)
- [ ] Weekly Substack article tying methodology to platform features
- [ ] Monthly waitlist update email ("Here's what we built this month")
- [ ] Engage in 3-5 LinkedIn/Slack communities weekly

**Week 9-12: Beta Preparation**
- [ ] Identify 20-30 beta candidates (Gumroad customers + engaged LinkedIn followers)
- [ ] Prepare beta onboarding email sequence (3 emails over 7 days)
- [ ] Create feedback collection mechanism (in-app feedback widget or Typeform)
- [ ] Record 3-minute product demo video

### Beta Launch (Month 3-4)

**Beta Launch Day:**
- [ ] Flip the switch — beta is live
- [ ] Email beta invitees with access link + 6-month free Pro
- [ ] LinkedIn post: "Implementation Pro is in beta. Here's what 3 months of building looks like." (Screenshots, short video)
- [ ] Substack: dedicated article on the beta launch
- [ ] Personal DMs to 10 most engaged LinkedIn followers

**Beta Period (4-6 weeks):**
- [ ] Weekly check-in emails to beta users
- [ ] Collect feedback actively (in-app + direct conversation)
- [ ] Fix top 3 issues every week
- [ ] Share beta user quotes on LinkedIn (with permission)
- [ ] Refine onboarding based on where users get stuck

**Beta to GA Criteria:**
- [ ] 10+ active beta users using the product weekly
- [ ] Core flows work reliably (create engagement, manage scope, generate report)
- [ ] NPS > 30 from beta users
- [ ] No critical bugs open
- [ ] Billing/payment integration working

### Public Launch (Month 5-6)

**Launch Week:**
- [ ] Product Hunt submission (Tuesday or Wednesday)
- [ ] LinkedIn launch post + follow-up posts throughout the week
- [ ] Substack launch article: "Why I built Implementation Pro (and what's next)"
- [ ] Email entire list (MailerLite): "Implementation Pro is live"
- [ ] Email Gumroad customers: migration offer
- [ ] Update all UTM links for launch campaign

**Launch Month:**
- [ ] Daily engagement on LinkedIn (respond to comments, engage with community)
- [ ] 2 case study posts (beta users)
- [ ] Guest appearance on 1-2 podcasts (if lined up during pre-launch)
- [ ] Begin SEO content publishing (2 posts)
- [ ] Monitor and respond to all support within 24 hours

### Post-Launch Growth (Month 6+)

**Monthly cadence:**
- 8-12 LinkedIn posts/month (mix of methodology + product + customer stories)
- 4 Substack articles/month
- 2 SEO blog posts/month
- 1 feature announcement
- 1 customer spotlight
- Monthly metrics review (MRR, signups, activation, churn)

**Quarterly cadence:**
- Pricing review (is the free tier converting?)
- Feature prioritization based on customer feedback
- Competitive landscape check
- Content strategy refresh

---

## 7. Metrics & Measurement

### Funnel Metrics

```
Awareness (LinkedIn impressions, Substack subscribers)
    |
Interest (Landing page visits, waitlist signups)
    |
Activation (Free account created, first engagement created)
    |
Engagement (Weekly active use, 3+ features used)
    |
Revenue (Upgrade to Pro/Team)
    |
Retention (Monthly renewal, expansion to Team)
    |
Referral (Invite team members, share with peers)
```

### Key Metrics by Phase

| Metric | Beta Target | Launch Target | Month 12 Target |
|--------|------------|--------------|-----------------|
| Waitlist signups | 200 | — | — |
| Free registrations | 50 | 250 | 500 |
| Activation rate (created engagement) | 60% | 50% | 50% |
| Free to Pro conversion | — | 8% | 10% |
| Pro to Team expansion | — | — | 5% |
| Monthly churn (Pro) | — | < 10% | < 5% |
| NPS | > 30 | > 40 | > 50 |
| MRR | $0 | $1,000 | $5,000 |

### UTM Structure for SaaS

| Channel | UTM Pattern |
|---------|------------|
| LinkedIn posts | `?utm_source=linkedin&utm_medium=social&utm_campaign=impl-pro-saas` |
| LinkedIn bio | `?utm_source=linkedin&utm_medium=profile&utm_campaign=impl-pro-saas` |
| Substack | `?utm_source=substack&utm_medium=newsletter&utm_campaign=impl-pro-saas` |
| Product Hunt | `?utm_source=producthunt&utm_medium=listing&utm_campaign=impl-pro-launch` |
| SEO / Blog | `?utm_source=blog&utm_medium=organic&utm_campaign=impl-pro-seo` |
| Email (MailerLite) | `?utm_source=email&utm_medium=newsletter&utm_campaign=impl-pro-saas` |
| Gumroad migration | `?utm_source=gumroad&utm_medium=migration&utm_campaign=impl-pro-migration` |
| Direct / referral | `?utm_source=direct&utm_medium=referral&utm_campaign=impl-pro-saas` |

---

## 8. Budget

### Development Phase (Months 1-4) — $0/mo

| Item | Cost | Notes |
|------|------|-------|
| Supabase | $0 | Free tier |
| Vercel | $0 | Hobby plan |
| Domain | ~$12/yr | One-time |
| GitHub | $0 | Free private repos |
| Resend | $0 | Free tier (100 emails/day) |
| Sentry | $0 | Free tier (5K events/mo) |
| MailerLite | $0 | Existing, free plan |
| **Total** | **~$1/mo** | Domain amortized |

### Launch Phase (Months 5-6) — $25-50/mo

| Item | Cost | Notes |
|------|------|-------|
| Supabase Pro | $25/mo | Daily backups, more storage |
| Vercel | $0-20/mo | Upgrade if traffic warrants |
| Stripe | 2.9% + 30c/txn | Only when revenue flows |
| **Total** | **$25-45/mo** | Covered by 1-2 Pro subscribers |

### Growth Phase (Months 7-12) — $50-150/mo

| Item | Cost | Notes |
|------|------|-------|
| Supabase Pro | $25/mo | |
| Vercel Pro | $20/mo | Team features, analytics |
| Resend Pro | $20/mo | If email volume grows |
| Sentry | $0-26/mo | If error volume grows |
| Misc tools | $0-50/mo | As needed |
| **Total** | **$65-141/mo** | Covered by ~3-5 Pro subscribers |

**Rule:** Infrastructure costs should never exceed 20% of MRR. If they do, optimize before scaling.

---

## 9. Risk Mitigation

| Risk | Mitigation Strategy |
|------|-------------------|
| **Nobody signs up for the beta** | Build-in-public content creates awareness. Gumroad customer base guarantees at least 20-30 beta users. Worst case: invite them personally. |
| **Free tier users don't convert** | Monitor activation metrics closely. If conversion < 5% after 90 days, either the free tier is too generous or the upgrade trigger is wrong. Adjust limits. |
| **Gumroad customers angry about sunset** | Generous migration terms (6 months free Pro). Personal communication, not automated blast. Export option for template files. |
| **Competitor launches something similar** | Speed matters less than fit. Deep implementation expertise is the moat — generic competitors can't fake domain knowledge. Double down on content authority. |
| **Solo builder can't support customers** | Build self-serve support first: in-app help, FAQ, documentation. Community forum before live support. Only offer email support on paid tiers. |
| **Burnout** | Ship in phases. Celebrate milestones. Use the product yourself (dogfooding). Take breaks between phases. |

---

## 10. 90-Day Quick-Start Action List

### This Week (Days 1-7)
1. Register domain
2. Set up GitHub repo with Next.js + Supabase + Tailwind + shadcn/ui
3. Deploy to Vercel (empty shell, proves the pipeline works)
4. Create waitlist landing page (single page: tagline + email capture)
5. First LinkedIn build-in-public post

### Next 2 Weeks (Days 8-21)
6. Auth flow working (sign up, login, logout)
7. Organization CRUD
8. Database schema deployed (all core tables)
9. Second and third LinkedIn build-in-public posts
10. Create "Beta Waitlist" segment in MailerLite

### Month 1 (Days 22-30)
11. Engagement CRUD with table view
12. Engagement detail page with tab navigation
13. Basic mobile responsiveness
14. Share 1-minute Loom of dashboard to LinkedIn
15. First waitlist update email

### Month 2
16. Kanban board view
17. MoSCoW scope tracker (interactive)
18. RACI matrix (interactive grid)
19. 4-6 LinkedIn posts throughout the month
20. Waitlist update email #2

### Month 3
21. Go-Live checklist
22. Kickoff checklist
23. Stakeholder matrix + Decision log
24. Invite system (email invites)
25. Beta launch to first 20-30 users
26. LinkedIn beta announcement post

---

*This GTM plan is a living document. Review monthly. Adjust based on what the data tells you, not what feels comfortable.*

*Is the juice worth the squeeze? With $0 infrastructure cost, a validated audience, and 17 templates already proven in market — the squeeze is minimal. The juice is a SaaS business that compounds.*
