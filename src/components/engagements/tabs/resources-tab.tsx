'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils';
import type { ResourceAllocation, AllocationStatus } from '@/types';

const statusConfig: Record<AllocationStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  planned: { label: 'Planned', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600' },
};

interface ResourcesTabProps {
  engagementId: string;
}

export function ResourcesTab({ engagementId }: ResourcesTabProps) {
  const { org } = useOrg();
  const [items, setItems] = useState<ResourceAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // We'll use member_id as a text field for now since we don't have a member picker
  const [memberName, setMemberName] = useState('');
  const [role, setRole] = useState('contributor');
  const [allocatedHours, setAllocatedHours] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<AllocationStatus>('active');
  const [saving, setSaving] = useState(false);

  // Store member names from a join or separate lookup
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});

  const fetchItems = useCallback(async () => {
    if (!org) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('resource_allocations')
      .select('*, org_members(user_id, role, profiles:user_id(email, full_name))')
      .eq('engagement_id', engagementId)
      .eq('org_id', org.id)
      .order('status', { ascending: true });

    const allocations = (data || []) as (ResourceAllocation & { org_members?: { profiles?: { email?: string; full_name?: string | null } } })[];
    const names: Record<string, string> = {};
    for (const a of allocations) {
      const profile = a.org_members?.profiles;
      names[a.member_id] = profile?.full_name || profile?.email || a.member_id.slice(0, 8);
    }
    setMemberNames(names);
    setItems(allocations as ResourceAllocation[]);
    setLoading(false);
  }, [engagementId, org]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Get org members for the picker
  const [orgMembers, setOrgMembers] = useState<{ id: string; label: string }[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  useEffect(() => {
    if (!org) return;
    async function loadMembers() {
      const supabase = createClient();
      const { data } = await supabase
        .from('org_members')
        .select('id, user_id, profiles:user_id(email, full_name)')
        .eq('org_id', org!.id)
        .not('accepted_at', 'is', null);
      const members = (data || []).map((m: Record<string, unknown>) => {
        const profile = m.profiles as { email?: string; full_name?: string | null } | null;
        return { id: m.id as string, label: profile?.full_name || profile?.email || (m.user_id as string).slice(0, 8) };
      });
      setOrgMembers(members);
      if (members.length > 0 && !selectedMemberId) setSelectedMemberId(members[0].id);
    }
    loadMembers();
  }, [org, selectedMemberId]);

  function resetForm() {
    setRole('contributor'); setAllocatedHours(''); setStartDate('');
    setEndDate(''); setStatus('active'); setEditingId(null); setShowForm(false);
    if (orgMembers.length > 0) setSelectedMemberId(orgMembers[0].id);
  }

  function startEdit(a: ResourceAllocation) {
    setSelectedMemberId(a.member_id); setRole(a.role);
    setAllocatedHours(String(a.allocated_hours_per_week));
    setStartDate(a.start_date || ''); setEndDate(a.end_date || '');
    setStatus(a.status); setEditingId(a.id); setShowForm(true);
  }

  async function handleSave() {
    if (!org || !selectedMemberId) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      org_id: org.id,
      engagement_id: engagementId,
      member_id: selectedMemberId,
      role: role.trim() || 'contributor',
      allocated_hours_per_week: allocatedHours ? parseInt(allocatedHours) : 0,
      start_date: startDate || null,
      end_date: endDate || null,
      status,
    };
    if (editingId) {
      await supabase.from('resource_allocations').update(payload).eq('id', editingId);
    } else {
      await supabase.from('resource_allocations').insert(payload);
    }
    resetForm(); setSaving(false); fetchItems();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('resource_allocations').delete().eq('id', id);
    fetchItems();
  }

  const totalAllocated = items.filter((i) => i.status === 'active').reduce((sum, i) => sum + i.allocated_hours_per_week, 0);

  if (loading) {
    return <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div>
      {items.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{items.filter((i) => i.status === 'active').length} active resource{items.filter((i) => i.status === 'active').length !== 1 ? 's' : ''}</span>
          <span className="text-sm font-medium">{totalAllocated} hrs/week allocated</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Team Assignments</p>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          + Assign Resource
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Team Member *</label>
              <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {orgMembers.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Lead, Contributor" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hours/Week</label>
              <input type="number" min="0" max="60" value={allocatedHours} onChange={(e) => setAllocatedHours(e.target.value)} placeholder="0" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as AllocationStatus)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {(Object.keys(statusConfig) as AllocationStatus[]).map((s) => <option key={s} value={s}>{statusConfig[s].label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving || !selectedMemberId} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Assign'}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">👤</div>
          <p className="text-muted-foreground text-sm">No resources assigned yet. Allocate team members to this engagement.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((a) => (
            <div key={a.id} className="rounded-lg border border-border bg-card p-3 flex items-center gap-3 group hover:border-border/80 transition-colors">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="text-xs font-medium">{(memberNames[a.member_id] || '?').charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{memberNames[a.member_id] || a.member_id.slice(0, 8)}</span>
                  <span className="text-xs text-muted-foreground">{a.role}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className={cn('px-1.5 py-0.5 rounded font-medium', statusConfig[a.status].color)}>{statusConfig[a.status].label}</span>
                  <span>{a.allocated_hours_per_week}h/week</span>
                  {a.start_date && <span>{new Date(a.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {a.end_date ? new Date(a.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'ongoing'}</span>}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => startEdit(a)} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">Edit</button>
                <button onClick={() => handleDelete(a.id)} className="px-2 py-1 text-xs rounded border border-destructive/50 text-destructive hover:bg-destructive/10">Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
