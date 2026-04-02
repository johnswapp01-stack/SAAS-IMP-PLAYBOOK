'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils';
import type { ChecklistItem, ChecklistType, TaskStatus, SignOffStatus } from '@/types';

const taskStatusConfig: Record<TaskStatus, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  complete: { label: 'Complete', color: 'bg-green-100 text-green-700' },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700' },
  na: { label: 'N/A', color: 'bg-gray-100 text-gray-400' },
};

const signOffLabels: Record<SignOffStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  na: 'N/A',
};

interface ChecklistTabProps {
  engagementId: string;
  checklistType: ChecklistType;
}

export function ChecklistTab({ engagementId, checklistType }: ChecklistTabProps) {
  const { org } = useOrg();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [task, setTask] = useState('');
  const [phase, setPhase] = useState('');
  const [owner, setOwner] = useState('');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [dueDate, setDueDate] = useState('');
  const [signOff, setSignOff] = useState<SignOffStatus>('pending');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const defaultPhases = checklistType === 'kickoff'
    ? ['Pre-Kickoff', 'During Kickoff', 'Post-Kickoff']
    : ['Pre-UAT', 'UAT', 'Pre-Launch', 'Launch Day', 'Post-Launch'];

  const fetchItems = useCallback(async () => {
    if (!org) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('engagement_id', engagementId)
      .eq('org_id', org.id)
      .eq('checklist_type', checklistType)
      .order('sort_order', { ascending: true });
    setItems((data as ChecklistItem[]) || []);
    setLoading(false);
  }, [engagementId, org, checklistType]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function resetForm() {
    setTask(''); setPhase(defaultPhases[0]); setOwner('');
    setStatus('not_started'); setDueDate(''); setSignOff('pending'); setNotes('');
    setEditingId(null); setShowForm(false);
  }

  function startEdit(c: ChecklistItem) {
    setTask(c.task); setPhase(c.phase || ''); setOwner(c.owner || '');
    setStatus(c.status); setDueDate(c.due_date || '');
    setSignOff(c.sign_off); setNotes(c.notes || '');
    setEditingId(c.id); setShowForm(true);
  }

  async function handleSave() {
    if (!org || !task.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      engagement_id: engagementId,
      org_id: org.id,
      checklist_type: checklistType,
      task: task.trim(),
      phase: phase.trim() || null,
      owner: owner.trim() || null,
      status,
      due_date: dueDate || null,
      sign_off: signOff,
      notes: notes.trim() || null,
    };
    if (editingId) {
      await supabase.from('checklist_items').update(payload).eq('id', editingId);
    } else {
      await supabase.from('checklist_items').insert({ ...payload, sort_order: items.length });
    }
    resetForm(); setSaving(false); fetchItems();
  }

  async function handleQuickStatus(id: string, newStatus: TaskStatus) {
    const supabase = createClient();
    await supabase.from('checklist_items').update({ status: newStatus }).eq('id', id);
    fetchItems();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('checklist_items').delete().eq('id', id);
    fetchItems();
  }

  const completedCount = items.filter((i) => i.status === 'complete').length;
  const progressPct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  // Group by phase
  const grouped = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    const key = item.phase || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted/50 animate-pulse rounded-lg" />)}</div>;
  }

  const label = checklistType === 'kickoff' ? 'Kickoff' : 'Go-Live';

  return (
    <div>
      {/* Progress bar */}
      {items.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">{completedCount} of {items.length} complete</span>
            <span className="font-medium">{progressPct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{label} Checklist</p>
        <button onClick={() => { resetForm(); setPhase(defaultPhases[0]); setShowForm(true); }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          + Add Task
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Task *</label>
            <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="What needs to happen?" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Phase</label>
              <select value={phase} onChange={(e) => setPhase(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {defaultPhases.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Owner</label>
              <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Who's responsible" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {(Object.keys(taskStatusConfig) as TaskStatus[]).map((s) => <option key={s} value={s}>{taskStatusConfig[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sign-Off</label>
              <select value={signOff} onChange={(e) => setSignOff(e.target.value as SignOffStatus)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {(Object.keys(signOffLabels) as SignOffStatus[]).map((s) => <option key={s} value={s}>{signOffLabels[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving || !task.trim()} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">{checklistType === 'kickoff' ? '🚀' : '✅'}</div>
          <p className="text-muted-foreground text-sm">No {label.toLowerCase()} tasks yet. Add checklist items organized by phase.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([phaseName, phaseItems]) => (
            <div key={phaseName}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{phaseName}</h4>
              <div className="space-y-1">
                {phaseItems.map((c) => (
                  <div key={c.id} className="rounded-lg border border-border bg-card p-3 flex items-center gap-3 group hover:border-border/80 transition-colors">
                    {/* Quick toggle */}
                    <button
                      onClick={() => handleQuickStatus(c.id, c.status === 'complete' ? 'not_started' : 'complete')}
                      className={cn('w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                        c.status === 'complete' ? 'bg-primary border-primary text-primary-foreground' : 'border-input hover:border-primary'
                      )}
                    >
                      {c.status === 'complete' && <span className="text-xs">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm', c.status === 'complete' && 'line-through text-muted-foreground')}>{c.task}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {c.status !== 'complete' && c.status !== 'not_started' && (
                          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', taskStatusConfig[c.status].color)}>{taskStatusConfig[c.status].label}</span>
                        )}
                        {c.owner && <span className="text-xs text-muted-foreground">{c.owner}</span>}
                        {c.due_date && <span className="text-xs text-muted-foreground">{new Date(c.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                        {c.sign_off === 'approved' && <span className="text-xs text-green-600 font-medium">Signed off</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => startEdit(c)} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">Edit</button>
                      <button onClick={() => handleDelete(c.id)} className="px-2 py-1 text-xs rounded border border-destructive/50 text-destructive hover:bg-destructive/10">Del</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
