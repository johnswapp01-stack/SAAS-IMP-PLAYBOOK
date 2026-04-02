'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils';
import type { StatusReport, HealthStatus, ReportType } from '@/types';

const healthColors: Record<HealthStatus, string> = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
};

const healthEmoji: Record<HealthStatus, string> = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴',
};

const reportTypeLabels: Record<ReportType, string> = {
  internal: 'Internal',
  customer: 'Customer',
  executive: 'Executive',
};

interface ReportsTabProps {
  engagementId: string;
}

export function ReportsTab({ engagementId }: ReportsTabProps) {
  const { org } = useOrg();
  const [items, setItems] = useState<StatusReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [reportType, setReportType] = useState<ReportType>('internal');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [overallHealth, setOverallHealth] = useState<HealthStatus>('green');
  const [accomplished, setAccomplished] = useState('');
  const [plannedNext, setPlannedNext] = useState('');
  const [blockers, setBlockers] = useState('');
  const [risks, setRisks] = useState('');
  const [saving, setSaving] = useState(false);

  // View state
  const [viewingReport, setViewingReport] = useState<StatusReport | null>(null);

  const fetchItems = useCallback(async () => {
    if (!org) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('status_reports')
      .select('*')
      .eq('engagement_id', engagementId)
      .eq('org_id', org.id)
      .order('period_end', { ascending: false });
    setItems((data as StatusReport[]) || []);
    setLoading(false);
  }, [engagementId, org]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function parseItems(text: string): { text: string }[] {
    return text.split('\n').filter((l) => l.trim()).map((l) => ({ text: l.trim() }));
  }

  function itemsToText(arr: Record<string, unknown>[]): string {
    return arr.map((i) => (i as { text?: string }).text || '').join('\n');
  }

  function resetForm() {
    setReportType('internal');
    const today = new Date();
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    setPeriodStart(weekAgo.toISOString().split('T')[0]);
    setPeriodEnd(today.toISOString().split('T')[0]);
    setOverallHealth('green');
    setAccomplished(''); setPlannedNext(''); setBlockers(''); setRisks('');
    setEditingId(null); setShowForm(false);
  }

  function startEdit(r: StatusReport) {
    setReportType(r.report_type); setPeriodStart(r.period_start);
    setPeriodEnd(r.period_end); setOverallHealth(r.overall_health);
    setAccomplished(itemsToText(r.accomplished)); setPlannedNext(itemsToText(r.planned_next));
    setBlockers(itemsToText(r.blockers)); setRisks(itemsToText(r.risks));
    setEditingId(r.id); setShowForm(true); setViewingReport(null);
  }

  async function handleSave() {
    if (!org || !periodStart || !periodEnd) return;
    setSaving(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      engagement_id: engagementId,
      org_id: org.id,
      report_type: reportType,
      period_start: periodStart,
      period_end: periodEnd,
      overall_health: overallHealth,
      accomplished: parseItems(accomplished),
      planned_next: parseItems(plannedNext),
      blockers: parseItems(blockers),
      risks: parseItems(risks),
    };
    if (editingId) {
      await supabase.from('status_reports').update(payload).eq('id', editingId);
    } else {
      await supabase.from('status_reports').insert(payload);
    }
    resetForm(); setSaving(false); fetchItems();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('status_reports').delete().eq('id', id);
    setViewingReport(null);
    fetchItems();
  }

  if (loading) {
    return <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />)}</div>;
  }

  // Report detail view
  if (viewingReport) {
    const r = viewingReport;
    return (
      <div>
        <button onClick={() => setViewingReport(null)} className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1">
          ← Back to reports
        </button>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{healthEmoji[r.overall_health]}</span>
                <h3 className="font-semibold text-lg">{reportTypeLabels[r.report_type]} Status Report</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(r.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(r.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(r)} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Edit</button>
              <button onClick={() => handleDelete(r.id)} className="px-3 py-1.5 text-sm rounded-md border border-destructive/50 text-destructive hover:bg-destructive/10">Delete</button>
            </div>
          </div>

          {[
            { title: 'Accomplished', data: r.accomplished, empty: 'Nothing logged' },
            { title: 'Planned Next', data: r.planned_next, empty: 'Nothing planned' },
            { title: 'Blockers', data: r.blockers, empty: 'No blockers' },
            { title: 'Risks', data: r.risks, empty: 'No risks identified' },
          ].map((section) => (
            <div key={section.title} className="mb-4">
              <h4 className="text-sm font-medium mb-1">{section.title}</h4>
              {section.data.length === 0 ? (
                <p className="text-xs text-muted-foreground">{section.empty}</p>
              ) : (
                <ul className="space-y-1">
                  {section.data.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-xs mt-1">•</span>
                      {(item as { text?: string }).text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{items.length} report{items.length !== 1 ? 's' : ''}</p>
        <button onClick={() => { resetForm(); const today = new Date(); const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7); setPeriodStart(weekAgo.toISOString().split('T')[0]); setPeriodEnd(today.toISOString().split('T')[0]); setShowForm(true); }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          + New Report
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Report Type</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {(Object.keys(reportTypeLabels) as ReportType[]).map((t) => <option key={t} value={t}>{reportTypeLabels[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Period Start *</label>
              <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Period End *</label>
              <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Overall Health</label>
              <select value={overallHealth} onChange={(e) => setOverallHealth(e.target.value as HealthStatus)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="green">🟢 Green</option>
                <option value="yellow">🟡 Yellow</option>
                <option value="red">🔴 Red</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Accomplished (one per line)</label>
              <textarea value={accomplished} onChange={(e) => setAccomplished(e.target.value)} placeholder="Completed data migration\nFinished UAT round 1" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Planned Next (one per line)</label>
              <textarea value={plannedNext} onChange={(e) => setPlannedNext(e.target.value)} placeholder="Begin user training\nSchedule go-live dry run" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Blockers (one per line)</label>
              <textarea value={blockers} onChange={(e) => setBlockers(e.target.value)} placeholder="Waiting on API credentials from client IT" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Risks (one per line)</label>
              <textarea value={risks} onChange={(e) => setRisks(e.target.value)} placeholder="Timeline at risk if training materials delayed" rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving || !periodStart || !periodEnd} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">📄</div>
          <p className="text-muted-foreground text-sm">No status reports yet. Create weekly updates to track accomplishments, blockers, and risks.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((r) => (
            <button key={r.id} onClick={() => setViewingReport(r)} className="w-full text-left rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{healthEmoji[r.overall_health]}</span>
                  <span className="font-medium text-sm">{reportTypeLabels[r.report_type]} Report</span>
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium', healthColors[r.overall_health])}>
                    {r.overall_health.charAt(0).toUpperCase() + r.overall_health.slice(1)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(r.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>{r.accomplished.length} accomplished</span>
                <span>{r.blockers.length} blocker{r.blockers.length !== 1 ? 's' : ''}</span>
                <span>{r.risks.length} risk{r.risks.length !== 1 ? 's' : ''}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
