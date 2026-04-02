'use client';

import { useState } from 'react';
import { useOrg } from '@/hooks/use-org';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { ComplianceRulesSection } from '@/components/settings/compliance-rules-section';
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
    features: '2 engagements, 1 user, all core templates',
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    price: '$49/mo',
    features: 'Unlimited engagements, 3 users, AI status reports, 50 agent tasks/mo',
  },
  {
    key: 'team' as const,
    name: 'Team',
    price: '$149/mo',
    features: 'Unlimited engagements, 25 users, all AI agents, 500 agent tasks/mo',
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

  const currentPlan = org?.plan || 'free';
  const isOwner = role === 'owner' || role === 'admin';

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
        </div>
      </section>

      {/* Compliance Rules */}
      <ComplianceRulesSection />

      {/* Plan */}
      <section className="rounded-lg border border-border p-6 mt-6">
        <h2 className="font-semibold text-lg mb-4">Plan & Billing</h2>

        <div className="space-y-4">
          {plans.map((plan) => {
            const isCurrent = plan.key === currentPlan;
            const isUpgrade =
              plans.findIndex((p) => p.key === currentPlan) <
              plans.findIndex((p) => p.key === plan.key);

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
                  {isUpgrade && isOwner && plan.key !== 'free' && (
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
