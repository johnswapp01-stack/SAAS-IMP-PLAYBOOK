'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils';
import type { FinancialTracking, BillingModel } from '@/types';

const billingModelLabels: Record<BillingModel, string> = {
  fixed_fee: 'Fixed Fee',
  time_and_materials: 'Time & Materials',
  milestone: 'Milestone',
};

interface BudgetTabProps {
  engagementId: string;
}

export function BudgetTab({ engagementId }: BudgetTabProps) {
  const { org } = useOrg();
  const [budget, setBudget] = useState<FinancialTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [budgetTotal, setBudgetTotal] = useState('');
  const [budgetConsumed, setBudgetConsumed] = useState('');
  const [revenueRecognized, setRevenueRecognized] = useState('');
  const [marginTarget, setMarginTarget] = useState('');
  const [billingModel, setBillingModel] = useState<BillingModel>('fixed_fee');
  const [saving, setSaving] = useState(false);

  const fetchBudget = useCallback(async () => {
    if (!org) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('financial_tracking')
      .select('*')
      .eq('engagement_id', engagementId)
      .eq('org_id', org.id)
      .maybeSingle();
    setBudget((data as FinancialTracking) || null);
    setLoading(false);
  }, [engagementId, org]);

  useEffect(() => { fetchBudget(); }, [fetchBudget]);

  function openEdit() {
    if (budget) {
      setBudgetTotal(budget.budget_total?.toString() || '');
      setBudgetConsumed(budget.budget_consumed?.toString() || '0');
      setRevenueRecognized(budget.revenue_recognized?.toString() || '0');
      setMarginTarget(budget.margin_target?.toString() || '');
      setBillingModel(budget.billing_model);
    } else {
      setBudgetTotal(''); setBudgetConsumed('0'); setRevenueRecognized('0');
      setMarginTarget(''); setBillingModel('fixed_fee');
    }
    setEditing(true);
  }

  async function handleSave() {
    if (!org) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      org_id: org.id,
      engagement_id: engagementId,
      budget_total: budgetTotal ? parseFloat(budgetTotal) : null,
      budget_consumed: budgetConsumed ? parseFloat(budgetConsumed) : 0,
      revenue_recognized: revenueRecognized ? parseFloat(revenueRecognized) : 0,
      margin_target: marginTarget ? parseFloat(marginTarget) : null,
      billing_model: billingModel,
      currency: 'USD',
      last_calculated: new Date().toISOString(),
    };

    if (budget) {
      await supabase.from('financial_tracking').update(payload).eq('id', budget.id);
    } else {
      await supabase.from('financial_tracking').insert(payload);
    }
    setEditing(false); setSaving(false); fetchBudget();
  }

  if (loading) {
    return <div className="h-48 bg-muted/50 animate-pulse rounded-lg" />;
  }

  const consumedPct = budget?.budget_total && budget.budget_total > 0
    ? Math.round(((budget.budget_consumed || 0) / budget.budget_total) * 100) : 0;
  const isOverBudget = consumedPct > 100;
  const isWarning = consumedPct > 80 && consumedPct <= 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Financial Tracking</p>
        <button onClick={openEdit} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          {budget ? 'Edit Budget' : 'Set Up Budget'}
        </button>
      </div>

      {editing && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Budget Total ($)</label>
              <input type="number" step="0.01" value={budgetTotal} onChange={(e) => setBudgetTotal(e.target.value)} placeholder="0.00" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Budget Consumed ($)</label>
              <input type="number" step="0.01" value={budgetConsumed} onChange={(e) => setBudgetConsumed(e.target.value)} placeholder="0.00" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Revenue Recognized ($)</label>
              <input type="number" step="0.01" value={revenueRecognized} onChange={(e) => setRevenueRecognized(e.target.value)} placeholder="0.00" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Margin (%)</label>
              <input type="number" step="0.1" value={marginTarget} onChange={(e) => setMarginTarget(e.target.value)} placeholder="e.g., 30" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Billing Model</label>
              <select value={billingModel} onChange={(e) => setBillingModel(e.target.value as BillingModel)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {(Object.keys(billingModelLabels) as BillingModel[]).map((b) => <option key={b} value={b}>{billingModelLabels[b]}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {!budget ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">💰</div>
          <p className="text-muted-foreground text-sm">No budget configured yet. Set up financial tracking for this engagement.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Budget progress */}
          {budget.budget_total && budget.budget_total > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Budget Usage</span>
                <span className={cn('font-medium', isOverBudget ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-foreground')}>
                  ${(budget.budget_consumed || 0).toLocaleString()} / ${budget.budget_total.toLocaleString()} ({consumedPct}%)
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', isOverBudget ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-primary')}
                  style={{ width: `${Math.min(consumedPct, 100)}%` }}
                />
              </div>
              {isOverBudget && <p className="text-xs text-red-600 mt-1 font-medium">Over budget by ${((budget.budget_consumed || 0) - budget.budget_total).toLocaleString()}</p>}
            </div>
          )}

          {/* Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground mb-1">Budget Total</p>
              <p className="text-lg font-bold">${(budget.budget_total || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground mb-1">Consumed</p>
              <p className="text-lg font-bold">${(budget.budget_consumed || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground mb-1">Revenue</p>
              <p className="text-lg font-bold">${(budget.revenue_recognized || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground mb-1">Margin Target</p>
              <p className="text-lg font-bold">{budget.margin_target ? `${budget.margin_target}%` : '—'}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Billing: {billingModelLabels[budget.billing_model]}</span>
            <span>Currency: {budget.currency}</span>
            <span>Last updated: {new Date(budget.last_calculated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      )}
    </div>
  );
}
