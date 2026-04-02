'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils';
import type { ComplianceRule, ComplianceAction, ComplianceSeverity } from '@/types';

const actionLabels: Record<ComplianceAction, { label: string; color: string }> = {
  warn: { label: 'Warn', color: 'bg-yellow-100 text-yellow-700' },
  block: { label: 'Block', color: 'bg-red-100 text-red-700' },
  notify: { label: 'Notify', color: 'bg-blue-100 text-blue-700' },
  auto_correct: { label: 'Auto-Correct', color: 'bg-purple-100 text-purple-700' },
};

const severityLabels: Record<ComplianceSeverity, { label: string; color: string }> = {
  info: { label: 'Info', color: 'bg-gray-100 text-gray-600' },
  warning: { label: 'Warning', color: 'bg-yellow-100 text-yellow-700' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700' },
};

const ruleTypeOptions = [
  { value: 'budget_threshold', label: 'Budget Threshold', description: 'Alert when budget usage exceeds a percentage' },
  { value: 'hours_cap', label: 'Hours Cap', description: 'Limit weekly hours logged per engagement' },
  { value: 'health_duration', label: 'Health Duration', description: 'Flag engagements in red/yellow health too long' },
  { value: 'resource_overallocation', label: 'Resource Overallocation', description: 'Warn when a member exceeds total allocated hours' },
  { value: 'stale_engagement', label: 'Stale Engagement', description: 'Flag engagements with no activity for N days' },
  { value: 'custom', label: 'Custom', description: 'Custom rule with manual condition' },
];

export function ComplianceRulesSection() {
  const { org, role } = useOrg();
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState('budget_threshold');
  const [action, setAction] = useState<ComplianceAction>('warn');
  const [severity, setSeverity] = useState<ComplianceSeverity>('warning');
  const [isActive, setIsActive] = useState(true);
  const [conditionValue, setConditionValue] = useState('');
  const [saving, setSaving] = useState(false);

  const isOwnerOrAdmin = role === 'owner' || role === 'admin';

  const fetchRules = useCallback(async () => {
    if (!org) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('compliance_rules')
      .select('*')
      .eq('org_id', org.id)
      .order('created_at', { ascending: false });
    setRules((data as ComplianceRule[]) || []);
    setLoading(false);
  }, [org]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  function getConditionLabel(rule: ComplianceRule): string {
    const cond = rule.condition as Record<string, unknown>;
    switch (rule.rule_type) {
      case 'budget_threshold':
        return `Budget > ${cond.threshold_pct || 80}%`;
      case 'hours_cap':
        return `> ${cond.max_hours || 40}h/week`;
      case 'health_duration':
        return `${cond.health_status || 'red'} for > ${cond.days || 14} days`;
      case 'resource_overallocation':
        return `> ${cond.max_hours || 50}h/week total`;
      case 'stale_engagement':
        return `No activity for ${cond.days || 30} days`;
      default:
        return JSON.stringify(cond);
    }
  }

  function getConditionPlaceholder(): string {
    switch (ruleType) {
      case 'budget_threshold': return 'Threshold % (e.g., 80)';
      case 'hours_cap': return 'Max hours/week (e.g., 40)';
      case 'health_duration': return 'Days in bad health (e.g., 14)';
      case 'resource_overallocation': return 'Max total hours/week (e.g., 50)';
      case 'stale_engagement': return 'Days of inactivity (e.g., 30)';
      default: return 'Condition value';
    }
  }

  function buildCondition(): Record<string, unknown> {
    const val = parseFloat(conditionValue) || 0;
    switch (ruleType) {
      case 'budget_threshold': return { threshold_pct: val || 80 };
      case 'hours_cap': return { max_hours: val || 40 };
      case 'health_duration': return { health_status: 'red', days: val || 14 };
      case 'resource_overallocation': return { max_hours: val || 50 };
      case 'stale_engagement': return { days: val || 30 };
      default: return { value: conditionValue };
    }
  }

  function resetForm() {
    setRuleName(''); setRuleType('budget_threshold'); setAction('warn');
    setSeverity('warning'); setIsActive(true); setConditionValue('');
    setEditingId(null); setShowForm(false);
  }

  function startEdit(r: ComplianceRule) {
    setRuleName(r.rule_name); setRuleType(r.rule_type);
    setAction(r.action); setSeverity(r.severity); setIsActive(r.is_active);
    const cond = r.condition as Record<string, unknown>;
    const val = cond.threshold_pct || cond.max_hours || cond.days || cond.value || '';
    setConditionValue(String(val));
    setEditingId(r.id); setShowForm(true);
  }

  async function handleSave() {
    if (!org || !ruleName.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const payload: any = {
      org_id: org.id,
      rule_name: ruleName.trim(),
      rule_type: ruleType,
      condition: buildCondition(),
      action,
      severity,
      is_active: isActive,
      created_by: user?.id || null,
    };
    if (editingId) {
      await supabase.from('compliance_rules').update(payload).eq('id', editingId);
    } else {
      await supabase.from('compliance_rules').insert(payload);
    }
    resetForm(); setSaving(false); fetchRules();
  }

  async function handleToggle(id: string, active: boolean) {
    const supabase = createClient();
    await supabase.from('compliance_rules').update({ is_active: active } as any).eq('id', id);
    fetchRules();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('compliance_rules').delete().eq('id', id);
    fetchRules();
  }

  if (loading) {
    return (
      <section className="rounded-lg border border-border p-6">
        <div className="h-6 w-40 bg-muted animate-pulse rounded mb-4" />
        <div className="h-24 bg-muted/50 animate-pulse rounded-lg" />
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-lg">Compliance Rules</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Define policies that flag violations across your engagements.</p>
        </div>
        {isOwnerOrAdmin && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
            + Add Rule
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Rule Name *</label>
              <input value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder="e.g., Budget Over 80%" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rule Type</label>
              <select value={ruleType} onChange={(e) => setRuleType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {ruleTypeOptions.map((rt) => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
              </select>
              <p className="text-xs text-muted-foreground mt-0.5">{ruleTypeOptions.find((rt) => rt.value === ruleType)?.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condition Value</label>
              <input type="number" value={conditionValue} onChange={(e) => setConditionValue(e.target.value)} placeholder={getConditionPlaceholder()} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Action</label>
              <select value={action} onChange={(e) => setAction(e.target.value as ComplianceAction)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {(Object.keys(actionLabels) as ComplianceAction[]).map((a) => <option key={a} value={a}>{actionLabels[a].label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Severity</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value as ComplianceSeverity)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {(Object.keys(severityLabels) as ComplianceSeverity[]).map((s) => <option key={s} value={s}>{severityLabels[s].label}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-input" />
                Active
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving || !ruleName.trim()} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </div>
      )}

      {rules.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-6 text-center">
          <div className="text-2xl mb-2">{String.fromCodePoint(0x1F6E1, 0xFE0F)}</div>
          <p className="text-muted-foreground text-sm">No compliance rules configured. Add rules to automatically flag policy violations.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((r) => (
            <div key={r.id} className={cn('rounded-lg border bg-card p-3 flex items-center gap-3 group transition-colors', r.is_active ? 'border-border' : 'border-border/50 opacity-60')}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{r.rule_name}</span>
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', severityLabels[r.severity].color)}>{severityLabels[r.severity].label}</span>
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', actionLabels[r.action].color)}>{actionLabels[r.action].label}</span>
                  {!r.is_active && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">Disabled</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{getConditionLabel(r)}</p>
              </div>
              {isOwnerOrAdmin && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => handleToggle(r.id, !r.is_active)} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">
                    {r.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => startEdit(r)} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">Edit</button>
                  <button onClick={() => handleDelete(r.id)} className="px-2 py-1 text-xs rounded border border-destructive/50 text-destructive hover:bg-destructive/10">Del</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
