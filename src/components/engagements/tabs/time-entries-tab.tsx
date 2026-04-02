'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils';
import type { TimeEntry, TimeCategory } from '@/types';

const categoryConfig: Record<TimeCategory, { label: string; color: string }> = {
  delivery: { label: 'Delivery', color: 'bg-blue-100 text-blue-700' },
  admin: { label: 'Admin', color: 'bg-gray-100 text-gray-600' },
  internal: { label: 'Internal', color: 'bg-purple-100 text-purple-700' },
  training: { label: 'Training', color: 'bg-green-100 text-green-700' },
};

interface TimeEntriesTabProps {
  engagementId: string;
}

export function TimeEntriesTab({ engagementId }: TimeEntriesTabProps) {
  const { org, membership } = useOrg();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [billable, setBillable] = useState(true);
  const [category, setCategory] = useState<TimeCategory>('delivery');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!org) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('time_entries')
      .select('*')
      .eq('engagement_id', engagementId)
      .eq('org_id', org.id)
      .order('date', { ascending: false });
    setEntries((data as TimeEntry[]) || []);
    setLoading(false);
  }, [engagementId, org]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  function resetForm() {
    setDate(new Date().toISOString().split('T')[0]);
    setHours(''); setBillable(true); setCategory('delivery');
    setDescription(''); setEditingId(null); setShowForm(false);
  }

  function startEdit(e: TimeEntry) {
    setDate(e.date); setHours(String(e.hours)); setBillable(e.billable);
    setCategory(e.category); setDescription(e.description || '');
    setEditingId(e.id); setShowForm(true);
  }

  async function handleSave() {
    if (!org || !membership || !hours || parseFloat(hours) <= 0) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      org_id: org.id,
      engagement_id: engagementId,
      member_id: membership.id,
      date,
      hours: parseFloat(hours),
      billable,
      category,
      description: description.trim() || null,
      agent_generated: false,
      approved: false,
    };
    if (editingId) {
      await supabase.from('time_entries').update(payload).eq('id', editingId);
    } else {
      await supabase.from('time_entries').insert(payload);
    }
    resetForm(); setSaving(false); fetchEntries();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('time_entries').delete().eq('id', id);
    fetchEntries();
  }

  async function handleApprove(id: string, approved: boolean) {
    const supabase = createClient();
    await supabase.from('time_entries').update({ approved }).eq('id', id);
    fetchEntries();
  }

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  const billableHours = entries.filter((e) => e.billable).reduce((sum, e) => sum + e.hours, 0);

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted/50 animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div>
      {/* Summary bar */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Total Hours</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold">{billableHours.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Billable Hours</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold">{totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0}%</p>
            <p className="text-xs text-muted-foreground">Utilization</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}</p>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          + Log Time
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hours *</label>
              <input type="number" step="0.25" min="0.25" max="24" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0.00" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as TimeCategory)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {(Object.keys(categoryConfig) as TimeCategory[]).map((c) => <option key={c} value={c}>{categoryConfig[c].label}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} className="rounded border-input" />
                Billable
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What did you work on?" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving || !hours || parseFloat(hours) <= 0} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Log'}
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">⏱️</div>
          <p className="text-muted-foreground text-sm">No time logged yet. Track hours spent on this engagement.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Hours</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Description</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="w-[100px]"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group">
                  <td className="py-3 px-4">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  <td className="py-3 px-4 font-medium">
                    {e.hours}h
                    {e.billable && <span className="ml-1 text-xs text-green-600">$</span>}
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', categoryConfig[e.category].color)}>{categoryConfig[e.category].label}</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{e.description || '—'}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleApprove(e.id, !e.approved)} className={cn('px-2 py-0.5 rounded text-xs font-medium', e.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                      {e.approved ? 'Approved' : 'Pending'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(e)} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">Edit</button>
                      <button onClick={() => handleDelete(e.id)} className="px-2 py-1 text-xs rounded border border-destructive/50 text-destructive hover:bg-destructive/10">Del</button>
                    </div>
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
