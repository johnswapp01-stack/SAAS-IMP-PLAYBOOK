-- Migration: 003
-- Description: Enable pgvector and store support knowledge chunks for semantic RAG in Help & Support chat.
-- Apply in Supabase Dashboard → SQL Editor (or `supabase db push`). Then run `npm run support:ingest` with
-- OPENAI_API_KEY and SUPABASE_SERVICE_ROLE_KEY set to fill embeddings.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.support_knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  source_path text,
  embedding vector(1536),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS support_knowledge_chunks_source_path_key
  ON public.support_knowledge_chunks (source_path);

-- After you have hundreds+ rows with embeddings, add an ANN index in the SQL editor, e.g.:
-- CREATE INDEX ON public.support_knowledge_chunks USING hnsw (embedding vector_cosine_ops);

COMMENT ON TABLE public.support_knowledge_chunks IS
  'Chunked help text for in-app support RAG; embeddings via OpenAI text-embedding-3-small (1536 dims).';

-- Cosine similarity search (higher = closer). Only rows with non-null embedding participate.
CREATE OR REPLACE FUNCTION public.match_support_chunks(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  match_threshold float DEFAULT 0.35
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  source_path text,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.id,
    c.title,
    c.content,
    c.source_path,
    (1 - (c.embedding <=> query_embedding))::float AS similarity
  FROM public.support_knowledge_chunks c
  WHERE c.embedding IS NOT NULL
    AND (1 - (c.embedding <=> query_embedding)) >= match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT LEAST(match_count, 20);
$$;

ALTER TABLE public.support_knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Logged-in app users may read chunks (content only; embeddings are opaque).
DROP POLICY IF EXISTS "support_chunks_select_authenticated" ON public.support_knowledge_chunks;
CREATE POLICY "support_chunks_select_authenticated"
  ON public.support_knowledge_chunks
  FOR SELECT
  TO authenticated
  USING (true);

-- Seed baseline articles (same topics as in-app KB). Embeddings filled by `npm run support:ingest`.
INSERT INTO public.support_knowledge_chunks (title, content, source_path)
SELECT v.title, v.content, v.source_path
FROM (
  VALUES
    (
      'What is an engagement?',
      'An engagement is one customer''s implementation: one place to track scope, people, checklists, go-live, and reports. Open Engagements to see the list, then pick a name to open its tabs (Scope, Stakeholders, Kickoff checklist, and more).',
      'kb:what-is-engagement'
    ),
    (
      'What is Scope / MoSCoW?',
      'MoSCoW sorts requirements into Must have, Should have, Could have, and Won''t (this time). It keeps scope conversations honest: what ships vs what waits. Use the Scope tab inside an engagement.',
      'kb:scope-moscow'
    ),
    (
      'What is RACI?',
      'RACI says who is Responsible (does the work), Accountable (approves), Consulted (gives input), and Informed (kept up to date). It reduces confusion about who owns each deliverable.',
      'kb:raci'
    ),
    (
      'AI agents and limits',
      'AI agents help draft documents, reports, and analysis using your engagement context. Free plan does not run agents. Pro and Team include monthly completed-task limits shown under Settings → Plan & Billing and Workspace usage.',
      'kb:ai-agents'
    ),
    (
      'Billing and trials',
      'Owners and admins can change plans under Settings → Plan & Billing. Upsell uses Stripe Checkout; managing payment methods uses the Stripe portal. A trial end date, when set, appears as a banner on Settings.',
      'kb:billing'
    ),
    (
      'Operations (time, budget, compliance)',
      'Operations groups time entries, budget, resources, and compliance so you can steer delivery beyond the task list. Open Operations in the main menu.',
      'kb:operations'
    ),
    (
      'Data Studio (admins)',
      'Owners and admins can use Admin Data Studio: search tables, read what each stores, preview a subset of rows, and download CSV or Excel. Only data your workspace is allowed to see.',
      'kb:data-studio'
    ),
    (
      'What to avoid pasting in chat',
      'Do not paste passwords, API keys, full customer contracts, or government IDs into the assistant. For account-specific billing problems, contact your administrator or support channel.',
      'kb:privacy'
    )
) AS v(title, content, source_path)
WHERE NOT EXISTS (
  SELECT 1 FROM public.support_knowledge_chunks s WHERE s.source_path = v.source_path
);

-- ROLLBACK (manual):
-- DROP FUNCTION IF EXISTS public.match_support_chunks(vector(1536), int, float);
-- DROP TABLE IF EXISTS public.support_knowledge_chunks;
-- -- Extension: DROP EXTENSION IF EXISTS vector;  -- only if no other tables use vector
