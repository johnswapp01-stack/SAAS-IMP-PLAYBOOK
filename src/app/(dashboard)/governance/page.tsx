'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { ComplianceViolation, ViolationStatus } from '@/types';

const violationStatusColors: Record<ViolationStatus, string> = {
  open: 'bg-red-100 text-red-700',
  acknowledged: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  waived: 'bg-gray-100 text-gray-600',
};

interface EngagementSummary {
  id: string;
  name: string;
  customer_name: string | null;
  health: string;
  status: string;
  budget_total: number | null;
  budget_consumed: number | null;
  total_hours: number;
  active_resources: number;
}

export default function GovernancePage() {
  const { org, loading: orgLoading } = useOrg();
  const [engagements, setEngagements] = useState<EngagementSummary[]>([]);
  const [violations, setViolations] = useState<(ComplianceViolation & { rule_name?: string; engagement_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!org) return;
    const supabase = createClient();

    // Fetch engagements with financial data
    const { data: engs } = await supabase
      .from('engagements')
      .select('id, name, customer_name, health, status')
      .eq('org_id', org.id)
      .neq('status', 'complete')
      .order('updated_at', { ascending: false });

    const summaries: EngagementSummary[] = [];
    for (const eng of engs || []) {
      // Get budget
      const { data: fin } = await supabase
        .from('financial_tracking')
        .select('budget_total, budget_consumed')
        .eq('engagement_id', eng.id)
        .eq('org_id', org.id)
        .maybeSingle();

      // Get total hours
      const { data: timeData } = await supabase
        .from('time_entries')
        .select('hours')
        .eq('engagement_id', eng.id)
        .eq('org_id', org.id);
      const totalHours = (timeData || []).reduce((sum: number, t: { hours: number }) => sum + t.hours, 0);

      // Get active resources count
      const { count } = await supabase
        .from('resource_allocations')
        .select('id', { count: 'exact', head: true })
        .eq('engagement_id', eng.id)
        .eq('org_id', org.id)
        .eq('status', 'active');

      summaries.push({
        ...eng,
        budget_total: fin?.budget_total || null,
        budget_consumed: fin?.budget_consumed || null,
        total_hours: totalHours,
        active_resources: count || 0,
      });
    }
    setEngagements(summaries);

    // Fetch open violations
    const { data: viols } = await supabase
      .from('compliance_violations')
      .select('*, compliance_rules(rule_name), engagements(name)')
      .eq('org_id', org.id)
      .in('status', ['open', 'acknowledged'])
      .order('created_at', { ascending: false })
      .limit(20);

    const mapped = (viols || []).map((v: Record<string, unknown>) => ({
      ...(v as unknown as ComplianceViolation),
      rule_name: (v.compliance_rules as { rule_name?: string } | null)?.rule_name,
      engagement_name: (v.engagements as { name?: string } | null)?.name,
    }));
    setViolations(mapped);
    setLoading(false);
  }, [org]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (orgLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-4 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-lg" />)}</div>
        <div className="h-48 bg-muted/50 animate-pulse rounded-lg" />
      </div>
    );
  }

  const healthCounts = { green: 0, yellow: 0, red: 0 };
  const overBudget: EngagementSummary[] = [];
  let totalHoursAll = 0;

  for (const eng of engagements) {
    if (eng.health in healthCounts) healthCounts[eng.health as keyof typeof healthCounts]++;
    totalHoursAll += eng.total_hours;
    if (eng.budget_total && eng.budget_consumed && eng.budget_consumed > eng.budget_total) {
      overBudget.push(eng);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Operations</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Cross-engagement view of time, cost, resources, and compliance.
      </p>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-3xl font-bold">{engagements.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active Engagements</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">🟢 {healthCounts.green}</span>
            <span className="text-sm">🟡 {healthCounts.yellow}</span>
            <span className="text-sm">🔴 {healthCounts.red}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Health Breakdown</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-3xl font-bold">{totalHoursAll.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Hours Logged</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <p className={cn('text-3xl font-bold', violations.length > 0 ? 'text-red-600' : 'text-green-600')}>{violations.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Open Violations</p>
        </div>
      </div>

      {/* Budget alerts */}
      {overBudget.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 p-4 mb-6">
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Budget Alerts</h3>
          {overBudget.map((eng) => (
            <div key={eng.id} className="flex items-center justify-between text-sm py-1">
              <Link href={`/engagements/${eng.id}`} className="text-red-700 dark:text-red-400 hover:underline font-medium">{eng.name}</Link>
              <span className="text-red-600 text-xs">
                ${(eng.budget_consumed || 0).toLocaleString()} / ${(eng.budget_total || 0).toLocaleString()} ({Math.round(((eng.budget_consumed || 0) / (eng.budget_total || 1)) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Compliance violations */}
      {violations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">Compliance Violations</h3>
          <div className="space-y-2">
            {violations.map((v) => (
              <div key={v.id} className="rounded-lg border border-border bg-card p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{v.rule_name || 'Unknown Rule'}</p>
                  <p className="text-xs text-muted-foreground">{v.engagement_name || 'Org-level'} · {new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <span className={cn('px-2 py-0.5 rounded text-xs font-medium', violationStatusColors[v.status])}>
                  {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement operations table */}
      <h3 className="text-sm font-semibold mb-3">Engagement Overview</h3>
      {engagements.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">No active engagements. Create one to start tracking operations.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Engagement</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Health</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Budget</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Resources</th>
                </tr>
              </thead>
              <tbody>
                {engagements.map((eng) => {
                  const budgetPct = eng.budget_total && eng.budget_total > 0
                    ? Math.round(((eng.budget_consumed || 0) / eng.budget_total) * 100) : null;
                  return (
                    <tr key={eng.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <Link href={`/engagements/${eng.id}`} className="font-medium hover:text-primary transition-colors">{eng.name}</Link>
                        <p className="text-xs text-muted-foreground">{eng.customer_name}</p>
                      </td>
                      <td className="py-3 px-4">
                        {eng.health === 'green' ? '🟢' : eng.health === 'yellow' ? '🟡' : '🔴'}
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">{eng.total_hours.toFixed(1)}h</td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {budgetPct !== null ? (
                          <span className={cn('text-xs font-medium', budgetPct > 100 ? 'text-red-600' : budgetPct > 80 ? 'text-yellow-600' : '')}>
                            {budgetPct}% used
                          </span>
                        ) : <span className="text-xs text-muted-foreground">No budget</span>}
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">{eng.active_resources} active</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Governance placeholder */}
      <div className="rounded-lg border border-border border-dashed p-8 text-center mt-6">
        <div className="text-3xl mb-2">🔍</div>
        <h3 className="font-semibold mb-1">AI Risk Detection</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          AI-powered risk detection and delivery signal monitoring coming in Phase 4.
        </p>
      </div>
    </div>
  );
}
