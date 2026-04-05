/**
 * Fill / refresh embeddings for support_knowledge_chunks and optionally ingest docs/support/*.md.
 *
 * Prerequisites:
 * 1. Run supabase/migrations/003_pgvector_support_knowledge.sql in Supabase SQL Editor.
 * 2. Set env: OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Run (PowerShell):
 *   cd project root
 *   $env:OPENAI_API_KEY="sk-..."
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
 *   npm run support:ingest
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const envLocal = path.join(root, '.env.local');
if (fs.existsSync(envLocal)) {
  const raw = fs.readFileSync(envLocal, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

async function embed(text) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is required');
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: String(text).slice(0, 8000),
    }),
  });
  if (!res.ok) throw new Error(`OpenAI: ${await res.text()}`);
  const j = await res.json();
  return j.data[0].embedding;
}

function chunkMarkdown(filePath, baseName, raw) {
  const chunks = [];
  const sections = raw.split(/^## /gm).filter(Boolean);
  if (sections.length <= 1) {
    chunks.push({
      title: baseName.replace(/\.md$/i, '').replace(/-/g, ' '),
      content: raw.trim(),
      source_path: `file:${baseName}`,
    });
    return chunks;
  }
  for (const block of sections) {
    const lines = block.trim().split('\n');
    const heading = lines[0]?.trim() || 'Section';
    const body = lines.slice(1).join('\n').trim();
    if (!body) continue;
    chunks.push({
      title: `${baseName.replace(/\.md$/i, '')}: ${heading}`,
      content: body,
      source_path: `file:${baseName}#${heading.slice(0, 80).replace(/\s+/g, '-').toLowerCase()}`,
    });
  }
  return chunks;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sr = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !sr) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }
  const supabase = createClient(url, sr);

  // Markdown from docs/support/
  const docsDir = path.join(root, 'docs', 'support');
  if (fs.existsSync(docsDir)) {
    const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      const raw = fs.readFileSync(path.join(docsDir, f), 'utf8');
      const pieces = chunkMarkdown(path.join(docsDir, f), f, raw);
      for (const p of pieces) {
        const vec = await embed(`${p.title}\n\n${p.content}`);
        const { error } = await supabase.from('support_knowledge_chunks').upsert(
          {
            title: p.title,
            content: p.content,
            source_path: p.source_path,
            embedding: vec,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'source_path' }
        );
        if (error) console.error('upsert', p.source_path, error.message);
        else console.log('upserted', p.source_path);
      }
    }
  }

  // Rows missing embeddings (including seeded kb:* rows)
  const { data: missing, error: selErr } = await supabase
    .from('support_knowledge_chunks')
    .select('id,title,content')
    .is('embedding', null);

  if (selErr) {
    console.error('select null embedding:', selErr.message);
    console.error('Did you run migration 003_pgvector_support_knowledge.sql?');
    process.exit(1);
  }

  for (const r of missing || []) {
    const vec = await embed(`${r.title}\n\n${r.content}`);
    const { error } = await supabase.from('support_knowledge_chunks').update({ embedding: vec }).eq('id', r.id);
    if (error) console.error('update', r.id, error.message);
    else console.log('embedded row', r.id, r.title?.slice(0, 40));
  }

  console.log('Done. Ask a question in Help & Support to verify semantic retrieval.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
