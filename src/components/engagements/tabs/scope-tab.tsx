'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils';
import type { ScopeItem, MoscowPriority, ScopeStatus } from '@/types';

const priorityConfig: Record<MoscowPriority, { label: string; color: string }> = {
  must: { label: 'Must', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  should: { label: 'Should', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  could: { label: 'Could', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  wont: { label: "Won't", color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const statusConfig: Record<ScopeStatus, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  deferred: 'bg-gray-100 text-gray-600',
};

interface ScopeTabProps {
  engagementId: string;
}

export function ScopeTab({ engagementId }: ScopeTabProps) {
  const { org } = useOrg();
  const [items, setItems] = useState<ScopeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<MoscowPriority | 'all'>('all');

  // Form state
  const [requirement, setRequirement] = useState('');
  const [priority, setPriority] = useState<MoscowPriority>('must');
  const [status, setStatus] = useState<ScopeStatus>('pending');
  const [requestedBy, setRequestedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!org) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('scope_items')
      .select('*')
      .eq('engagement_id', engagementId)
      .eq('org_id', org.id)
      .order('sort_order', { ascending: true });
    setItems((data as ScopeItem[]) || []);
    setLoading(false);
  }, [engagementId, org]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function resetForm() {
    setRequirement('');
    setPriority('must');
    setStatus('pending');
    setRequestedBy('');
    setNotes('');
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(item: ScopeItem) {
    setRequirement(item.requirement);
    setPriority(item.priority);
    setStatus(item.status);
    setRequestedBy(item.requested_by || '');
    setNotes(item.notes || '');
    setEditingId(item.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!org || !requirement.trim()) return;
    setSaving(true);
    const supabase = createClient();

    const payload = {
      engagement_id: engagementId,
      org_id: org.id,
      requirement: requirement.trim(),
      priority,
      status,
      requested_by: requestedBy.trim() || null,
      notes: notes.trim() || null,
      date_added: new Date().toISOString().split('T')[0],
    };

    if (editingId) {
      await supabase.from('scope_items').update(payload).eq('id', editingId);
    } else {
      await supabase.from('scope_items').insert({
        ...payload,
        sort_order: items.length,
      });
    }

    resetForm();
    setSaving(false);
    fetchItems();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('scope_items').delete().eq('id', id);
    fetchItems();
  }

  const filtered = filter === 'all' ? items : items.filter((i) => i.priority === filter);

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted/50 animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setFilter('all')} className={cn('px-2.5 py-1 text-xs rounded-md', filter === 'all' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent')}>All ({items.length})</button>
          {(Object.keys(priorityConfig) as MoscowPriority[]).map((p) => {
            const count = items.filter((i) => i.priority === p).length;
            return (
              <button key={p} onClick={() => setFilter(p)} className={cn('px-2.5 py-1 text-xs rounded-md', filter === p ? priorityConfig[p].color + ' font-medium' : 'text-muted-foreground hover:bg-accent')}>
                {priorityConfig[p].label} ({count})
              </button>
            );
          })}
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          + Add Item
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Requirement *</label>
            <input value={requirement} onChange={(e) => setRequirement(e.target.value)} placeholder="Describe the scope item..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as MoscowPriority)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {(Object.keys(priorityConfig) as MoscowPriority[]).map((p) => (
                  <option key={p} value={p}>{priorityConfig[p].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as ScopeStatus)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="deferred">Deferred</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Requested By</label>
              <input value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} placeholder="Name" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving || !requirement.trim()} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Items list */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-muted-foreground text-sm">
            {filter === 'all' ? 'No scope items yet. Add your first requirement.' : `No ${priorityConfig[filter].label} items.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-card p-3 flex items-start gap-3 group hover:border-border/80 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', priorityConfig[item.priority].color)}>
                    {priorityConfig[item.priority].label}
                  </span>
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', statusConfig[item.status])}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  {item.requested_by && (
                    <span className="text-xs text-muted-foreground">by {item.requested_by}</span>
                  )}
                </div>
                <p className="text-sm">{item.requirement}</p>
                {item.notes && <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => startEdit(item)} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="px-2 py-1 text-xs rounded border border-destructive/50 text-destructive hover:bg-destructive/10">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
