'use client';

import { useState, useEffect } from 'react';
import { useOrg } from '@/hooks/use-org';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { ComplianceRulesSection } from '@/components/settings/compliance-rules-section';
import { getMonthlyAgentTaskLimit } from '@/lib/billing/plan-limits';
import type { User } from '@supabase/supabase-js';

function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const supabase = createClient();

  if (!loaded) {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoaded(true);
    });
  }
  return user;
}

const plans = [
  {
    key: 'free' as const,
    name: 'Free',
    price: '$0',
    features:
      'Explore the workspace; no AI agent runs. Core templates and engagement structure included.',
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    price: '$49/mo',
    features:
      'Paid tier with trial: 50 AI agent tasks per month, ideal for solo consultants and very small teams.',
  },
  {
    key: 'team' as const,
    name: 'Team',
    price: '$149/mo',
    features:
      '500 AI agent tasks per month for implementation teams that run multiple engagements in parallel.',
  },
];

export default function SettingsPage() {
  const user = useUser();
  const { org, role, refresh } = useOrg();
  const searchParams = useSearchParams();
  const billingStatus = searchParams.get('billing');
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [agentTasksCompletedMonth, setAgentTasksCompletedMonth] = useState<number | null>(null);

  const currentPlan = org?.plan || 'free';
  const isOwner = role === 'owner' || role === 'admin';

  useEffect(() => {
    if (!org?.id) {
      setMemberCount(null);
      setAgentTasksCompletedMonth(null);
      return;
    }

    const supabase = createClient();
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    void (async () => {
      const { count: members } = await supabase
        .from('org_members')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', org.id)
        .not('accepted_at', 'is', null);

      const { count: tasksDone } = await supabase
        .from('agent_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', org.id)
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
        .gte('completed_at', monthStart.toISOString());

      setMemberCount(members ?? 0);
      setAgentTasksCompletedMonth(tasksDone ?? 0);
    })();
  }, [org?.id]);

  const trialEnd =
    org?.trial_ends_at && new Date(org.trial_ends_at).getTime() > Date.now()
      ? new Date(org.trial_ends_at)
      : null;

  const taskLimit = getMonthlyAgentTaskLimit(currentPlan);
  const usageUnlimited = !Number.isFinite(taskLimit);

  const currentPlanIdx = plans.findIndex((p) => p.key === currentPlan);
  const isEnterprisePlan = currentPlan === 'enterprise';

  async function handleUpgrade(planKey: string) {
    if (!org) return;
    setUpgradeLoading(planKey);
    setError(null);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey, orgId: org.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to start checkout');
        setUpgradeLoading(null);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError('Something went wrong. Please try again.');
      setUpgradeLoading(null);
    }
  }

  async function handleManageBilling() {
    if (!org) return;
    setPortalLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: org.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to open billing portal');
        setPortalLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Something went wrong. Please try again.');
      setPortalLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Billing status banner */}
      {billingStatus === 'success' && (
        <div className="mb-6 p-3 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
          Plan upgraded successfully. It may take a moment to reflect.
        </div>
      )}
      {billingStatus === 'cancelled' && (
        <div className="mb-6 p-3 rounded-md bg-muted text-muted-foreground text-sm">
          Checkout was cancelled. Your plan has not changed.
        </div>
      )}

      {trialEnd && (
        <div className="mb-6 p-3 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 text-amber-900 dark:text-amber-100 text-sm">
          Trial active until{' '}
          <strong>{trialEnd.toLocaleDateString(undefined, { dateStyle: 'medium' })}</strong>. After
          that, your workspace follows the limits of your selected plan unless billing is updated in
          Stripe.
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Profile */}
      <section className="rounded-lg border border-border p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Profile</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user?.email || '...'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Name</span>
            <span>{user?.user_metadata?.full_name || '...'}</span>
          </div>
        </div>
      </section>

      {/* Organization */}
      <section className="rounded-lg border border-border p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Organization</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Name</span>
            <span>{org?.name || '...'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Your role</span>
            <span className="capitalize">{role || '...'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Slug</span>
            <span className="text-muted-foreground font-mono text-xs">{org?.slug || '...'}</span>
          </div>
          {memberCount !== null && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Accepted members</span>
              <span>{memberCount}</span>
            </div>
          )}
        </div>
      </section>

      {isOwner && (
        <section className="rounded-lg border border-border p-6 mb-6">
          <h2 className="font-semibold text-lg mb-2">Admin & roles</h2>
          <p className="text-sm text-muted-foreground mb-3">
            <strong>Owner / Admin:</strong> billing, plan changes, compliance rules, and demo data
            seeding. <strong>Member:</strong> day-to-day delivery on engagements.{' '}
            <strong>Viewer:</strong> read-only visibility for stakeholders who should not edit records.
          </p>
          <p className="text-xs text-muted-foreground">
            Member invitations and role edits will live here as membership management ships; for now,
            usage and billing are the main admin controls.
          </p>
        </section>
      )}

      {/* Workspace usage (admin-facing) */}
      {isOwner && (
        <section className="rounded-lg border border-border p-6 mb-6">
          <h2 className="font-semibold text-lg mb-2">Workspace usage</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Agent tasks completed this calendar month versus your plan quota (UTC month boundary).
          </p>
          {currentPlan === 'free' ? (
            <p className="text-sm text-muted-foreground">
              AI agent runs are not included on Free. Upgrade to Pro or Team to execute agents and see
              usage here.
            </p>
          ) : agentTasksCompletedMonth !== null ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completed agent tasks (this month)</span>
                <span className="font-medium tabular-nums">
                  {agentTasksCompletedMonth}
                  {usageUnlimited ? '' : ` / ${taskLimit}`}
                  {usageUnlimited ? ' (unlimited)' : ''}
                </span>
              </div>
              {!usageUnlimited && taskLimit > 0 && (
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(100, (agentTasksCompletedMonth / taskLimit) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading usage…</p>
          )}
        </section>
      )}

      {/* Compliance Rules */}
      <ComplianceRulesSection />

      {/* Plan */}
      <section className="rounded-lg border border-border p-6 mt-6">
        <h2 className="font-semibold text-lg mb-4">Plan & Billing</h2>

        <div className="space-y-4">
          {plans.map((plan) => {
            const isCurrent = plan.key === currentPlan;
            const planIdx = plans.findIndex((p) => p.key === plan.key);
            const isUpgrade =
              !isEnterprisePlan &&
              currentPlanIdx >= 0 &&
              currentPlanIdx < planIdx;

            return (
              <div
                key={plan.key}
                className={`rounded-lg border p-4 ${
                  isCurrent
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{plan.name}</span>
                      <span className="text-sm text-muted-foreground">{plan.price}</span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{plan.features}</p>
                  </div>
                  {isUpgrade && isOwner && plan.key !== 'free' && !isEnterprisePlan && (
                    <button
                      onClick={() => handleUpgrade(plan.key)}
                      disabled={!!upgradeLoading}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {upgradeLoading === plan.key ? 'Redirecting...' : 'Upgrade'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Enterprise — not sold via self-serve checkout in-app */}
          <div
            className={`rounded-lg border p-4 ${
              currentPlan === 'enterprise' ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">Enterprise</span>
                  <span className="text-sm text-muted-foreground">Custom pricing</span>
                  {currentPlan === 'enterprise' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Unlimited AI agent tasks, security reviews, and annual agreements. Enabled by sales
                  or support on your account—not via the self-serve checkout above.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Manage billing */}
        {currentPlan !== 'free' && isOwner && (
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="mt-4 px-4 py-2 rounded-md text-sm font-medium border border-input hover:bg-accent transition-colors disabled:opacity-50"
          >
            {portalLoading ? 'Opening...' : 'Manage billing'}
          </button>
        )}
      </section>
      {/* Demo Data */}
      {isOwner && (
        <section className="rounded-lg border border-border p-6 mt-6">
          <h2 className="font-semibold text-lg mb-2">Demo Data</h2>
          <p className="text-sm text-muted-foreground mb-4">Seed your workspace with realistic Acme Corp demo data across all features — engagements, scope, stakeholders, decisions, risk signals, agent tasks, and more.</p>
          <SeedButton />
        </section>
      )}
    </div>
  );
}

function SeedButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'exists' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSeed() {
    setStatus('loading');
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.seeded) {
        setStatus('done');
        setMessage(`Seeded: ${data.engagements?.join(', ')}`);
      } else if (data.seeded === false) {
        setStatus('exists');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error || 'Unknown error');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to seed data');
    }
  }

  return (
    <div>
      <button
        onClick={handleSeed}
        disabled={status === 'loading' || status === 'done'}
        className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {status === 'loading' ? 'Seeding...' : status === 'done' ? 'Seeded!' : status === 'exists' ? 'Already Seeded' : 'Seed Demo Data'}
      </button>
      {message && <p className="text-xs text-muted-foreground mt-2">{message}</p>}
    </div>
  );
}
