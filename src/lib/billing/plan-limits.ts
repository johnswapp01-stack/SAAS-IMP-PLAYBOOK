import type { OrgPlan } from '@/types';

/**
 * Monthly caps on successfully completed agent tasks per org, from product pricing (CLAUDE.md).
 * `enterprise` is treated as unlimited in enforcement code.
 */
export const PLAN_AGENT_TASK_MONTHLY_LIMIT: Record<OrgPlan, number> = {
  free: 0,
  pro: 50,
  team: 500,
  enterprise: Number.POSITIVE_INFINITY,
};

export function parseOrgPlan(plan: string | null | undefined): OrgPlan {
  if (plan === 'pro' || plan === 'team' || plan === 'enterprise') return plan;
  return 'free';
}

/** Returns Infinity for enterprise; callers should use Number.isFinite(limit) before comparing counts. */
export function getMonthlyAgentTaskLimit(plan: string | null | undefined): number {
  const p = parseOrgPlan(plan);
  return PLAN_AGENT_TASK_MONTHLY_LIMIT[p];
}
