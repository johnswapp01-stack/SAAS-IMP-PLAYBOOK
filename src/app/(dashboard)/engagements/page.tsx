'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import type { Engagement } from '@/types';

const healthColors = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const healthEmoji: Record<string, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
};

const statusLabels: Record<string, string> = {
  kickoff: 'Kickoff',
  in_progress: 'In Progress',
  uat: 'UAT',
  go_live: 'Go-Live',
  complete: 'Complete',
  on_hold: 'On Hold',
};

export default function EngagementsPage() {
  const { org, loading: orgLoading } = useOrg();
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orgLoading || !org) return;

    async function fetchEngagements() {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const { data, error: fetchErr } = await supabase
        .from('engagements')
        .select('*')
        .eq('org_id', org!.id)
        .order('updated_at', { ascending: false });

      if (fetchErr) {
        setError(fetchErr.message);
      } else {
        setEngagements((data as Engagement[]) || []);
      }
      setLoading(false);
    }

    fetchEngagements();
  }, [org, orgLoading]);

  // Loading state
  if (orgLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-7 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
          </div>
          <div className="h-9 w-40 bg-muted animate-pulse rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const plan = org?.plan || 'free';
  const activeCount = engagements.filter((e) => e.status !== 'complete').length;
  const freeLimitReached = plan === 'free' && activeCount >= 2;

  return (
    <div>
      {/* Plan limit banner */}
      {freeLimitReached && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/30 p-3 mb-4 flex items-center justify-between">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            You&apos;ve reached the Free plan limit of 2 active engagements. Upgrade for unlimited.
          </p>
          <Link href="/settings" className="text-xs font-medium text-primary hover:underline whitespace-nowrap ml-4">
            Upgrade Plan
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Engagements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {engagements.length} engagement{engagements.length !== 1 ? 's' : ''}
            {plan === 'free' && <span className="ml-1">({activeCount}/2 active on Free plan)</span>}
          </p>
        </div>
        <Link
          href="/engagements/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + New Engagement
        </Link>
      </div>

      {/* View toggle — placeholder for kanban/timeline */}
      <div className="flex items-center gap-2 mb-4">
        <button className="px-3 py-1.5 text-sm rounded-md bg-primary/10 text-primary font-medium">
          Table
        </button>
        <button className="px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:bg-accent transition-colors">
          Kanban
        </button>
        <button className="px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:bg-accent transition-colors">
          Timeline
        </button>
      </div>

      {/* Content */}
      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load engagements: {error}
        </div>
      ) : engagements.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center max-w-lg mx-auto mt-8">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-lg font-semibold mb-2">No engagements yet</h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            Engagements are your implementation projects. Each one tracks a
            customer from kickoff through go-live — scope, stakeholders,
            decisions, checklists, and status reports all in one place.
          </p>
          <Link
            href="/engagements/new"
            className="inline-flex bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Create Your First Engagement
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            Tip: Start with a real customer project — the best way to learn the
            tool is to use it on a live engagement.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">
                  Health
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">
                  Go-Live
                </th>
              </tr>
            </thead>
            <tbody>
              {engagements.map((eng) => (
                <tr
                  key={eng.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <Link
                      href={`/engagements/${eng.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {eng.name}
                    </Link>
                    {/* Show customer on mobile since column is hidden */}
                    <span className="block text-xs text-muted-foreground sm:hidden mt-0.5">
                      {eng.customer_name || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                    {eng.customer_name || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                      {statusLabels[eng.status] || eng.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        healthColors[eng.health as keyof typeof healthColors] || ''
                      }`}
                    >
                      {healthEmoji[eng.health] || ''}{' '}
                      {eng.health ? eng.health.charAt(0).toUpperCase() + eng.health.slice(1) : '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">
                    {eng.target_go_live
                      ? new Date(eng.target_go_live).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
