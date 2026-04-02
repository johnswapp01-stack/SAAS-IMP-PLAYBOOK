'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { RiskSignal, RiskSeverity, RiskSignalStatus } from '@/types';

interface RiskSignalsTabProps {
  engagementId: string;
}

const severityColors: Record<RiskSeverity, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const statusColors: Record<RiskSignalStatus, string> = {
  detected: 'bg-red-100 text-red-700',
  acknowledged: 'bg-yellow-100 text-yellow-700',
  mitigated: 'bg-green-100 text-green-700',
  escalated: 'bg-purple-100 text-purple-700',
  false_positive: 'bg-gray-100 text-gray-500',
};

const signalTypes = ['timeline', 'scope', 'budget', 'stakeholder', 'technical', 'resource'];

export function RiskSignalsTab({ engagementId }: RiskSignalsTabProps) {
  const [signals, setSignals] = useState<RiskSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  // Form state
  const [signalType, setSignalType] = useState('timeline');
  const [severity, setSeverity] = useState<RiskSeverity>('medium');
  const [confidence, setConfidence] = useState('0.50');
  const [description, setDescription] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSignals = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('risk_signals')
      .select('*')
      .eq('engagement_id', engagementId)
      .order('detected_at', { ascending: false });
    setSignals((data || []) as unknown as RiskSignal[]);
    setLoading(false);
  }, [engagementId]);

  useEffect(() => { fetchSignals(); }, [fetchSignals]);

  const openStatuses = ['detected', 'acknowledged', 'escalated'];
  const filtered = filter === 'all' ? signals :
    filter === 'open' ? signals.filter((s) => openStatuses.includes(s.status)) :
    signals.filter((s) => !openStatuses.includes(s.status));

  const openCount = signals.filter((s) => openStatuses.includes(s.status)).length;
  const criticalCount = signals.filter((s) => s.severity === 'critical' && openStatuses.includes(s.status)).length;

  function resetForm() {
    setSignalType('timeline'); setSeverity('medium'); setConfidence('0.50');
    setDescription(''); setRecommendedAction('');
    setEditingId(null); setShowForm(false);
  }

  function startEdit(s: RiskSignal) {
    setSignalType(s.signal_type); setSeverity(s.severity);
    setConfidence(String(s.confidence)); setDescription(s.description);
    setRecommendedAction(s.recommended_action || '');
    setEditingId(s.id); setShowForm(true);
  }

  async function handleSave() {
    if (!description.trim()) return;
    setSaving(true);
    const supabase = createClient();

    const payload: any = {
      signal_type: signalType,
      severity,
      confidence: parseFloat(confidence) || 0.5,
      description: description.trim(),
      recommended_action: recommendedAction.trim() || null,
    };

    if (editingId) {
      await supabase.from('risk_signals').update(payload).eq('id', editingId);
    } else {
      // Get org_id from engagement
      const { data: eng } = await supabase.from('engagements').select('org_id').eq('id', engagementId).single();
      payload.org_id = eng?.org_id;
      payload.engagement_id = engagementId;
      payload.status = 'detected';
      payload.evidence = {};
      await supabase.from('risk_signals').insert(payload);
    }
    resetForm(); setSaving(false); fetchSignals();
  }

  async function handleStatusUpdate(id: string, newStatus: RiskSignalStatus) {
    const supabase = createClient();
    const update: any = { status: newStatus };
    if (newStatus === 'mitigated' || newStatus === 'false_positive') {
      update.outcome = newStatus === 'false_positive' ? 'false_alarm' : 'risk_avoided';
    }
    await supabase.from('risk_signals').update(update).eq('id', id);
    fetchSignals();
  }

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-6 flex-1">
          <div>
            <span className="text-2xl font-bold">{openCount}</span>
            <span className="text-xs text-muted-foreground ml-1">open risks</span>
          </div>
          {criticalCount > 0 && (
            <div className="text-red-600">
              <span className="text-2xl font-bold">{criticalCount}</span>
              <span className="text-xs ml-1">critical</span>
            </div>
          )}
          <div className="flex gap-1">
            {(['all', 'open', 'resolved'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn('px-2 py-1 text-xs rounded-md', filter === f ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent')}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          + Flag Risk
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Signal Type</label>
              <select value={signalType} onChange={(e) => setSignalType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {signalTypes.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Severity</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value as RiskSeverity)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confidence (0-1)</label>
              <input type="number" min="0" max="1" step="0.05" value={confidence} onChange={(e) => setConfidence(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What risk has been identified?" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Recommended Action</label>
            <textarea value={recommendedAction} onChange={(e) => setRecommendedAction(e.target.value)} rows={2} placeholder="What should be done to mitigate this risk?" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving || !description.trim()} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create Signal'}
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">{String.fromCodePoint(0x1F6E1, 0xFE0F)}</div>
          <h3 className="font-semibold mb-1">{filter === 'all' ? 'No risk signals' : `No ${filter} risks`}</h3>
          <p className="text-muted-foreground text-sm">
            {filter === 'all' ? 'Flag risks as they emerge so the team can take action early.' : 'Try switching filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <div key={s.id} className={cn('rounded-lg border bg-card p-4 group', s.severity === 'critical' && openStatuses.includes(s.status) ? 'border-red-200 bg-red-50/50 dark:bg-red-950/10' : 'border-border')}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', severityColors[s.severity])}>{s.severity}</span>
                    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', statusColors[s.status])}>{s.status.replace('_', ' ')}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">{s.signal_type}</span>
                    <span className="text-xs text-muted-foreground">{Math.round(s.confidence * 100)}% confidence</span>
                  </div>
                  <p className="text-sm">{s.description}</p>
                  {s.recommended_action && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Action:</span> {s.recommended_action}
                    </p>
                  )}
                  {s.resolution_notes && (
                    <p className="text-xs text-green-600 mt-1">
                      <span className="font-medium">Resolution:</span> {s.resolution_notes}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Detected {new Date(s.detected_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {s.status === 'detected' && (
                    <button onClick={() => handleStatusUpdate(s.id, 'acknowledged')} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">Acknowledge</button>
                  )}
                  {(s.status === 'detected' || s.status === 'acknowledged') && (
                    <>
                      <button onClick={() => handleStatusUpdate(s.id, 'mitigated')} className="px-2 py-1 text-xs rounded border border-green-200 text-green-700 hover:bg-green-50">Mitigated</button>
                      <button onClick={() => handleStatusUpdate(s.id, 'escalated')} className="px-2 py-1 text-xs rounded border border-purple-200 text-purple-700 hover:bg-purple-50">Escalate</button>
                    </>
                  )}
                  {s.status !== 'false_positive' && s.status !== 'mitigated' && (
                    <button onClick={() => handleStatusUpdate(s.id, 'false_positive')} className="px-2 py-1 text-xs rounded border border-input text-muted-foreground hover:bg-accent">False +</button>
                  )}
                  <button onClick={() => startEdit(s)} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
