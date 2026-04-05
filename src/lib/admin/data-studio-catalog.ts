/**
 * Authoritative definitions for the Data Studio UI (non-technical admins).
 * Table names must match Supabase public tables exposed in database.types.ts.
 */

export type DataStudioFilterMode = 'org_id' | 'current_org_row' | 'global_catalog';

export interface DataStudioTableDef {
  name: string;
  title: string;
  /** Short plain-language explanation (tooltips / inspector) */
  whatItStores: string;
  filterMode: DataStudioFilterMode;
  /** Optional default sort column when present on rows */
  orderColumn?: string;
  /** Table has engagement_id — UI can narrow to one engagement */
  hasEngagementId: boolean;
}

export const DATA_STUDIO_MAX_ROWS = 500;

export const DATA_STUDIO_TABLES: DataStudioTableDef[] = [
  {
    name: 'activity_log',
    title: 'Activity log',
    whatItStores:
      'A record of important actions in your workspace (who did what, on which engagement). Useful for audits and troubleshooting.',
    filterMode: 'org_id',
    orderColumn: 'created_at',
    hasEngagementId: true,
  },
  {
    name: 'agent_artifacts',
    title: 'AI agent artifacts',
    whatItStores:
      'Outputs from AI agent runs (draft documents, reports) tied to an engagement and execution.',
    filterMode: 'org_id',
    orderColumn: 'created_at',
    hasEngagementId: true,
  },
  {
    name: 'agent_definitions',
    title: 'AI agent definitions (catalog)',
    whatItStores:
      'System-wide catalog of agent types (documentation, testing, etc.). Read-only reference for what each agent is for.',
    filterMode: 'global_catalog',
    orderColumn: 'name',
    hasEngagementId: false,
  },
  {
    name: 'agent_executions',
    title: 'AI agent executions',
    whatItStores:
      'Each run of an agent task: tokens used, cost, model, output snapshot. Use to review AI usage and quality.',
    filterMode: 'org_id',
    orderColumn: 'created_at',
    hasEngagementId: false,
  },
  {
    name: 'agent_tasks',
    title: 'AI agent tasks',
    whatItStores:
      'Queued and completed AI jobs for your org. Links to engagements and counts toward monthly task limits.',
    filterMode: 'org_id',
    orderColumn: 'created_at',
    hasEngagementId: true,
  },
  {
    name: 'automation_rules',
    title: 'Automation rules',
    whatItStores:
      'Rules that trigger actions in your workspace (for example notifications or task creation).',
    filterMode: 'org_id',
    orderColumn: 'created_at',
    hasEngagementId: false,
  },
  {
    name: 'checklist_items',
    title: 'Checklist items',
    whatItStores:
      'Kickoff and go-live checklist lines with owners, due dates, and sign-off status.',
    filterMode: 'org_id',
    orderColumn: 'sort_order',
    hasEngagementId: true,
  },
  {
    name: 'client_updates',
    title: 'Client updates',
    whatItStores:
      'Draft or sent customer communications (weekly status, milestones, risk alerts).',
    filterMode: 'org_id',
    orderColumn: 'created_at',
    hasEngagementId: true,
  },
  {
    name: 'compliance_rules',
    title: 'Compliance rules',
    whatItStores:
      'Your configured compliance checks (what to warn or block on time, budget, or process).',
    filterMode: 'org_id',
    hasEngagementId: false,
  },
  {
    name: 'compliance_violations',
    title: 'Compliance violations',
    whatItStores:
      'Recorded violations when a rule fired—used for governance and remediation.',
    filterMode: 'org_id',
    orderColumn: 'created_at',
    hasEngagementId: true,
  },
  {
    name: 'decisions',
    title: 'Decisions',
    whatItStores:
      'Decision log for implementations: what was decided, impact, and status.',
    filterMode: 'org_id',
    orderColumn: 'date',
    hasEngagementId: true,
  },
  {
    name: 'delivery_signals',
    title: 'Delivery signals',
    whatItStores:
      'Measured delivery trends (velocity, burndown-style signals) per engagement.',
    filterMode: 'org_id',
    orderColumn: 'measured_at',
    hasEngagementId: true,
  },
  {
    name: 'engagements',
    title: 'Engagements',
    whatItStores:
      'One row per customer implementation project (name, status, health, dates). The core unit you work in.',
    filterMode: 'org_id',
    orderColumn: 'updated_at',
    hasEngagementId: false,
  },
  {
    name: 'error_patterns',
    title: 'Error patterns (system)',
    whatItStores:
      'Aggregated technical error signatures for self-healing. Usually technical—export only if support asked you to.',
    filterMode: 'global_catalog',
    orderColumn: 'last_occurrence',
    hasEngagementId: false,
  },
  {
    name: 'financial_tracking',
    title: 'Financial tracking',
    whatItStores:
      'Budget, burn, margin, and billing model per engagement.',
    filterMode: 'org_id',
    orderColumn: 'last_calculated',
    hasEngagementId: true,
  },
  {
    name: 'learning_feedback',
    title: 'Learning feedback',
    whatItStores:
      'Feedback on AI outputs (accepted, edited, rejected) used to improve future runs.',
    filterMode: 'org_id',
    orderColumn: 'created_at',
    hasEngagementId: false,
  },
  {
    name: 'lessons_learned',
    title: 'Lessons learned',
    whatItStores:
      'Retrospective findings and recommendations captured after milestones or project close.',
    filterMode: 'org_id',
    orderColumn: 'created_at',
    hasEngagementId: true,
  },
  {
    name: 'org_learning_context',
    title: 'Org learning context',
    whatItStores:
      'Traits the system learned about your org’s style and preferences (used to personalize AI).',
    filterMode: 'org_id',
    orderColumn: 'last_updated',
    hasEngagementId: false,
  },
  {
    name: 'org_members',
    title: 'Organization members',
    whatItStores:
      'Who belongs to this workspace, their role, and invite/accept status.',
    filterMode: 'org_id',
    orderColumn: 'invited_at',
    hasEngagementId: false,
  },
  {
    name: 'organizations',
    title: 'Organization (this workspace)',
    whatItStores:
      'Your workspace record: name, plan, trial dates, settings. Only the current organization is shown.',
    filterMode: 'current_org_row',
    orderColumn: 'created_at',
    hasEngagementId: false,
  },
  {
    name: 'outcome_correlations',
    title: 'Outcome correlations',
    whatItStores:
      'Links between actions taken and outcomes (used for analytics and improvement loops).',
    filterMode: 'org_id',
    orderColumn: 'created_at',
    hasEngagementId: true,
  },
  {
    name: 'project_plans',
    title: 'Project plans',
    whatItStores:
      'Structured plans with phases and milestones generated or edited for an engagement.',
    filterMode: 'org_id',
    orderColumn: 'created_at',
    hasEngagementId: true,
  },
  {
    name: 'raci_items',
    title: 'RACI items',
    whatItStores:
      'Who is Responsible, Accountable, Consulted, Informed for each deliverable.',
    filterMode: 'org_id',
    orderColumn: 'sort_order',
    hasEngagementId: true,
  },
  {
    name: 'resource_allocations',
    title: 'Resource allocations',
    whatItStores:
      'How team members are allocated in hours to engagements over time.',
    filterMode: 'org_id',
    orderColumn: 'start_date',
    hasEngagementId: true,
  },
  {
    name: 'resource_profiles',
    title: 'Resource profiles',
    whatItStores:
      'Skills, capacity, rates, and availability for people in your org.',
    filterMode: 'org_id',
    hasEngagementId: false,
  },
  {
    name: 'risk_signals',
    title: 'Risk signals',
    whatItStores:
      'Detected risks with severity, evidence, and recommended actions.',
    filterMode: 'org_id',
    orderColumn: 'detected_at',
    hasEngagementId: true,
  },
  {
    name: 'scope_items',
    title: 'Scope items',
    whatItStores:
      'Requirements tracked with MoSCoW priority (Must, Should, Could, Won’t) and status.',
    filterMode: 'org_id',
    orderColumn: 'sort_order',
    hasEngagementId: true,
  },
  {
    name: 'self_healing_events',
    title: 'Self-healing events',
    whatItStores:
      'Automatic recovery attempts when something failed (retries, circuit breaks, escalations).',
    filterMode: 'org_id',
    orderColumn: 'created_at',
    hasEngagementId: false,
  },
  {
    name: 'stakeholders',
    title: 'Stakeholders',
    whatItStores:
      'People and roles on the customer side: influence, concerns, communication preferences.',
    filterMode: 'org_id',
    hasEngagementId: true,
  },
  {
    name: 'status_reports',
    title: 'Status reports',
    whatItStores:
      'Formal period reports with accomplishments, next steps, blockers, and risks.',
    filterMode: 'org_id',
    orderColumn: 'created_at',
    hasEngagementId: true,
  },
  {
    name: 'system_health_checks',
    title: 'System health checks',
    whatItStores:
      'Platform-level health probes (API, database, queues). Technical operations reference.',
    filterMode: 'global_catalog',
    orderColumn: 'checked_at',
    hasEngagementId: false,
  },
  {
    name: 'time_entries',
    title: 'Time entries',
    whatItStores:
      'Hours logged to engagements (billable flag, category, approvals).',
    filterMode: 'org_id',
    orderColumn: 'date',
    hasEngagementId: true,
  },
];

const BY_NAME = new Map(DATA_STUDIO_TABLES.map((t) => [t.name, t]));

export function getStudioTableDef(name: string): DataStudioTableDef | undefined {
  return BY_NAME.get(name);
}

export function searchStudioTables(query: string): DataStudioTableDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...DATA_STUDIO_TABLES];
  return DATA_STUDIO_TABLES.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.whatItStores.toLowerCase().includes(q)
  );
}
