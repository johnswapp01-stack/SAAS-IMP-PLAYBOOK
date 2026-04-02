'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import type { RaciItem } from '@/types';

interface RaciTabProps {
  engagementId: string;
}

export function RaciTab({ engagementId }: RaciTabProps) {
  const { org } = useOrg();
  const [items, setItems] = useState<RaciItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [deliverable, setDeliverable] = useState('');
  const [responsible, setResponsible] = useState('');
  const [accountable, setAccountable] = useState('');
  const [consulted, setConsulted] = useState('');
  const [informed, setInformed] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!org) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('raci_items')
      .select('*')
      .eq('engagement_id', engagementId)
      .eq('org_id', org.id)
      .order('sort_order', { ascending: true });
    setItems((data as RaciItem[]) || []);
    setLoading(false);
  }, [engagementId, org]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function resetForm() {
    setDeliverable(''); setResponsible(''); setAccountable('');
    setConsulted(''); setInformed('');
    setEditingId(null); setShowForm(false);
  }

  function startEdit(r: RaciItem) {
    setDeliverable(r.deliverable); setResponsible(r.responsible || '');
    setAccountable(r.accountable || ''); setConsulted(r.consulted || '');
    setInformed(r.informed || '');
    setEditingId(r.id); setShowForm(true);
  }

  async function handleSave() {
    if (!org || !deliverable.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      engagement_id: engagementId,
      org_id: org.id,
      deliverable: deliverable.trim(),
      responsible: responsible.trim() || null,
      accountable: accountable.trim() || null,
      consulted: consulted.trim() || null,
      informed: informed.trim() || null,
    };
    if (editingId) {
      await supabase.from('raci_items').update(payload).eq('id', editingId);
    } else {
      await supabase.from('raci_items').insert({ ...payload, sort_order: items.length });
    }
    resetForm(); setSaving(false); fetchItems();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('raci_items').delete().eq('id', id);
    fetchItems();
  }

  if (loading) {
    return <div className="h-32 bg-muted/50 animate-pulse rounded-lg" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{items.length} deliverable{items.length !== 1 ? 's' : ''} mapped</p>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          + Add Deliverable
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Deliverable *</label>
            <input value={deliverable} onChange={(e) => setDeliverable(e.target.value)} placeholder="e.g., Data Migration Plan" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Responsible</label>
              <input value={responsible} onChange={(e) => setResponsible(e.target.value)} placeholder="Does the work" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Accountable</label>
              <input value={accountable} onChange={(e) => setAccountable(e.target.value)} placeholder="Signs off" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Consulted</label>
              <input value={consulted} onChange={(e) => setConsulted(e.target.value)} placeholder="Provides input" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Informed</label>
              <input value={informed} onChange={(e) => setInformed(e.target.value)} placeholder="Kept in loop" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving || !deliverable.trim()} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-muted-foreground text-sm">No RACI assignments yet. Map who does what for each deliverable.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Deliverable</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[15%]">R</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[15%]">A</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[15%]">C</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[15%]">I</th>
                  <th className="w-[80px]"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group">
                    <td className="py-3 px-4 font-medium">{r.deliverable}</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.responsible || '—'}</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.accountable || '—'}</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.consulted || '—'}</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.informed || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(r)} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">Edit</button>
                        <button onClick={() => handleDelete(r.id)} className="px-2 py-1 text-xs rounded border border-destructive/50 text-destructive hover:bg-destructive/10">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
