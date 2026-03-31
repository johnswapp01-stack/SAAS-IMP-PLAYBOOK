# Implementation Pro

AI-powered professional services platform for SaaS implementation teams.

## Architecture

Three operational layers on top of a core engagement management platform:

1. **Operations Automation** — Resource allocation, time tracking, financial controls, compliance rules
2. **Delivery Governance** — AI risk detection, delivery signals, health scoring, automated client updates
3. **Work Execution** — AI agents that execute repeatable billable tasks (docs, testing, migrations, configs)

Plus **self-learning** (gets smarter with every engagement) and **self-healing** (auto-recovers from failures).

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend/DB:** Supabase (Postgres, Auth, Realtime, Storage, Edge Functions)
- **AI:** Anthropic Claude API (primary), OpenAI (fallback)
- **Deployment:** Vercel
- **Email:** Resend (transactional)

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd implementation-pro
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key from Settings → API

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

```bash
npx vercel
```

Set environment variables in Vercel dashboard.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, signup, OAuth callback
│   ├── (dashboard)/      # Authenticated app routes
│   │   ├── engagements/  # Engagement list + detail + tabs
│   │   ├── governance/   # Risk detection, delivery signals
│   │   ├── agents/       # AI agent console
│   │   └── settings/     # Org + profile settings
│   ├── (marketing)/      # Landing page, pricing
│   ├── layout.tsx        # Root layout
│   └── providers.tsx     # React Query provider
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Sidebar, nav
│   ├── engagements/      # Engagement-specific components
│   ├── templates/        # MoSCoW, RACI, checklists
│   ├── agents/           # Agent console components
│   └── governance/       # Risk, signals components
├── lib/
│   ├── supabase/         # Client + server Supabase clients
│   ├── agents/           # Agent orchestration logic
│   ├── self-healing/     # Health monitoring, circuit breakers
│   └── self-learning/    # Feedback pipeline, prompt refinement
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── styles/               # Global CSS
supabase/
├── migrations/           # SQL migrations
└── seed/                 # Sample data (Acme Corp)
```

## Build Phases

| Phase | Weeks | What Ships |
|-------|-------|-----------|
| 1. Foundation | 1-6 | Auth, orgs, engagement dashboard |
| 2. Templates | 7-12 | MoSCoW, RACI, checklists, reports |
| 3. L1: Operations | 13-18 | Resources, time, finance, compliance |
| 4. L2: Governance | 19-26 | Risk detection, health scores, client updates |
| 5. L3: Agents | 27-34 | AI agents, artifacts, agent console |
| 6. Self-Learning | 27-34 | Feedback pipeline, org context, prompt refinement |
| 7. Self-Healing | 27-34 | Health monitoring, auto-recovery, circuit breakers |

## License

Proprietary. All rights reserved.
