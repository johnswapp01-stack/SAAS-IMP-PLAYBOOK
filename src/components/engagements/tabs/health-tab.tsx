'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface HealthTabProps {
  engagementId: string;
}

interface HealthFactor {
  name: string;
  score: number; // 0-100
  status: 'green' | 'yellow' | 'red';
  reason: string;
  recommendation: string;
  weight: number;
}

const statusEmoji: Record<string, string> = { green: '🟢', yellow: '🟡', red: '🔴' };

export function HealthTab({ engagementId }: HealthTabProps) {
  const [factors, setFactors] = useState<HealthFactor[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [overallHealth, setOverallHealth] = useState<'green' | 'yellow' | 'red'>('green');
  const [loading, setLoading] = useState(true);

  const computeHealth = useCallback(async () => {
    const supabase = createClient();
    const healthFactors: HealthFactor[] = [];

    // 1. Scope completion
    const { data: scopeItems } = await supabase
      .from('scope_items').select('status, priority')
      .eq('engagement_id', engagementId);
    if (scopeItems && scopeItems.length > 0) {
      const total = scopeItems.length;
      const approved = scopeItems.filter((s: any) => s.status === 'approved').length;
      const pct = Math.round((approved / total) * 100);
      const mustHaves = scopeItems.filter((s: any) => s.priority === 'must');
      const mustApproved = mustHaves.filter((s: any) => s.status === 'approved').length;
      const mustPct = mustHaves.length > 0 ? Math.round((mustApproved / mustHaves.length) * 100) : 100;

      healthFactors.push({
        name: 'Scope Progress',
        score: pct,
        status: pct >= 70 ? 'green' : pct >= 40 ? 'yellow' : 'red',
        reason: `${approved}/${total} items approved (${pct}%). Must-haves: ${mustApproved}/${mustHaves.length} (${mustPct}%).`,
        recommendation: pct < 40 ? 'Prioritize scope approval — too many items are still pending.' : pct < 70 ? 'Good progress. Focus on getting Must-have items approved.' : 'Scope is on track.',
        weight: 20,
      });
    }

    // 2. Risk signals
    const { data: risks } = await supabase
      .from('risk_signals').select('severity, status')
      .eq('engagement_id', engagementId);
    if (risks) {
      const openRisks = risks.filter((r: any) => ['detected', 'acknowledged', 'escalated'].includes(r.status));
      const criticalOpen = openRisks.filter((r: any) => r.severity === 'critical').length;
      const highOpen = openRisks.filter((r: any) => r.severity === 'high').length;
      const riskScore = criticalOpen > 0 ? 20 : highOpen > 0 ? 50 : openRisks.length > 3 ? 60 : openRisks.length > 0 ? 80 : 100;

      healthFactors.push({
        name: 'Risk Exposure',
        score: riskScore,
        status: riskScore >= 70 ? 'green' : riskScore >= 40 ? 'yellow' : 'red',
        reason: `${openRisks.length} open risk${openRisks.length !== 1 ? 's' : ''} (${criticalOpen} critical, ${highOpen} high).`,
        recommendation: criticalOpen > 0 ? 'Critical risks need immediate attention. Escalate and assign owners.' : highOpen > 0 ? 'Address high-severity risks before they escalate.' : openRisks.length > 0 ? 'Monitor open risks. None are critical yet.' : 'No open risks. Keep monitoring.',
        weight: 25,
      });
    }

    // 3. Budget health
    const { data: financial } = await supabase
      .from('financial_tracking').select('budget_total, budget_consumed')
      .eq('engagement_id', engagementId)
      .maybeSingle();
    if (financial && financial.budget_total && financial.budget_total > 0) {
      const burnPct = Math.round(((financial.budget_consumed || 0) / financial.budget_total) * 100);
      const budgetScore = burnPct > 100 ? 10 : burnPct > 85 ? 40 : burnPct > 70 ? 70 : 100;

      healthFactors.push({
        name: 'Budget',
        score: budgetScore,
        status: budgetScore >= 70 ? 'green' : budgetScore >= 40 ? 'yellow' : 'red',
        reason: `${burnPct}% of budget consumed ($${(financial.budget_consumed || 0).toLocaleString()} of $${financial.budget_total.toLocaleString()}).`,
        recommendation: burnPct > 100 ? 'Over budget. Initiate scope change or request additional funding immediately.' : burnPct > 85 ? 'Approaching budget limit. Review remaining deliverables against budget.' : 'Budget is within acceptable range.',
        weight: 20,
      });
    }

    // 4. Stakeholder engagement (decisions pending)
    const { data: decisions } = await supabase
      .from('decisions').select('status')
      .eq('engagement_id', engagementId);
    if (decisions && decisions.length > 0) {
      const active = decisions.filter((d: any) => d.status === 'active').length;
      const total = decisions.length;
      const decisionRate = Math.round((active / total) * 100);
      // More active (not superseded/reversed) decisions = healthy
      const score = decisionRate >= 80 ? 90 : decisionRate >= 60 ? 70 : 50;

      healthFactors.push({
        name: 'Decision Velocity',
        score,
        status: score >= 70 ? 'green' : score >= 50 ? 'yellow' : 'red',
        reason: `${active}/${total} decisions are active. ${total - active} have been superseded or reversed.`,
        recommendation: score < 70 ? 'Too many reversed decisions suggest unclear requirements. Consider a re-alignment session.' : 'Decision-making is healthy.',
        weight: 15,
      });
    }

    // 5. Checklist progress
    const { data: checklistItems } = await supabase
      .from('checklist_items').select('status, checklist_type')
      .eq('engagement_id', engagementId);
    if (checklistItems && checklistItems.length > 0) {
      const complete = checklistItems.filter((c: any) => c.status === 'complete').length;
      const total = checklistItems.length;
      const blocked = checklistItems.filter((c: any) => c.status === 'blocked').length;
      const pct = Math.round((complete / total) * 100);
      const score = blocked > 2 ? 30 : pct >= 70 ? 90 : pct >= 40 ? 65 : 40;

      healthFactors.push({
        name: 'Checklist Readiness',
        score,
        status: score >= 70 ? 'green' : score >= 40 ? 'yellow' : 'red',
        reason: `${complete}/${total} checklist items complete (${pct}%). ${blocked} blocked.`,
        recommendation: blocked > 0 ? `${blocked} item${blocked !== 1 ? 's are' : ' is'} blocked. Resolve blockers to keep momentum.` : pct < 40 ? 'Checklist is behind. Assign owners and set deadlines.' : 'Checklist progress is on track.',
        weight: 20,
      });
    }

    // Calculate overall
    if (healthFactors.length > 0) {
      const totalWeight = healthFactors.reduce((sum, f) => sum + f.weight, 0);
      const weighted = healthFactors.reduce((sum, f) => sum + (f.score * f.weight), 0);
      const overall = Math.round(weighted / totalWeight);
      setOverallScore(overall);
      setOverallHealth(overall >= 70 ? 'green' : overall >= 40 ? 'yellow' : 'red');
    } else {
      setOverallScore(0);
      setOverallHealth('green');
    }

    setFactors(healthFactors);
    setLoading(false);
  }, [engagementId]);

  useEffect(() => { computeHealth(); }, [computeHealth]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-32 bg-muted/50 animate-pulse rounded-lg" />
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-lg" />)}
      </div>
    );
  }

  return (
    <div>
      {/* Overall score */}
      <div className={cn('rounded-lg border p-6 mb-6 text-center', overallHealth === 'green' ? 'border-green-200 bg-green-50/50 dark:bg-green-950/10' : overallHealth === 'yellow' ? 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/10' : 'border-red-200 bg-red-50/50 dark:bg-red-950/10')}>
        <div className="text-4xl mb-2">{statusEmoji[overallHealth]}</div>
        <div className="text-3xl font-bold mb-1">{factors.length > 0 ? overallScore : '—'}</div>
        <p className="text-sm text-muted-foreground">
          {factors.length > 0
            ? `Health Score · ${factors.length} factor${factors.length !== 1 ? 's' : ''} analyzed`
            : 'Not enough data to compute health. Add scope, risks, or budget data.'}
        </p>
        {factors.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {overallHealth === 'red' ? 'This engagement needs attention. Review the factors below.' :
             overallHealth === 'yellow' ? 'Some areas need monitoring. Check yellow and red factors.' :
             'This engagement is on track. Keep it up.'}
          </p>
        )}
      </div>

      {/* Factor breakdown */}
      {factors.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm mb-2">Health Factors</h3>
          {factors.sort((a, b) => a.score - b.score).map((f) => (
            <div key={f.name} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{statusEmoji[f.status]}</span>
                  <span className="font-medium text-sm">{f.name}</span>
                  <span className="text-xs text-muted-foreground">Weight: {f.weight}%</span>
                </div>
                <span className={cn('text-lg font-bold', f.status === 'green' ? 'text-green-600' : f.status === 'yellow' ? 'text-yellow-600' : 'text-red-600')}>
                  {f.score}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full mb-2 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', f.score >= 70 ? 'bg-green-500' : f.score >= 40 ? 'bg-yellow-500' : 'bg-red-500')}
                  style={{ width: `${f.score}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{f.reason}</p>
              <p className="text-sm">
                <span className="font-medium">Recommendation:</span> {f.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
