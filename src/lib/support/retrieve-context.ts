import { createClient } from '@/lib/supabase/server';
import { retrieveSupportContext } from '@/lib/support/knowledge-base';
import { embedQueryText } from '@/lib/support/openai-embeddings';

type MatchRow = {
  id: string;
  title: string;
  content: string;
  source_path: string | null;
  similarity: number;
};

/**
 * Help text for the support chat system prompt: keyword KB always;
 * if OPENAI_API_KEY + migration 003 are active, prepend semantic chunks from pgvector.
 */
export async function buildHelpLibraryContext(userMessage: string): Promise<string> {
  const keywordLibrary = retrieveSupportContext(userMessage);

  const embedding = await embedQueryText(userMessage);
  if (!embedding) {
    return keywordLibrary;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await (
      supabase as unknown as {
        rpc: (
          fn: string,
          args: Record<string, unknown>
        ) => Promise<{ data: unknown; error: { message: string } | null }>;
      }
    ).rpc('match_support_chunks', {
      query_embedding: embedding,
      match_count: 5,
      match_threshold: 0.32,
    });

    if (error) {
      console.warn('match_support_chunks skipped:', error.message);
      return keywordLibrary;
    }

    const rows = (data || []) as MatchRow[];
    if (rows.length === 0) {
      return keywordLibrary;
    }

    const semantic = rows
      .map((r) => `### ${r.title}\n${r.content}`)
      .join('\n\n');

    return `${keywordLibrary}\n\n---\nSEMANTIC MATCHES (from your knowledge base in the database):\n${semantic}`;
  } catch (e) {
    console.warn('Vector retrieval failed:', e);
    return keywordLibrary;
  }
}
