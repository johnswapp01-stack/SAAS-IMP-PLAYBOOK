/**
 * Embeddings for support RAG (OpenAI text-embedding-3-small, 1536 dimensions).
 * Optional: if OPENAI_API_KEY is unset, vector search is skipped and keyword KB is used alone.
 */

const EMBED_MODEL = 'text-embedding-3-small';

export async function embedQueryText(text: string): Promise<number[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const input = text.trim().slice(0, 8000);
  if (!input) return null;

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBED_MODEL, input }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('OpenAI embeddings error:', res.status, err);
    return null;
  }

  const json = (await res.json()) as {
    data?: { embedding: number[] }[];
  };
  const emb = json.data?.[0]?.embedding;
  return Array.isArray(emb) && emb.length === 1536 ? emb : null;
}
