'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils';
import type {
  OrgLearningContext,
  OutcomeCorrelation,
  SystemHealthCheck,
  SelfHealingEvent,
  ErrorPattern,
} from '@/types';

type TabId = 'learning' | 'correlations' | 'health' | 'healing' | 'errors';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'learning', label: 'Learning Context', icon: '🧠' },
  { id: 'correlations', label: 'Outcome Correlations', icon: '🔗' },
  { id: 'health', label: 'System Health', icon: '💚' },
  { id: 'healing', label: 'Healing Events', icon: '🔧' },
  { id: 'errors', label: 'Error Patterns', icon: '🛑' },
];

// ─── Helper badges ───

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    : pct >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  return <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', color)}>{pct}%</span>;
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const map: Record<string, string> = {
    positive: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    negative: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', map[outcome] || map.neutral)}>{outcome}</span>;
}

function HealthBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    healthy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    degraded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', map[status] || map.healthy)}>{status}</span>;
}

function HealingResultBadge({ result }: { result: string }) {
  const map: Record<string, string> = {
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    escalated: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', map[result] || map.escalated)}>{result}</span>;
}

// ─── LEARNING CONTEXT SECTION ───

function LearningContextSection({ orgId }: { orgId: string }) {
  const supabase = createClient();
  const [contexts, setContexts] = useState<OrgLearningContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [contextType, setContextType] = useState<OrgLearningContext['context_type']>('writing_style');
  const [contextKey, setContextKey] = useState('');
  const [contextValue, setContextValue] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('org_learning_context')
      .select('*')
      .eq('org_id', orgId)
      .order('confidence', { ascending: false });
    setContexts((data || []) as unknown as OrgLearningContext[]);
    setLoading(false);
  }, [orgId, supabase]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!contextKey.trim() || !contextValue.trim()) return;
    setSaving(true);
    await supabase.from('org_learning_context').upsert({
      org_id: orgId,
      context_type: contextType,
      context_key: contextKey.trim(),
      context_value: contextValue.trim(),
      confidence: 0.5,
      source_count: 1,
    } as any, { onConflict: 'org_id,context_type,context_key' });
    setContextKey('');
    setContextValue('');
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function handleBoost(ctx: OrgLearningContext) {
    const newConfidence = Math.min(1, ctx.confidence + 0.1);
    await supabase.from('org_learning_context')
      .update({ confidence: newConfidence, source_count: ctx.source_count + 1, last_updated: new Date().toISOString() } as any)
      .eq('id', ctx.id);
    load();
  }

  const contextTypes: OrgLearningContext['context_type'][] = ['writing_style', 'risk_patterns', 'common_issues', 'client_preferences', 'process_norms'];
  const typeLabels: Record<string, string> = {
    writing_style: 'Writing Style',
    risk_patterns: 'Risk Patterns',
    common_issues: 'Common Issues',
    client_preferences: 'Client Preferences',
    process_norms: 'Process Norms',
  };

  if (loading) return <div className="animate-pulse h-32 bg-muted rounded-lg" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Org Learning Context</h3>
          <p className="text-sm text-muted-foreground">Knowledge your organization has accumulated from engagements. Higher confidence = more data points confirming this pattern.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
          + Add Context
        </button>
      </div>

      {showForm && (
        <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <select value={contextType} onChange={e => setContextType(e.target.value as any)} className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm">
                {contextTypes.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Key (pattern name)</label>
              <input value={contextKey} onChange={e => setContextKey(e.target.value)} placeholder="e.g. formal_tone_preferred" className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Value (the learned insight)</label>
            <textarea value={contextValue} onChange={e => setContextValue(e.target.value)} rows={2} placeholder="e.g. Enterprise clients prefer formal, structured status updates with executive summaries" className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 border border-input rounded-md text-sm hover:bg-accent">Cancel</button>
          </div>
        </div>
      )}

      {contexts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          No learning context yet. The system builds context as agents process work and receive feedback.
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(
            contexts.reduce((acc, c) => {
              (acc[c.context_type] = acc[c.context_type] || []).push(c);
              return acc;
            }, {} as Record<string, OrgLearningContext[]>)
          ).map(([type, items]) => (
            <div key={type} className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 text-sm font-medium">{typeLabels[type] || type}</div>
              <div className="divide-y divide-border">
                {items.map(ctx => (
                  <div key={ctx.id} className="px-4 py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{ctx.context_key}</span>
                        <ConfidenceBadge value={ctx.confidence} />
                        <span className="text-xs text-muted-foreground">{ctx.source_count} source{ctx.source_count !== 1 ? 's' : ''}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{ctx.context_value}</p>
                    </div>
                    <button onClick={() => handleBoost(ctx)} className="text-xs px-2 py-1 border border-input rounded hover:bg-accent flex-shrink-0" title="Confirm this pattern (boosts confidence)">
                      +1 Confirm
                    </button>
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

// ─── OUTCOME CORRELATIONS SECTION ───

function OutcomeCorrelationsSection({ orgId }: { orgId: string }) {
  const supabase = createClient();
  const [correlations, setCorrelations] = useState<OutcomeCorrelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [signalType, setSignalType] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [outcome, setOutcome] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('outcome_correlations')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(50);
    setCorrelations((data || []) as unknown as OutcomeCorrelation[]);
    setLoading(false);
  }, [orgId, supabase]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!signalType.trim()) return;
    setSaving(true);
    await supabase.from('outcome_correlations').insert({
      org_id: orgId,
      signal_type: signalType.trim(),
      action_taken: actionTaken.trim() || null,
      outcome,
      correlation_data: {},
    } as any);
    setSignalType('');
    setActionTaken('');
    setOutcome('positive');
    setShowForm(false);
    setSaving(false);
    load();
  }

  // Compute summary stats
  const summary = correlations.reduce((acc, c) => {
    acc[c.outcome] = (acc[c.outcome] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const signalGroups = correlations.reduce((acc, c) => {
    (acc[c.signal_type] = acc[c.signal_type] || []).push(c);
    return acc;
  }, {} as Record<string, OutcomeCorrelation[]>);

  if (loading) return <div className="animate-pulse h-32 bg-muted rounded-lg" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Outcome Correlations</h3>
          <p className="text-sm text-muted-foreground">Track which signals and actions correlate with positive or negative engagement outcomes.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
          + Log Correlation
        </button>
      </div>

      {/* Summary cards */}
      {correlations.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{summary.positive || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Positive</div>
          </div>
          <div className="border border-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-500">{summary.neutral || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Neutral</div>
          </div>
          <div className="border border-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{summary.negative || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Negative</div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Signal Type</label>
              <input value={signalType} onChange={e => setSignalType(e.target.value)} placeholder="e.g. stakeholder_churn" className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Action Taken</label>
              <input value={actionTaken} onChange={e => setActionTaken(e.target.value)} placeholder="e.g. escalated_to_exec_sponsor" className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Outcome</label>
              <select value={outcome} onChange={e => setOutcome(e.target.value as any)} className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm">
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 border border-input rounded-md text-sm hover:bg-accent">Cancel</button>
          </div>
        </div>
      )}

      {correlations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          No outcome correlations recorded yet. As engagements complete and feedback accumulates, patterns will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(signalGroups).map(([signal, items]) => {
            const pos = items.filter(i => i.outcome === 'positive').length;
            const neg = items.filter(i => i.outcome === 'negative').length;
            const total = items.length;
            const successRate = total > 0 ? Math.round((pos / total) * 100) : 0;
            return (
              <div key={signal} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{signal}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{total} observations</span>
                    <span className={cn('text-xs font-medium', successRate >= 60 ? 'text-green-600' : successRate >= 40 ? 'text-yellow-600' : 'text-red-600')}>
                      {successRate}% positive
                    </span>
                  </div>
                </div>
                {/* Mini bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                  {pos > 0 && <div className="bg-green-500 h-full" style={{ width: `${(pos / total) * 100}%` }} />}
                  {items.filter(i => i.outcome === 'neutral').length > 0 && <div className="bg-gray-400 h-full" style={{ width: `${(items.filter(i => i.outcome === 'neutral').length / total) * 100}%` }} />}
                  {neg > 0 && <div className="bg-red-500 h-full" style={{ width: `${(neg / total) * 100}%` }} />}
                </div>
                <div className="mt-2 space-y-1">
                  {items.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <OutcomeBadge outcome={item.outcome} />
                      {item.action_taken && <span>Action: {item.action_taken}</span>}
                      <span className="ml-auto">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {items.length > 3 && <div className="text-xs text-muted-foreground">+{items.length - 3} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SYSTEM HEALTH SECTION ───

function SystemHealthSection() {
  const supabase = createClient();
  const [checks, setChecks] = useState<SystemHealthCheck[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    // Get latest check per type
    const { data } = await supabase
      .from('system_health_checks')
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(50);
    setChecks((data || []) as unknown as SystemHealthCheck[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function runHealthCheck() {
    // Seed synthetic health checks based on real system data
    const checkDefs = [
      { check_type: 'agent_success_rate', threshold_warn: 70, threshold_critical: 50 },
      { check_type: 'error_rate', threshold_warn: 5, threshold_critical: 15 },
      { check_type: 'queue_depth', threshold_warn: 50, threshold_critical: 100 },
    ];

    // Agent success rate from learning_feedback
    const { count: totalFeedback } = await supabase.from('learning_feedback').select('*', { count: 'exact', head: true });
    const { count: acceptedFeedback } = await supabase.from('learning_feedback').select('*', { count: 'exact', head: true }).eq('feedback_type', 'accepted');
    const agentRate = totalFeedback && totalFeedback > 0 ? Math.round(((acceptedFeedback || 0) / totalFeedback) * 100) : 100;

    // Pending tasks as queue depth
    const { count: pendingTasks } = await supabase.from('agent_tasks').select('*', { count: 'exact', head: true }).in('status', ['queued', 'awaiting_approval'] as any);

    // Error count from recent executions
    const { count: errorCount } = await supabase.from('agent_executions').select('*', { count: 'exact', head: true }).eq('status', 'error');

    const measurements = [
      { ...checkDefs[0], measured_value: agentRate },
      { ...checkDefs[1], measured_value: errorCount || 0 },
      { ...checkDefs[2], measured_value: pendingTasks || 0 },
    ];

    for (const m of measurements) {
      const status = m.check_type === 'agent_success_rate'
        ? (m.measured_value < m.threshold_critical ? 'critical' : m.measured_value < m.threshold_warn ? 'degraded' : 'healthy')
        : (m.measured_value > m.threshold_critical ? 'critical' : m.measured_value > m.threshold_warn ? 'degraded' : 'healthy');

      await supabase.from('system_health_checks').insert({
        check_type: m.check_type,
        status,
        measured_value: m.measured_value,
        threshold_warn: m.threshold_warn,
        threshold_critical: m.threshold_critical,
        metadata: {},
      } as any);
    }
    load();
  }

  // Deduplicate to latest per type
  const latestByType = checks.reduce((acc, c) => {
    if (!acc[c.check_type] || new Date(c.checked_at) > new Date(acc[c.check_type].checked_at)) {
      acc[c.check_type] = c;
    }
    return acc;
  }, {} as Record<string, SystemHealthCheck>);
  const latestChecks = Object.values(latestByType);

  const overallStatus = latestChecks.some(c => c.status === 'critical') ? 'critical'
    : latestChecks.some(c => c.status === 'degraded') ? 'degraded'
    : 'healthy';

  const typeLabels: Record<string, string> = {
    api_availability: 'API Availability',
    db_performance: 'Database Performance',
    agent_success_rate: 'Agent Success Rate',
    queue_depth: 'Task Queue Depth',
    error_rate: 'Error Rate',
  };

  if (loading) return <div className="animate-pulse h-32 bg-muted rounded-lg" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">System Health</h3>
          <p className="text-sm text-muted-foreground">Real-time health monitoring across key system metrics. Run a check to measure current state.</p>
        </div>
        <div className="flex items-center gap-3">
          {latestChecks.length > 0 && <HealthBadge status={overallStatus} />}
          <button onClick={runHealthCheck} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
            Run Health Check
          </button>
        </div>
      </div>

      {latestChecks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          No health checks recorded yet. Click &quot;Run Health Check&quot; to measure current system state.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {latestChecks.map(check => (
            <div key={check.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">{typeLabels[check.check_type] || check.check_type}</span>
                <HealthBadge status={check.status} />
              </div>
              <div className="text-3xl font-bold">
                {check.check_type === 'agent_success_rate' ? `${check.measured_value}%` : check.measured_value}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Warn: {check.threshold_warn} · Critical: {check.threshold_critical}
              </div>
              {/* Visual gauge */}
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                {check.check_type === 'agent_success_rate' ? (
                  <div
                    className={cn('h-full rounded-full', check.status === 'healthy' ? 'bg-green-500' : check.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500')}
                    style={{ width: `${Math.min(100, check.measured_value)}%` }}
                  />
                ) : (
                  <div
                    className={cn('h-full rounded-full', check.status === 'healthy' ? 'bg-green-500' : check.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500')}
                    style={{ width: `${Math.min(100, (check.measured_value / (check.threshold_critical * 1.5)) * 100)}%` }}
                  />
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Checked {new Date(check.checked_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {checks.length > latestChecks.length && (
        <div>
          <h4 className="text-sm font-medium mb-2">Recent History</h4>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Check</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                  <th className="text-right px-3 py-2 font-medium">Value</th>
                  <th className="text-right px-3 py-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {checks.slice(0, 15).map(c => (
                  <tr key={c.id}>
                    <td className="px-3 py-2">{typeLabels[c.check_type] || c.check_type}</td>
                    <td className="px-3 py-2"><HealthBadge status={c.status} /></td>
                    <td className="px-3 py-2 text-right">{c.measured_value}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{new Date(c.checked_at).toLocaleString()}</td>
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

// ─── HEALING EVENTS SECTION ───

function HealingEventsSection({ orgId }: { orgId: string }) {
  const supabase = createClient();
  const [events, setEvents] = useState<SelfHealingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('self_healing_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    // Filter by org if applicable — some events may be system-wide (null org_id)
    const filtered = (data || []) as unknown as SelfHealingEvent[];
    setEvents(filtered.filter(e => e.org_id === orgId || e.org_id === null));
    setLoading(false);
  }, [orgId, supabase]);

  useEffect(() => { load(); }, [load]);

  const eventTypeLabels: Record<string, string> = {
    auto_retry: 'Auto Retry',
    circuit_break: 'Circuit Break',
    fallback_activated: 'Fallback Activated',
    graceful_degradation: 'Graceful Degradation',
    auto_rollback: 'Auto Rollback',
    anomaly_detected: 'Anomaly Detected',
  };

  const summary = events.reduce((acc, e) => {
    acc[e.result] = (acc[e.result] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return <div className="animate-pulse h-32 bg-muted rounded-lg" />;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg">Self-Healing Events</h3>
        <p className="text-sm text-muted-foreground">Actions the system took automatically to recover from errors or degraded states.</p>
      </div>

      {events.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{summary.resolved || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Resolved</div>
          </div>
          <div className="border border-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.escalated || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Escalated</div>
          </div>
          <div className="border border-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{summary.failed || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Failed</div>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          No healing events yet. When the system detects and auto-recovers from errors, events will appear here.
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Type</th>
                <th className="text-left px-3 py-2 font-medium">Trigger</th>
                <th className="text-left px-3 py-2 font-medium">Action</th>
                <th className="text-left px-3 py-2 font-medium">Result</th>
                <th className="text-right px-3 py-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map(ev => (
                <tr key={ev.id}>
                  <td className="px-3 py-2">
                    <span className="inline-flex px-2 py-0.5 bg-muted rounded text-xs font-medium">{eventTypeLabels[ev.event_type] || ev.event_type}</span>
                  </td>
                  <td className="px-3 py-2 max-w-[200px] truncate text-muted-foreground" title={ev.trigger_error}>{ev.trigger_error}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate" title={ev.healing_action}>{ev.healing_action}</td>
                  <td className="px-3 py-2"><HealingResultBadge result={ev.result} /></td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{new Date(ev.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── ERROR PATTERNS SECTION ───

function ErrorPatternsSection() {
  const supabase = createClient();
  const [patterns, setPatterns] = useState<ErrorPattern[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('error_patterns')
      .select('*')
      .order('occurrence_count', { ascending: false })
      .limit(50);
    setPatterns((data || []) as unknown as ErrorPattern[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function scanForPatterns() {
    // Aggregate errors from agent_executions into patterns
    const { data: errors } = await supabase
      .from('agent_executions')
      .select('error_message, status')
      .eq('status', 'error')
      .not('error_message', 'is', null);

    if (!errors || errors.length === 0) return;

    // Group by error signature (first 100 chars of error message as signature)
    const grouped = (errors as { error_message: string; status: string }[]).reduce((acc, e) => {
      const sig = (e.error_message || 'unknown').substring(0, 100);
      acc[sig] = (acc[sig] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const [sig, count] of Object.entries(grouped)) {
      const errorType = sig.toLowerCase().includes('timeout') ? 'timeout'
        : sig.toLowerCase().includes('auth') ? 'authentication'
        : sig.toLowerCase().includes('rate') ? 'rate_limit'
        : 'runtime_error';

      await supabase.from('error_patterns').upsert({
        error_signature: sig,
        error_type: errorType,
        occurrence_count: count,
        last_occurrence: new Date().toISOString(),
        resolution_success_rate: 0,
        requires_human: count > 5,
      } as any, { onConflict: 'error_signature' });
    }
    load();
  }

  if (loading) return <div className="animate-pulse h-32 bg-muted rounded-lg" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Error Patterns</h3>
          <p className="text-sm text-muted-foreground">Recurring errors detected across the system. Patterns with auto-resolution get fixed automatically. High-frequency patterns get flagged for human review.</p>
        </div>
        <button onClick={scanForPatterns} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
          Scan for Patterns
        </button>
      </div>

      {patterns.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
          No error patterns detected yet. Click &quot;Scan for Patterns&quot; to analyze errors from agent executions.
        </div>
      ) : (
        <div className="space-y-2">
          {patterns.map(pattern => (
            <div key={pattern.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex px-2 py-0.5 bg-muted rounded text-xs font-medium">{pattern.error_type}</span>
                    <span className="text-xs text-muted-foreground">{pattern.occurrence_count} occurrence{pattern.occurrence_count !== 1 ? 's' : ''}</span>
                    {pattern.requires_human && (
                      <span className="inline-flex px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">Needs Human</span>
                    )}
                  </div>
                  <p className="text-sm mt-1 font-mono text-muted-foreground break-all">{pattern.error_signature}</p>
                  {pattern.auto_resolution && (
                    <p className="text-xs text-green-600 mt-1">Auto-resolution: {pattern.auto_resolution} ({Math.round(pattern.resolution_success_rate * 100)}% success)</p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex-shrink-0">
                  Last: {pattern.last_occurrence ? new Date(pattern.last_occurrence).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ───

export default function IntelligencePage() {
  const [activeTab, setActiveTab] = useState<TabId>('learning');
  const { org, loading: orgLoading } = useOrg();

  if (orgLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-4 bg-muted rounded w-96" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Please complete onboarding to access Intelligence.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Intelligence</h1>
        <p className="text-muted-foreground mt-1">
          Self-learning and self-healing. The system improves recommendations and resilience based on measured history.
        </p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              <span className="text-xs">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'learning' && <LearningContextSection orgId={org.id} />}
        {activeTab === 'correlations' && <OutcomeCorrelationsSection orgId={org.id} />}
        {activeTab === 'health' && <SystemHealthSection />}
        {activeTab === 'healing' && <HealingEventsSection orgId={org.id} />}
        {activeTab === 'errors' && <ErrorPatternsSection />}
      </div>
    </div>
  );
}
