# Implementation Pro — File Locations & Project Map

## Current file locations on your machine:

### Planning Documents
All in `C:\Users\swapp\life-os\SaaS_IMP-Playbook_Items\`

| File | Version | Status |
|------|---------|--------|
| `Implementation-Pro_PRD.md` | v1 | Saved locally |
| `Implementation-Pro_PRD-v2.md` | v2 (AI layers) | **Download from chat** |
| `Implementation-Pro_GTM-Plan.md` | v1 | Saved locally |
| `Implementation-Pro_GTM-Plan-v2.md` | v2 (AI positioning) | **Download from chat** |

### Codebase
| File | Status |
|------|--------|
| `implementation-pro-scaffold.zip` | **Download from chat**, extract to `implementation-pro\` subfolder |

## What to download from the Claude chat:

Three files are available as download links in the chat:
1. **implementation-pro-scaffold.zip** — Full Next.js codebase (extract here)
2. **Implementation-Pro_PRD-v2.md** — Save to this folder
3. **Implementation-Pro_GTM-Plan-v2.md** — Save to this folder

## After downloading, your folder should look like:

```
C:\Users\swapp\life-os\SaaS_IMP-Playbook_Items\
├── implementation-pro\              ← EXTRACT ZIP HERE
│   ├── src\
│   │   ├── app\                     (Next.js pages)
│   │   ├── components\              (UI components)
│   │   ├── lib\                     (Supabase, agents, self-healing)
│   │   ├── hooks\                   (React hooks)
│   │   ├── types\                   (TypeScript definitions)
│   │   └── styles\                  (CSS)
│   ├── supabase\
│   │   └── migrations\              (SQL schema — run in Supabase)
│   ├── .env.example                 (copy to .env.local)
│   ├── package.json
│   ├── README.md
│   └── ...
├── Implementation-Pro_PRD.md        (v1 — already here)
├── Implementation-Pro_PRD-v2.md     ← SAVE FROM CHAT
├── Implementation-Pro_GTM-Plan.md   (v1 — already here)
├── Implementation-Pro_GTM-Plan-v2.md ← SAVE FROM CHAT
├── CLAUDE.md
├── SaaS-Implementation-Playbook-Kit.zip
└── ... (existing product assets)
```

## Setup steps after download:

1. Extract `implementation-pro-scaffold.zip` into `implementation-pro\` subfolder
2. Save both v2 markdown files to this folder
3. Open terminal: `cd C:\Users\swapp\life-os\SaaS_IMP-Playbook_Items\implementation-pro`
4. Run: `npm install`
5. Copy `.env.example` to `.env.local`
6. Create a NEW Supabase project (separate from life-os)
7. Fill in Supabase URL + anon key in `.env.local`
8. Run the migration: paste `supabase/migrations/001_initial_schema.sql` into Supabase SQL Editor
9. Run: `npm run dev`
10. Open http://localhost:3000
11. Init git: `git init && git add . && git commit -m "Initial scaffold"`
12. Create GitHub repo and push
