'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useOrg } from '@/hooks/use-org';

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
      className="text-xs px-2 py-1 rounded border border-input hover:bg-accent"
    >
      {done ? 'Copied' : label}
    </button>
  );
}

export default function AdminSetupChecklistPage() {
  const { role, loading } = useOrg();
  const isAdmin = role === 'owner' || role === 'admin';
  const [health, setHealth] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((j) => setHealth(JSON.stringify(j, null, 2)))
      .catch(() => setHealth('Could not reach /api/health'));
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (!isAdmin) {
    return (
      <div className="max-w-lg space-y-2">
        <h1 className="text-2xl font-bold">Setup checklist</h1>
        <p className="text-muted-foreground">Owners and admins only.</p>
        <Link href="/support" className="text-primary text-sm underline">
          Back to Help &amp; Support
        </Link>
      </div>
    );
  }

  const root = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">World-class setup checklist</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          This page replaces ad-hoc “manual” runbooks: verify environment, database extensions, AI keys, billing,
          and health in one place. Complete items in order for production readiness.
        </p>
        <div className="flex flex-wrap gap-3 mt-3 text-sm">
          <Link href="/support" className="text-primary underline">
            Help &amp; Support
          </Link>
          <Link href="/admin/data-studio" className="text-primary underline">
            Admin Data Studio
          </Link>
        </div>
      </div>

      <section className="rounded-lg border border-border p-4 space-y-2">
        <h2 className="font-semibold">1. Environment variables</h2>
        <p className="text-xs text-muted-foreground">
          Copy <code>.env.example</code> to <code>.env.local</code> and fill real values.
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          <CopyButton text="node --env-file=.env.local scripts/verify-env.mjs" label="Copy verify command" />
          <CopyButton text="npm run verify:env" label="Copy npm verify" />
        </div>
        <p className="text-xs text-muted-foreground">
          In PowerShell from the repo root:{' '}
          <code className="text-[11px] bg-muted px-1 rounded">npm run verify:env</code>
        </p>
      </section>

      <section className="rounded-lg border border-border p-4 space-y-2">
        <h2 className="font-semibold">2. Supabase SQL migrations</h2>
        <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-2">
          <li>Open <a className="text-primary underline" href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Supabase Dashboard</a> → your project → SQL → New query.</li>
          <li>Run <code className="text-[11px] bg-muted px-1 rounded">003_pgvector_support_knowledge.sql</code> from the repo (Help &amp; Support RAG).</li>
          <li>Optional: review <code className="text-[11px] bg-muted px-1 rounded">002_backfill_trial_ends_at_optional.sql</code> for trial SQL patterns (prefer Data Studio button).</li>
          <li>Regenerate types: <code className="text-[11px] bg-muted px-1 rounded">npx supabase gen types typescript --project-id &lt;id&gt; &gt; src/types/database.types.ts</code></li>
        </ol>
      </section>

      <section className="rounded-lg border border-border p-4 space-y-2">
        <h2 className="font-semibold">3. Support knowledge ingest (semantic RAG)</h2>
        <p className="text-xs text-muted-foreground">
          After migration 003 and <code>OPENAI_API_KEY</code> + <code>SUPABASE_SERVICE_ROLE_KEY</code> are set:
        </p>
        <div className="flex flex-wrap gap-2">
          <CopyButton text="npm run support:ingest" label="Copy npm run support:ingest" />
        </div>
      </section>

      <section className="rounded-lg border border-border p-4 space-y-2">
        <h2 className="font-semibold">4. Stripe (billing)</h2>
        <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-2">
          <li>
            <a className="text-primary underline" href="https://dashboard.stripe.com/" target="_blank" rel="noreferrer">
              Stripe Dashboard
            </a>{' '}
            → Products / Prices: align Pro and Team price IDs with <code>NEXT_PUBLIC_STRIPE_PRO_PRICE_ID</code> and{' '}
            <code>NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID</code>.
          </li>
          <li>Developers → Webhooks: endpoint <code>{root}/api/stripe/webhook</code> (use your production URL in prod).</li>
          <li>Paste signing secret into <code>STRIPE_WEBHOOK_SECRET</code>.</li>
        </ol>
      </section>

      <section className="rounded-lg border border-border p-4 space-y-2">
        <h2 className="font-semibold">5. Production monitoring</h2>
        <p className="text-xs text-muted-foreground">
          Public status page: <Link className="text-primary underline" href="/status">/status</Link>. API for monitors:{' '}
          <code>{root}/api/health</code> — HTTP 200 when healthy, 503 when degraded.
        </p>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={`${root}/status`} label="Copy /status URL" />
          <CopyButton text={`${root}/api/health`} label="Copy /api/health URL" />
        </div>
        <pre className="text-[11px] bg-muted/50 rounded p-3 overflow-x-auto mt-2 max-h-48 whitespace-pre-wrap">
          {health || 'Loading health…'}
        </pre>
      </section>

      <section className="rounded-lg border border-border p-4 space-y-2">
        <h2 className="font-semibold">6. Exports (Drive / warehouse)</h2>
        <p className="text-xs text-muted-foreground">
          Data Studio exports CSV/XLSX; upload manually to Google Drive or your warehouse ingest. No extra OAuth is
          wired in this repo yet.
        </p>
        <Link href="/admin/data-studio" className="text-sm text-primary underline">
          Open Data Studio
        </Link>
      </section>
    </div>
  );
}
