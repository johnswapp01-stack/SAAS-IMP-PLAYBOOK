'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { ProjectPlan, PlanMilestone, PlanPhase, PlanStatus } from '@/types';

interface ProjectPlanTabProps {
  engagementId: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-green-100 text-green-700',
  superseded: 'bg-gray-100 text-gray-500',
};

const milestoneStatusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  complete: 'bg-green-100 text-green-700',
  at_risk: 'bg-yellow-100 text-yellow-700',
  missed: 'bg-red-100 text-red-700',
};

const phaseStatusColors: Record<string, string> = {
  not_started: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-100 text-blue-700',
  complete: 'bg-green-100 text-green-700',
};

export function ProjectPlanTab({ engagementId }: ProjectPlanTabProps) {
  const [plans, setPlans] = useState<ProjectPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activePlan, setActivePlan] = useState<ProjectPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  // Form state
  const [milestones, setMilestones] = useState<PlanMilestone[]>([]);
  const [phases, setPhases] = useState<PlanPhase[]>([]);
  const [assumptions, setAssumptions] = useState('');
  const [constraints, setConstraints] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPlans = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('project_plans')
      .select('*')
      .eq('engagement_id', engagementId)
      .order('version', { ascending: false });
    const all = (data || []) as unknown as ProjectPlan[];
    setPlans(all);
    setActivePlan(all.find((p) => p.status === 'active') || all[0] || null);
    setLoading(false);
  }, [engagementId]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  function resetForm() {
    setMilestones([{ name: '', target_date: '', status: 'pending' }]);
    setPhases([{ name: '', start_date: '', end_date: '', status: 'not_started' }]);
    setAssumptions(''); setConstraints('');
    setEditingPlan(null); setShowForm(false);
  }

  function startNew() {
    setMilestones([
      { name: 'Discovery Complete', target_date: '', status: 'pending' },
      { name: 'Configuration Complete', target_date: '', status: 'pending' },
      { name: 'UAT Sign-off', target_date: '', status: 'pending' },
      { name: 'Go-Live', target_date: '', status: 'pending' },
    ]);
    setPhases([
      { name: 'Discovery', start_date: '', end_date: '', status: 'not_started' },
      { name: 'Configuration', start_date: '', end_date: '', status: 'not_started' },
      { name: 'Testing', start_date: '', end_date: '', status: 'not_started' },
      { name: 'Go-Live', start_date: '', end_date: '', status: 'not_started' },
    ]);
    setAssumptions(''); setConstraints('');
    setEditingPlan(null); setShowForm(true);
  }

  function startEdit(plan: ProjectPlan) {
    setMilestones(plan.milestones.length > 0 ? plan.milestones : [{ name: '', target_date: '', status: 'pending' as const }]);
    setPhases(plan.phases.length > 0 ? plan.phases : [{ name: '', start_date: '', end_date: '', status: 'not_started' as const }]);
    setAssumptions((plan.assumptions || []).join('\n'));
    setConstraints((plan.constraints || []).join('\n'));
    setEditingPlan(plan.id); setShowForm(true);
  }

  function addMilestone() {
    setMilestones([...milestones, { name: '', target_date: '', status: 'pending' }]);
  }

  function updateMilestone(i: number, field: keyof PlanMilestone, val: string) {
    const updated = [...milestones];
    (updated[i] as any)[field] = val;
    setMilestones(updated);
  }

  function removeMilestone(i: number) {
    setMilestones(milestones.filter((_, idx) => idx !== i));
  }

  function addPhase() {
    setPhases([...phases, { name: '', start_date: '', end_date: '', status: 'not_started' }]);
  }

  function updatePhase(i: number, field: keyof PlanPhase, val: string) {
    const updated = [...phases];
    (updated[i] as any)[field] = val;
    setPhases(updated);
  }

  function removePhase(i: number) {
    setPhases(phases.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const cleanMilestones = milestones.filter((m) => m.name.trim());
    const cleanPhases = phases.filter((p) => p.name.trim());
    const assumptionsList = assumptions.split('\n').map((a) => a.trim()).filter(Boolean);
    const constraintsList = constraints.split('\n').map((c) => c.trim()).filter(Boolean);

    const payload: any = {
      milestones: cleanMilestones,
      phases: cleanPhases,
      assumptions: assumptionsList,
      constraints: constraintsList,
    };

    if (editingPlan) {
      await supabase.from('project_plans').update(payload).eq('id', editingPlan);
    } else {
      const nextVersion = plans.length > 0 ? Math.max(...plans.map((p) => p.version)) + 1 : 1;
      payload.engagement_id = engagementId;
      payload.org_id = plans[0]?.org_id;
      // If no org_id from existing plans, fetch from engagement
      if (!payload.org_id) {
        const { data: eng } = await supabase.from('engagements').select('org_id').eq('id', engagementId).single();
        payload.org_id = eng?.org_id;
      }
      payload.version = nextVersion;
      payload.status = 'draft';
      payload.generated_by = 'manual';
      await supabase.from('project_plans').insert(payload);
    }
    resetForm(); setSaving(false); fetchPlans();
  }

  async function handleStatusChange(planId: string, newStatus: PlanStatus) {
    const supabase = createClient();
    // If activating, supersede all other active plans
    if (newStatus === 'active') {
      const activePlans = plans.filter((p) => p.status === 'active' && p.id !== planId);
      for (const p of activePlans) {
        await supabase.from('project_plans').update({ status: 'superseded' } as any).eq('id', p.id);
      }
    }
    await supabase.from('project_plans').update({ status: newStatus } as any).eq('id', planId);
    fetchPlans();
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-lg" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Project Plan</h3>
          <p className="text-xs text-muted-foreground">{plans.length} version{plans.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={startNew} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          + New Version
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-4">
          <h4 className="font-medium text-sm">{editingPlan ? 'Edit Plan' : 'New Plan Version'}</h4>

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Milestones</label>
              <button onClick={addMilestone} className="text-xs text-primary hover:underline">+ Add</button>
            </div>
            <div className="space-y-2">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={m.name} onChange={(e) => updateMilestone(i, 'name', e.target.value)} placeholder="Milestone name" className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm" />
                  <input type="date" value={m.target_date} onChange={(e) => updateMilestone(i, 'target_date', e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
                  <select value={m.status} onChange={(e) => updateMilestone(i, 'status', e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-sm">
                    <option value="pending">Pending</option>
                    <option value="complete">Complete</option>
                    <option value="at_risk">At Risk</option>
                    <option value="missed">Missed</option>
                  </select>
                  <button onClick={() => removeMilestone(i)} className="text-xs text-destructive hover:underline">X</button>
                </div>
              ))}
            </div>
          </div>

          {/* Phases */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Phases</label>
              <button onClick={addPhase} className="text-xs text-primary hover:underline">+ Add</button>
            </div>
            <div className="space-y-2">
              {phases.map((p, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={p.name} onChange={(e) => updatePhase(i, 'name', e.target.value)} placeholder="Phase name" className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm" />
                  <input type="date" value={p.start_date} onChange={(e) => updatePhase(i, 'start_date', e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
                  <input type="date" value={p.end_date} onChange={(e) => updatePhase(i, 'end_date', e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
                  <select value={p.status} onChange={(e) => updatePhase(i, 'status', e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-sm">
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="complete">Complete</option>
                  </select>
                  <button onClick={() => removePhase(i)} className="text-xs text-destructive hover:underline">X</button>
                </div>
              ))}
            </div>
          </div>

          {/* Assumptions & Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Assumptions (one per line)</label>
              <textarea value={assumptions} onChange={(e) => setAssumptions(e.target.value)} rows={3} placeholder="Customer provides data by Week 2&#10;Single timezone deployment" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Constraints (one per line)</label>
              <textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} rows={3} placeholder="No deployments during Q4 freeze&#10;Budget capped at $50k" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">{String.fromCodePoint(0x1F4C5)}</div>
          <h3 className="font-semibold mb-1">No project plan yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Create a project plan with milestones, phases, assumptions, and constraints. Each version is tracked so you can see how the plan evolved.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Version selector */}
          {plans.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {plans.map((p) => (
                <button key={p.id} onClick={() => setActivePlan(p)} className={cn('px-3 py-1 rounded-md text-xs font-medium border transition-colors', activePlan?.id === p.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-accent')}>
                  v{p.version} <span className={cn('ml-1 px-1 py-0.5 rounded text-[10px]', statusColors[p.status])}>{p.status}</span>
                </button>
              ))}
            </div>
          )}

          {activePlan && (
            <div className="rounded-lg border border-border bg-card">
              {/* Plan header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Version {activePlan.version}</span>
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', statusColors[activePlan.status])}>{activePlan.status}</span>
                  <span className="text-xs text-muted-foreground">Created {new Date(activePlan.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-1">
                  {activePlan.status === 'draft' && (
                    <button onClick={() => handleStatusChange(activePlan.id, 'active')} className="px-2 py-1 text-xs rounded border border-green-200 text-green-700 hover:bg-green-50">Activate</button>
                  )}
                  {activePlan.status === 'active' && (
                    <button onClick={() => handleStatusChange(activePlan.id, 'superseded')} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">Supersede</button>
                  )}
                  <button onClick={() => startEdit(activePlan)} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">Edit</button>
                </div>
              </div>

              {/* Milestones */}
              {activePlan.milestones.length > 0 && (
                <div className="p-4 border-b border-border">
                  <h4 className="text-sm font-medium mb-3">Milestones</h4>
                  <div className="space-y-2">
                    {activePlan.milestones.map((m, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2">
                          <span className={cn('w-2 h-2 rounded-full', m.status === 'complete' ? 'bg-green-500' : m.status === 'at_risk' ? 'bg-yellow-500' : m.status === 'missed' ? 'bg-red-500' : 'bg-gray-300')} />
                          <span className="text-sm">{m.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', milestoneStatusColors[m.status])}>{m.status.replace('_', ' ')}</span>
                          {m.target_date && <span className="text-xs text-muted-foreground">{new Date(m.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phases — visual timeline */}
              {activePlan.phases.length > 0 && (
                <div className="p-4 border-b border-border">
                  <h4 className="text-sm font-medium mb-3">Phases</h4>
                  <div className="space-y-2">
                    {activePlan.phases.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm w-32 truncate">{p.name}</span>
                        <div className="flex-1 h-6 bg-muted rounded-md relative overflow-hidden">
                          <div className={cn('h-full rounded-md', p.status === 'complete' ? 'bg-green-200' : p.status === 'in_progress' ? 'bg-blue-200' : 'bg-muted')} style={{ width: p.status === 'complete' ? '100%' : p.status === 'in_progress' ? '50%' : '0%' }} />
                          <span className={cn('absolute inset-0 flex items-center justify-center text-[10px] font-medium', phaseStatusColors[p.status].split(' ')[1])}>{p.status.replace('_', ' ')}</span>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {p.start_date ? new Date(p.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                          {' → '}
                          {p.end_date ? new Date(p.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assumptions & Constraints */}
              {((activePlan.assumptions?.length || 0) > 0 || (activePlan.constraints?.length || 0) > 0) && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(activePlan.assumptions?.length || 0) > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Assumptions</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {activePlan.assumptions.map((a, i) => <li key={i} className="flex gap-2"><span className="text-muted-foreground/50">•</span>{a}</li>)}
                      </ul>
                    </div>
                  )}
                  {(activePlan.constraints?.length || 0) > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Constraints</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {activePlan.constraints.map((c, i) => <li key={i} className="flex gap-2"><span className="text-muted-foreground/50">•</span>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
