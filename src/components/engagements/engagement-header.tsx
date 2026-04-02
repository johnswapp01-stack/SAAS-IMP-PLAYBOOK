'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Engagement, EngagementStatus, HealthStatus } from '@/types';

const statusOptions: { value: EngagementStatus; label: string }[] = [
  { value: 'kickoff', label: 'Kickoff' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'uat', label: 'UAT' },
  { value: 'go_live', label: 'Go-Live' },
  { value: 'complete', label: 'Complete' },
  { value: 'on_hold', label: 'On Hold' },
];

const healthEmoji: Record<HealthStatus, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
};

interface EngagementHeaderProps {
  engagement: Engagement;
}

export function EngagementHeader({ engagement: initial }: EngagementHeaderProps) {
  const router = useRouter();
  const [engagement, setEngagement] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit form state
  const [name, setName] = useState(engagement.name);
  const [customerName, setCustomerName] = useState(engagement.customer_name);
  const [description, setDescription] = useState(engagement.description || '');
  const [status, setStatus] = useState<EngagementStatus>(engagement.status);
  const [health, setHealth] = useState<HealthStatus>(engagement.health);
  const [targetGoLive, setTargetGoLive] = useState(engagement.target_go_live || '');

  function openEdit() {
    setName(engagement.name);
    setCustomerName(engagement.customer_name);
    setDescription(engagement.description || '');
    setStatus(engagement.status);
    setHealth(engagement.health);
    setTargetGoLive(engagement.target_go_live || '');
    setEditing(true);
  }

  async function handleSave() {
    if (!name.trim() || !customerName.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('engagements')
      .update({
        name: name.trim(),
        customer_name: customerName.trim(),
        description: description.trim() || null,
        status,
        health,
        target_go_live: targetGoLive || null,
      })
      .eq('id', engagement.id)
      .select()
      .single();

    if (!error && data) {
      setEngagement(data as Engagement);
    }
    setSaving(false);
    setEditing(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from('engagements').delete().eq('id', engagement.id);
    router.push('/engagements');
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/engagements" className="hover:text-foreground transition-colors">
          Engagements
        </Link>
        <span>/</span>
        <span className="text-foreground">{engagement.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {engagement.name}
            <span className="text-lg" title={`Health: ${engagement.health}`}>
              {healthEmoji[engagement.health]}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {engagement.customer_name || 'No customer specified'}
            {engagement.status && (
              <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-muted">
                {statusOptions.find((s) => s.value === engagement.status)?.label || engagement.status}
              </span>
            )}
            {engagement.target_go_live && (
              <span>
                {' '}· Go-live:{' '}
                {new Date(engagement.target_go_live).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </span>
            )}
          </p>
          {engagement.description && (
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{engagement.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={openEdit} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent transition-colors">
            Edit
          </button>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(false)}>
          <div className="bg-background rounded-lg border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Edit Engagement</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Engagement Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name *</label>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as EngagementStatus)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Health</label>
                  <select value={health} onChange={(e) => setHealth(e.target.value as HealthStatus)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="green">🟢 Green</option>
                    <option value="yellow">🟡 Yellow</option>
                    <option value="red">🔴 Red</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Go-Live</label>
                  <input type="date" value={targetGoLive} onChange={(e) => setTargetGoLive(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
              </div>

              {/* Delete section */}
              <div className="border-t border-border pt-4 mt-4">
                {confirmDelete ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-destructive">This will permanently delete the engagement and all its data.</p>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">
                        Cancel
                      </button>
                      <button onClick={handleDelete} disabled={deleting} className="px-3 py-1.5 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">
                        {deleting ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(true)} className="text-sm text-destructive hover:underline">
                    Delete this engagement
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm rounded-md border border-input hover:bg-accent">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !name.trim() || !customerName.trim()} className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
