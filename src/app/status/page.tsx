import type { Metadata } from 'next';
import Link from 'next/link';
import { getHealthSnapshot } from '@/lib/health/snapshot';
import { IncidentTemplateBlock } from '@/components/status/incident-template-block';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'System status — Implementation Pro',
  description:
    'Live operational status for Implementation Pro: database connectivity and core service configuration checks.',
};

const ROWS: { key: string; label: string; hint: string; optional?: boolean }[] = [
  { key: 'database', label: 'Database & API', hint: 'Can we reach Supabase and read core catalog data?' },
  { key: 'env_supabase_url', label: 'Supabase URL', hint: 'Public project URL is configured.' },
  { key: 'env_supabase_anon', label: 'Supabase anon key', hint: 'Browser-safe key is configured.' },
  { key: 'env_anthropic', label: 'AI agents (Anthropic)', hint: 'Required to run in-app AI agent tasks.' },
  { key: 'env_stripe', label: 'Billing (Stripe)', hint: 'Required for paid plans and checkout.' },
  {
    key: 'env_openai',
    label: 'Support embeddings (OpenAI)',
    hint: 'Optional; improves Help assistant semantic search.',
    optional: true,
  },
];

function StatusDot({ ok, muted }: { ok: boolean; muted?: boolean }) {
  const cls = ok ? 'bg-green-500' : muted ? 'bg-muted-foreground/45' : 'bg-amber-500';
  return <span className={`inline-flex h-2.5 w-2.5 rounded-full shrink-0 ${cls}`} aria-hidden />;
}

export default async function StatusPage() {
  const snap = await getHealthSnapshot();
  const operational = snap.status === 'ok';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">IP</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">System status</h1>
              <p className="text-xs text-muted-foreground">Implementation Pro</p>
            </div>
          </div>
          <Link href="/" className="text-sm text-primary hover:underline self-start sm:self-auto">
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-10">
        <section
          className={`rounded-xl border p-6 ${operational ? 'border-green-200 bg-green-50/80 dark:bg-green-950/20 dark:border-green-900' : 'border-amber-200 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-900'}`}
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <StatusDot ok={operational} />
            <div>
              <p className="font-semibold text-lg">
                {operational ? 'All critical checks passing' : 'Degraded — some checks failed'}
              </p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                This page reflects <strong>automated probes</strong> only (configuration + a live database read). It
                is not a legal SLA or uptime guarantee unless your contract says otherwise. For enterprise
                agreements, refer to your order form or MSA.
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Last checked:{' '}
                <time dateTime={snap.time}>{new Date(snap.time).toLocaleString()}</time>
                {' · '}
                Page generated in {snap.latencyMs} ms
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Components</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="p-3 font-medium">Component</th>
                  <th className="p-3 font-medium w-28">Status</th>
                  <th className="p-3 font-medium hidden sm:table-cell">Note</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => {
                  const c = snap.checks[row.key];
                  const ok = c?.ok ?? false;
                  return (
                    <tr key={row.key} className="border-b border-border last:border-0">
                      <td className="p-3 align-top">
                        <div className="font-medium">{row.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 sm:hidden">{row.hint}</div>
                      </td>
                      <td className="p-3 align-top">
                        <span className="inline-flex items-center gap-2">
                          <StatusDot ok={ok} muted={!ok && !!row.optional} />
                          <span
                            className={
                              ok
                                ? 'text-green-700 dark:text-green-400'
                                : row.optional
                                  ? 'text-muted-foreground'
                                  : 'text-amber-800 dark:text-amber-300'
                            }
                          >
                            {ok ? 'Operational' : row.optional ? 'Not configured' : 'Issue'}
                          </span>
                        </span>
                        {typeof c?.ms === 'number' && row.key === 'database' && (
                          <div className="text-[11px] text-muted-foreground mt-1">{c.ms} ms</div>
                        )}
                      </td>
                      <td className="p-3 align-top text-xs text-muted-foreground hidden sm:table-cell max-w-md">
                        {c?.detail ? (
                          <span className="text-destructive">{c.detail}</span>
                        ) : (
                          row.hint
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-muted/20 p-6 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">What we target (informational)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Availability mindset:</strong> we design for the app to be usable during your business hours;
              maintenance may happen off-peak with notice when practical.
            </li>
            <li>
              <strong>Transparency:</strong> this page and <code className="text-xs bg-muted px-1 rounded">/api/health</code>{' '}
              exist so you can verify the same signal your monitors see.
            </li>
            <li>
              <strong>Not covered here:</strong> third parties (Stripe, Supabase, your network) have their own status
              pages; a green check here does not imply all of those are green.
            </li>
          </ul>
        </section>

        <IncidentTemplateBlock />

        <p className="text-center text-xs text-muted-foreground pb-8">
          JSON for machines:{' '}
          <Link href="/api/health" className="text-primary underline">
            /api/health
          </Link>
        </p>
      </main>
    </div>
  );
}
