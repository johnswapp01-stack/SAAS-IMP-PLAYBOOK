'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils';
import type { Decision, ImpactLevel, DecisionStatus } from '@/types';

const impactColors: Record<ImpactLevel, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

const statusColors: Record<DecisionStatus, string> = {
  active: 'bg-green-100 text-green-700',
  superseded: 'bg-yellow-100 text-yellow-700',
  reversed: 'bg-red-100 text-red-700',
};

interface DecisionsTabProps {
  engagementId: string;
}

export function DecisionsTab({ engagementId }: DecisionsTabProps) {
  const { org } = useOrg();
  const [items, setItems] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [decision, setDecision] = useState('');
  const [context, setContext] = useState('');
  const [madeBy, setMadeBy] = useState('');
  const [date, setDate] = useState('');
  const [impact, setImpact] = useState<ImpactLevel>('medium');
  const [reversible, setReversible] = useState(true);
  const [status, setStatus] = useState<DecisionStatus>('active');
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!org) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('decisions')
      .select('*')
      .eq('engagement_id', engagementId)
      .eq('org_id', org.id)
      .order('date', { ascending: false, nullsFirst: false });
    setItems((data as Decision[]) || []);
    setLoading(false);
  }, [engagementId, org]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function resetForm() {
    setDecision(''); setContext(''); setMadeBy('');
    setDate(new Date().toISOString().split('T')[0]);
    setImpact('medium'); setReversible(true); setStatus('active');
    setEditingId(null); setShowForm(false);
  }

  function startEdit(d: Decision) {
    setDecision(d.decision); setContext(d.context || ''); setMadeBy(d.made_by || '');
    setDate(d.date || ''); setImpact(d.impact); setReversible(d.reversible);
    setStatus(d.status); setEditingId(d.id); setShowForm(true);
  }

  async function handleSave() {
    if (!org || !decision.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      engagement_id: engagementId,
      org_id: org.id,
      decision: decision.trim(),
      context: context.trim() || null,
      made_by: madeBy.trim() || null,
      date: date || null,
      impact,
      reversible,
      status,
    };
    if (editingId) {
      await supabase.from('decisions').update(payload).eq('id', editingId);
    } else {
      await supabase.from('decisions').insert(payload);
    }
    resetForm(); setSaving(false); fetchItems();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('decisions').delete().eq('id', id);
    fetchItems();
  }

  if (loading) {
    return <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{items.length} decision{items.length !== 1 ? 's' : ''} logged</p>
        <button onClick={() => { resetForm(); setDate(new Date().toISOString().split('T')[0]); setShowForm(true); }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          + Log Decision
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Decision *</label>
            <textarea value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="What was decided?" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Context</label>
            <textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Why was this decision made? What alternatives were considered?" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Made By</label>
              <input value={madeBy} onChange={(e) => setMadeBy(e.target.value)} placeholder="Who decided" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Impact</label>
              <select value={impact} onChange={(e) => setImpact(e.target.value as ImpactLevel)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as DecisionStatus)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="active">Active</option>
                <option value="superseded">Superseded</option>
                <option value="reversed">Reversed</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={reversible} onChange={(e) => setReversible(e.target.checked)} className="rounded border-input" />
            Reversible decision
          </label>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving || !decision.trim()} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Log'}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">⚖️</div>
          <p className="text-muted-foreground text-sm">No decisions logged yet. Document key decisions with their context and impact.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((d) => (
            <div key={d.id} className="rounded-lg border border-border bg-card p-4 group hover:border-border/80 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium flex-1">{d.decision}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                  <button onClick={() => startEdit(d)} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">Edit</button>
                  <button onClick={() => handleDelete(d.id)} className="px-2 py-1 text-xs rounded border border-destructive/50 text-destructive hover:bg-destructive/10">Delete</button>
                </div>
              </div>
              {d.context && <p className="text-xs text-muted-foreground mb-2">{d.context}</p>}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className={cn('px-2 py-0.5 rounded font-medium', statusColors[d.status])}>{d.status.charAt(0).toUpperCase() + d.status.slice(1)}</span>
                <span className={cn('px-2 py-0.5 rounded font-medium', impactColors[d.impact])}>{d.impact.charAt(0).toUpperCase() + d.impact.slice(1)} Impact</span>
                <span className="px-2 py-0.5 rounded font-medium bg-muted text-muted-foreground">{d.reversible ? 'Reversible' : 'Irreversible'}</span>
                {d.made_by && <span className="text-muted-foreground">by {d.made_by}</span>}
                {d.date && <span className="text-muted-foreground">{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
