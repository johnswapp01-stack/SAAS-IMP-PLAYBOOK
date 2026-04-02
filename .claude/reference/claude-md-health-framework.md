# CLAUDE.md Health Framework

Execute all three phases in order any time you touch a repo's CLAUDE.md — new build or existing update. Do this BEFORE any other work.

## Phase 1 — Audit the rules folder

List everything in `.claude/rules/`. Check which of the 9 standard files are present and which are missing.

**The 9 standard rules files:**

| File | Owns |
|---|---|
| `coding-patterns.md` | Language-specific standards, exception handling, naming, import order |
| `dependency-management.md` | Venv path, package manager, version pins, install/upgrade/remove procedure |
| `git-workflow.md` | Conventional commits, branch naming, commit discipline |
| `migrations.md` | DB schema change rules, migration authoring template |
| `pre-task-checklist.md` | Pre-task ritual, scope definition, anti-pattern scan, post-change steps |
| `Self-Healing.md` | Mandatory loop for any test/build failure |
| `Self-Learning.md` | Running incident log — append after every self-healing loop |
| `structure.md` | Package layout, import conventions, architectural rules |
| `testing.md` | Test commands, coverage areas, full mandatory testing protocol |

## Phase 2 — Create any missing rules files

For each file not present, create it — tailored to the repo's actual stack. Do not use a generic template. Read the repo first: inspect the language, frameworks, database, package manager, test runner, and deployment target, then write rules that reflect what is actually there.

- A Python/Flask/SQLite repo gets different `coding-patterns.md` content than a Next.js/Supabase repo.
- A repo with no DB gets a `migrations.md` that says so and explains why.
- Every repo still gets all 9 files — content scales to what the repo needs.

After creating any missing files, report back: list what was created and a one-line summary of the key decisions baked into each one.

## Phase 2b — Create .claude/reference/ if missing

After the 9 rules files, verify `.claude/reference/` exists and contains at minimum:

1. **`stack-and-architecture.md`** — Stack decisions and architecture rules tailored to THIS repo's actual stack. Not a copy of the Master-CLAUDE-Setup version. Write it from scratch based on what's actually in the repo.
2. **`claude-md-health-framework.md`** — A copy of this file, so the Health Framework is available in the repo even without access to Master-CLAUDE-Setup.

If either file is missing, create it before moving to Phase 3. The `.claude/reference/` folder is part of the scaffold standard — not optional.

> **Lesson (2026-04-02):** This step was missing from the original spec. The reference/ folder was caught empty only during post-execution verification on SaaS_IMP-Playbook_Items. Phase 2b closes that gap.

## Phase 3 — Cross-reference and clean CLAUDE.md

Scan the repo's CLAUDE.md against every rules file. Apply this boundary strictly:

- **CLAUDE.md** = architecture, project context, folder protocol, naming conventions, and pointers to rules files. It answers "what is this repo and how is it structured."
- **`.claude/rules/` files** = operational detail. Each topic is owned by exactly one rules file.

For every block of content in CLAUDE.md that duplicates or overlaps a rules file: remove it from CLAUDE.md and replace it with a one-line pointer (`See coding-patterns.md`). Never leave the same rule in both places — that's how drift and hallucination happen.

**Also watch for: generic/universal prompt content.** If CLAUDE.md opens with a "primary framework" or "elite engineer" prompt that applies to ANY repo — not this one — remove it entirely. It is not architecture, not context, and not a pointer. It inflates token budget and can override project-specific rules.

After cleanup, report: what was removed from CLAUDE.md, what it was replaced with, and which rules file now owns it.
