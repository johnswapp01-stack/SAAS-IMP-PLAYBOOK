'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { DeliverySignal, SignalTrend } from '@/types';

interface DeliveryTrendsTabProps {
  engagementId: string;
}

const trendIcons: Record<SignalTrend, { icon: string; color: string }> = {
  improving: { icon: '↗', color: 'text-green-600' },
  stable: { icon: '→', color: 'text-blue-600' },
  declining: { icon: '↘', color: 'text-red-600' },
};

const categoryLabels: Record<string, { label: string; description: string; unit: string }> = {
  velocity: { label: 'Velocity', description: 'Scope items completed per week', unit: 'items/wk' },
  scope_drift: { label: 'Scope Drift', description: 'Net new scope items added vs. baseline', unit: 'items' },
  stakeholder_engagement: { label: 'Stakeholder Engagement', description: 'Response rate on decisions and sign-offs', unit: '%' },
  budget_burn: { label: 'Budget Burn Rate', description: 'Weekly spend as % of remaining budget', unit: '%/wk' },
  timeline_adherence: { label: 'Timeline Adherence', description: 'Milestones on track vs. at risk or missed', unit: '%' },
  resource_utilization: { label: 'Resource Utilization', description: 'Actual hours vs. allocated hours', unit: '%' },
};

const signalCategories = Object.keys(categoryLabels);

export function DeliveryTrendsTab({ engagementId }: DeliveryTrendsTabProps) {
  const [signals, setSignals] = useState<DeliverySignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [category, setCategory] = useState('velocity');
  const [currentValue, setCurrentValue] = useState('');
  const [expectedValue, setExpectedValue] = useState('');
  const [trend, setTrend] = useState<SignalTrend>('stable');
  const [saving, setSaving] = useState(false);

  const fetchSignals = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('delivery_signals')
      .select('*')
      .eq('engagement_id', engagementId)
      .order('measured_at', { ascending: false });
    setSignals((data || []) as unknown as DeliverySignal[]);
    setLoading(false);
  }, [engagementId]);

  useEffect(() => { fetchSignals(); }, [fetchSignals]);

  // Group signals by category, take latest per category
  const latestByCategory = new Map<string, DeliverySignal>();
  const historyByCategory = new Map<string, DeliverySignal[]>();

  for (const s of signals) {
    if (!latestByCategory.has(s.signal_category)) {
      latestByCategory.set(s.signal_category, s);
    }
    const hist = historyByCategory.get(s.signal_category) || [];
    hist.push(s);
    historyByCategory.set(s.signal_category, hist);
  }

  // Compute overall health from latest signals
  const latestSignals = Array.from(latestByCategory.values());
  const decliningCount = latestSignals.filter((s) => s.trend === 'declining').length;
  const improvingCount = latestSignals.filter((s) => s.trend === 'improving').length;
  const overallHealth = latestSignals.length === 0 ? 'No data' :
    decliningCount >= 2 ? 'At Risk' :
    decliningCount >= 1 ? 'Watch' :
    improvingCount >= 2 ? 'Strong' : 'Stable';

  const healthColor = overallHealth === 'At Risk' ? 'text-red-600' :
    overallHealth === 'Watch' ? 'text-yellow-600' :
    overallHealth === 'Strong' ? 'text-green-600' : 'text-blue-600';

  function resetForm() {
    setCategory('velocity'); setCurrentValue(''); setExpectedValue('');
    setTrend('stable'); setShowForm(false);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const cur = parseFloat(currentValue) || 0;
    const exp = parseFloat(expectedValue) || 0;
    const deviation = exp !== 0 ? cur - exp : 0;

    const { data: eng } = await supabase.from('engagements').select('org_id').eq('id', engagementId).single();

    const payload: any = {
      org_id: eng?.org_id,
      engagement_id: engagementId,
      signal_category: category,
      current_value: cur,
      expected_value: exp || null,
      deviation,
      trend,
      data_points: {},
    };

    await supabase.from('delivery_signals').insert(payload);
    resetForm(); setSaving(false); fetchSignals();
  }

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div>
      {/* Overall health summary */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Delivery Signal Trends</h3>
          <p className="text-xs text-muted-foreground">
            Overall: <span className={cn('font-medium', healthColor)}>{overallHealth}</span>
            {latestSignals.length > 0 && ` · ${latestSignals.length} signals tracked`}
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          + Record Signal
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Signal Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {signalCategories.map((c) => <option key={c} value={c}>{categoryLabels[c]?.label || c}</option>)}
              </select>
              <p className="text-xs text-muted-foreground mt-0.5">{categoryLabels[category]?.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Trend</label>
              <select value={trend} onChange={(e) => setTrend(e.target.value as SignalTrend)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="improving">Improving</option>
                <option value="stable">Stable</option>
                <option value="declining">Declining</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Current Value ({categoryLabels[category]?.unit})</label>
              <input type="number" step="0.01" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="e.g., 8.5" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected Value ({categoryLabels[category]?.unit})</label>
              <input type="number" step="0.01" value={expectedValue} onChange={(e) => setExpectedValue(e.target.value)} placeholder="e.g., 10" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : 'Record Signal'}
            </button>
          </div>
        </div>
      )}

      {latestSignals.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">{String.fromCodePoint(0x1F4C8)}</div>
          <h3 className="font-semibold mb-1">No delivery signals tracked yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Record delivery signals over time to spot trends early. Track velocity, scope drift, stakeholder engagement, budget burn, and more.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {signalCategories.map((cat) => {
            const latest = latestByCategory.get(cat);
            const history = historyByCategory.get(cat) || [];
            if (!latest) return null;

            const deviation = latest.deviation ?? 0;
            const deviationPct = latest.expected_value && latest.expected_value !== 0
              ? Math.round((deviation / latest.expected_value) * 100)
              : null;

            return (
              <div key={cat} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{categoryLabels[cat]?.label || cat}</span>
                  <span className={cn('text-lg font-bold', trendIcons[latest.trend].color)}>
                    {trendIcons[latest.trend].icon}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold">{latest.current_value ?? '—'}</span>
                  <span className="text-xs text-muted-foreground">{categoryLabels[cat]?.unit}</span>
                </div>
                {latest.expected_value !== null && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Expected: {latest.expected_value}</span>
                    {deviationPct !== null && (
                      <span className={cn('font-medium', deviation >= 0 ? 'text-green-600' : 'text-red-600')}>
                        {deviation >= 0 ? '+' : ''}{deviationPct}%
                      </span>
                    )}
                  </div>
                )}
                {/* Mini sparkline representation */}
                {history.length > 1 && (
                  <div className="flex items-end gap-0.5 mt-3 h-8">
                    {history.slice(0, 10).reverse().map((h, i) => {
                      const maxVal = Math.max(...history.slice(0, 10).map((s) => s.current_value || 0));
                      const pct = maxVal > 0 ? ((h.current_value || 0) / maxVal) * 100 : 50;
                      return (
                        <div
                          key={i}
                          className={cn('flex-1 rounded-sm min-w-[4px]', h.trend === 'declining' ? 'bg-red-300' : h.trend === 'improving' ? 'bg-green-300' : 'bg-blue-200')}
                          style={{ height: `${Math.max(pct, 10)}%` }}
                          title={`${h.current_value} on ${new Date(h.measured_at).toLocaleDateString()}`}
                        />
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {history.length} measurement{history.length !== 1 ? 's' : ''} · Last: {new Date(latest.measured_at).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
