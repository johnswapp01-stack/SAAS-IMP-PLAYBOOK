'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils';
import type { Stakeholder, InfluenceLevel, CommunicationPref } from '@/types';

const influenceColors: Record<InfluenceLevel, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const commPrefLabels: Record<CommunicationPref, string> = {
  email: 'Email',
  slack: 'Slack',
  call: 'Call',
  in_person: 'In Person',
};

interface StakeholdersTabProps {
  engagementId: string;
}

export function StakeholdersTab({ engagementId }: StakeholdersTabProps) {
  const { org } = useOrg();
  const [items, setItems] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [influence, setInfluence] = useState<InfluenceLevel>('medium');
  const [commPref, setCommPref] = useState<CommunicationPref>('email');
  const [concerns, setConcerns] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!org) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('stakeholders')
      .select('*')
      .eq('engagement_id', engagementId)
      .eq('org_id', org.id)
      .order('influence', { ascending: true });
    setItems((data as Stakeholder[]) || []);
    setLoading(false);
  }, [engagementId, org]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function resetForm() {
    setName(''); setRole(''); setOrganization(''); setInfluence('medium');
    setCommPref('email'); setConcerns(''); setEmail('');
    setEditingId(null); setShowForm(false);
  }

  function startEdit(s: Stakeholder) {
    setName(s.name); setRole(s.role || ''); setOrganization(s.organization || '');
    setInfluence(s.influence); setCommPref(s.communication_pref);
    setConcerns(s.key_concerns || ''); setEmail(s.email || '');
    setEditingId(s.id); setShowForm(true);
  }

  async function handleSave() {
    if (!org || !name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      engagement_id: engagementId,
      org_id: org.id,
      name: name.trim(),
      role: role.trim() || null,
      organization: organization.trim() || null,
      influence,
      communication_pref: commPref,
      key_concerns: concerns.trim() || null,
      email: email.trim() || null,
    };
    if (editingId) {
      await supabase.from('stakeholders').update(payload).eq('id', editingId);
    } else {
      await supabase.from('stakeholders').insert(payload);
    }
    resetForm(); setSaving(false); fetchItems();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('stakeholders').delete().eq('id', id);
    fetchItems();
  }

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{items.length} stakeholder{items.length !== 1 ? 's' : ''}</p>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          + Add Stakeholder
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Project Sponsor" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Organization</label>
              <input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Company / team" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Influence</label>
              <select value={influence} onChange={(e) => setInfluence(e.target.value as InfluenceLevel)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Communication Preference</label>
              <select value={commPref} onChange={(e) => setCommPref(e.target.value as CommunicationPref)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {(Object.keys(commPrefLabels) as CommunicationPref[]).map((c) => (
                  <option key={c} value={c}>{commPrefLabels[c]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Key Concerns</label>
            <textarea value={concerns} onChange={(e) => setConcerns(e.target.value)} placeholder="What are this stakeholder's main concerns or priorities?" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving || !name.trim()} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-muted-foreground text-sm">No stakeholders tracked yet. Add key contacts and their roles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((s) => (
            <div key={s.id} className="rounded-lg border border-border bg-card p-4 group hover:border-border/80 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-sm">{s.name}</h4>
                  {s.role && <p className="text-xs text-muted-foreground">{s.role}{s.organization ? ` · ${s.organization}` : ''}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(s)} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="px-2 py-1 text-xs rounded border border-destructive/50 text-destructive hover:bg-destructive/10">Delete</button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('px-2 py-0.5 rounded text-xs font-medium', influenceColors[s.influence])}>
                  {s.influence.charAt(0).toUpperCase() + s.influence.slice(1)} Influence
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                  {commPrefLabels[s.communication_pref]}
                </span>
              </div>
              {s.key_concerns && <p className="text-xs text-muted-foreground mt-2">{s.key_concerns}</p>}
              {s.email && <p className="text-xs text-muted-foreground mt-1">{s.email}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
