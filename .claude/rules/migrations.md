# migrations.md

## Database: Supabase (PostgreSQL)

This repo uses Supabase for its database. Schema changes are managed through SQL migration files in `supabase/migrations/`.

## Migration File Naming
```
NNN_descriptive_name.sql
```
- `NNN` = zero-padded sequential number (e.g., `002`, `003`)
- Description uses `snake_case`
- Examples: `002_add_engagement_tags.sql`, `003_lessons_learned_categories.sql`

Current baseline: `001_initial_schema.sql` (846 lines — Foundation + Layer 1–3 + Self-Learning + Self-Healing tables)

## Writing Migrations
- **Never modify `001_initial_schema.sql`** — it is the deployed baseline. All changes go in new numbered files.
- Every migration file must be idempotent where possible. Use `IF NOT EXISTS`, `IF EXISTS`, and `OR REPLACE`.
- Always include a rollback comment block at the bottom of the file, even if it's manual:
  ```sql
  -- ROLLBACK (manual):
  -- DROP TABLE IF EXISTS <new_table>;
  -- ALTER TABLE <existing_table> DROP COLUMN IF EXISTS <col>;
  ```
- Add `-- Migration: NNN` and `-- Description: <what and why>` as header comments.
- Custom types (`CREATE TYPE ... AS ENUM`) are already defined in `001`. Add new enum values with `ALTER TYPE ... ADD VALUE`.

## Applying Migrations
There is no automated migration runner configured. Apply via the Supabase dashboard SQL editor or Supabase CLI:
```powershell
# If Supabase CLI is installed:
supabase db push

# Manual: paste the SQL into Supabase Dashboard > SQL Editor
```
The `db:migrate` npm script currently just echoes a reminder — it does not execute anything.

## Type Sync
After any schema change, regenerate TypeScript types:
```powershell
npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
```
Commit the updated `src/types/supabase.ts` in the same PR as the migration file.

## pgvector
Extension `vector` is commented out in `001_initial_schema.sql`. Enable it only when semantic search features are actively being built. Document the activation in the migration file that first uses it.

## Seed Data
Seed files live in `supabase/seed/`. The Acme Corp scenario (`acme_corp.sql`) is the standard seed for local dev and testing. Do not use real customer data in seed files.
