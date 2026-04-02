'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrg } from '@/hooks/use-org';

export default function NewEngagementPage() {
  const router = useRouter();
  const { org, loading: orgLoading } = useOrg();

  const [name, setName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [description, setDescription] = useState('');
  const [targetGoLive, setTargetGoLive] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planLimitHit, setPlanLimitHit] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !customerName.trim()) return;

    setSubmitting(true);
    setError(null);
    setPlanLimitHit(false);

    try {
      const res = await fetch('/api/engagements/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          customer_name: customerName.trim(),
          description: description.trim() || undefined,
          target_go_live: targetGoLive || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'PLAN_LIMIT_REACHED') {
          setPlanLimitHit(true);
        }
        setError(data.error || 'Something went wrong.');
        setSubmitting(false);
        return;
      }

      // Navigate to the new engagement
      router.push(`/engagements/${data.engagement.id}`);
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  if (orgLoading) {
    return (
      <div className="max-w-xl mx-auto mt-8 space-y-4">
        <div className="h-7 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted/50 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-xl mx-auto mt-8 text-center">
        <p className="text-muted-foreground">
          You need to create an organization before adding engagements.
        </p>
        <Link
          href="/onboarding"
          className="mt-4 inline-flex bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Create Organization
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link
          href="/engagements"
          className="hover:text-foreground transition-colors"
        >
          Engagements
        </Link>
        <span>/</span>
        <span className="text-foreground">New</span>
      </div>

      <h1 className="text-2xl font-bold mb-1">New Engagement</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Set up a new implementation project. You can add scope, stakeholders,
        and checklists after creation.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Engagement name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-1.5"
          >
            Engagement Name <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Acme Corp ERP Migration"
            required
            minLength={2}
            maxLength={200}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use a descriptive name — include the customer and project type.
          </p>
        </div>

        {/* Customer name */}
        <div>
          <label
            htmlFor="customer"
            className="block text-sm font-medium mb-1.5"
          >
            Customer Name <span className="text-destructive">*</span>
          </label>
          <input
            id="customer"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g., Acme Corp"
            required
            minLength={2}
            maxLength={200}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1.5"
          >
            Description{' '}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary — what's being implemented, key goals, any context for the team."
            rows={3}
            maxLength={2000}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </div>

        {/* Target go-live */}
        <div>
          <label
            htmlFor="go-live"
            className="block text-sm font-medium mb-1.5"
          >
            Target Go-Live Date{' '}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </label>
          <input
            id="go-live"
            type="date"
            value={targetGoLive}
            onChange={(e) => setTargetGoLive(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-xs text-muted-foreground mt-1">
            You can change this anytime. It shows on the engagement card and
            timeline view.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <p>{error}</p>
            {planLimitHit && (
              <Link href="/settings" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                Upgrade your plan {String.fromCodePoint(0x2192)}
              </Link>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/engagements"
            className="px-4 py-2 text-sm rounded-md border border-input hover:bg-accent transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !name.trim() || !customerName.trim()}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create Engagement'}
          </button>
        </div>
      </form>

      {/* What's next callout */}
      <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="text-sm font-medium mb-2">What happens next?</h3>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>
            <span className="font-medium text-foreground">Scope</span> — Define
            requirements with MoSCoW priorities
          </li>
          <li>
            <span className="font-medium text-foreground">Stakeholders</span> —
            Map key contacts, roles, and communication preferences
          </li>
          <li>
            <span className="font-medium text-foreground">Checklists</span> —
            Kickoff and go-live checklists with owner assignments
          </li>
          <li>
            <span className="font-medium text-foreground">
              Status Reports
            </span>{' '}
            — Weekly updates generated from real project data
          </li>
        </ul>
      </div>
    </div>
  );
}
