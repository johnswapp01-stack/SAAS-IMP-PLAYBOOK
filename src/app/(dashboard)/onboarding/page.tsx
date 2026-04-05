'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrg } from '@/hooks/use-org';
import { createClient } from '@/lib/supabase/client';

const STEPS = ['Welcome', 'Organization', 'First Engagement', 'Ready'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState('');
  const [engagementName, setEngagementName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { refresh } = useOrg();

  async function handleCreateOrg() {
    if (!orgName.trim()) return;
    setSaving(true);
    setError('');
    try {
      const slug = orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const res = await fetch('/api/org/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName.trim(), slug }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create organization');
        setSaving(false);
        return;
      }
      await refresh();
      setStep(2);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setSaving(false);
  }

  async function handleCreateEngagement() {
    if (!engagementName.trim() || !customerName.trim()) return;
    setSaving(true);
    setError('');
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: membership } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!membership) {
        setError('No organization found. Please go back and create one.');
        setSaving(false);
        return;
      }

      const { error: engErr } = await supabase.from('engagements').insert({
        org_id: membership.org_id,
        name: engagementName.trim(),
        customer_name: customerName.trim(),
        status: 'kickoff',
        health: 'green',
        owner_id: user.id,
        start_date: new Date().toISOString().slice(0, 10),
      } as any);

      if (engErr) {
        setError(engErr.message);
        setSaving(false);
        return;
      }
      setStep(3);
    } catch {
      setError('Something went wrong.');
    }
    setSaving(false);
  }

  function goToDashboard() {
    router.push('/engagements');
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-8">
          {step === 0 && (
            <div className="text-center space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-2">
                <span className="text-primary-foreground font-bold text-xl">IP</span>
              </div>
              <h1 className="text-2xl font-bold">Welcome to Implementation Pro</h1>
              <p className="text-muted-foreground">
                Let&apos;s get you set up in under 2 minutes. You&apos;ll create your organization,
                then optionally add your first engagement.
              </p>
              <p className="text-xs text-muted-foreground text-left bg-muted/40 rounded-lg px-3 py-2 leading-relaxed">
                Implementation Pro is built for SaaS implementation delivery—scope, stakeholders,
                go-live, and governance—not generic project task lists.
              </p>
              <button onClick={() => setStep(1)} className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Let&apos;s go
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Create your organization</h2>
              <p className="text-sm text-muted-foreground">
                This is your team&apos;s workspace. You can invite team members later.
              </p>
              <div>
                <label className="block text-sm font-medium mb-1">Organization name *</label>
                <input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g., Acme Consulting, Your Company Name"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can change this later in settings.
                </p>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={handleCreateOrg}
                disabled={!orgName.trim() || saving}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Creating...' : 'Create organization'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Add your first engagement</h2>
              <p className="text-sm text-muted-foreground">
                An engagement is a customer implementation project. You can skip this and add one later.
              </p>
              <div>
                <label className="block text-sm font-medium mb-1">Engagement name *</label>
                <input
                  value={engagementName}
                  onChange={(e) => setEngagementName(e.target.value)}
                  placeholder="e.g., Acme Corp — Platform Migration"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer name *</label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., Acme Corp"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 border border-input py-3 rounded-lg font-medium hover:bg-accent transition-colors text-sm"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleCreateEngagement}
                  disabled={!engagementName.trim() || !customerName.trim() || saving}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
                >
                  {saving ? 'Creating...' : 'Create engagement'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="text-4xl mb-2">{String.fromCodePoint(0x2705)}</div>
              <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
              <p className="text-muted-foreground">
                Your workspace is ready. Head to the dashboard to start managing your implementations.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-left text-sm space-y-2">
                <p className="font-medium">Quick tips:</p>
                <p className="text-muted-foreground">{String.fromCodePoint(0x2022)} Use the <strong>Engagements</strong> page to add scope, stakeholders, and decisions</p>
                <p className="text-muted-foreground">{String.fromCodePoint(0x2022)} <strong>AI Agents</strong> can generate documents and detect risks for you</p>
                <p className="text-muted-foreground">{String.fromCodePoint(0x2022)} Invite your team from <strong>Settings</strong></p>
              </div>
              <button
                onClick={goToDashboard}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}
