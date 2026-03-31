-- ============================================================
-- Implementation Pro — Database Migration
-- Version: 1.0.0
-- All tables for Foundation + Layer 1 + Layer 2 + Layer 3
-- + Self-Learning + Self-Healing
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
-- pgvector for self-learning semantic search (enable when needed)
-- create extension if not exists "vector";

-- ============================================================
-- CUSTOM TYPES
-- ============================================================

create type engagement_status as enum (
  'kickoff', 'in_progress', 'uat', 'go_live', 'complete', 'on_hold'
);

create type health_status as enum ('green', 'yellow', 'red');

create type moscow_priority as enum ('must', 'should', 'could', 'wont');

create type scope_status as enum ('approved', 'pending', 'rejected', 'deferred');

create type influence_level as enum ('high', 'medium', 'low');

create type impact_level as enum ('high', 'medium', 'low');

create type communication_pref as enum ('email', 'slack', 'call', 'in_person');

create type checklist_type as enum ('kickoff', 'go_live');

create type task_status as enum ('not_started', 'in_progress', 'complete', 'blocked', 'na');

create type sign_off_status as enum ('pending', 'approved', 'na');

create type decision_status as enum ('active', 'superseded', 'reversed');

create type lesson_category as enum ('process', 'communication', 'technical', 'scope', 'timeline');

create type report_type as enum ('internal', 'customer', 'executive');

create type org_plan as enum ('free', 'pro', 'team', 'enterprise');

create type org_role as enum ('owner', 'admin', 'member', 'viewer');

create type agent_execution_mode as enum ('auto_execute', 'propose_and_wait', 'assist');

create type agent_type as enum ('documentation', 'testing', 'migration', 'configuration', 'communication', 'analysis');

create type agent_task_status as enum ('queued', 'running', 'completed', 'failed', 'cancelled', 'awaiting_approval');

create type agent_task_priority as enum ('low', 'normal', 'high', 'urgent');

create type feedback_type as enum ('accepted', 'modified', 'rejected');

create type artifact_type as enum ('document', 'test_report', 'migration_log', 'config_file', 'status_report', 'project_plan');

create type artifact_format as enum ('markdown', 'pdf', 'json', 'xlsx', 'docx');

create type artifact_status as enum ('draft', 'approved', 'delivered', 'archived');

create type compliance_action as enum ('warn', 'block', 'notify', 'auto_correct');

create type compliance_severity as enum ('info', 'warning', 'critical');

create type violation_status as enum ('open', 'acknowledged', 'resolved', 'waived');

create type risk_severity as enum ('low', 'medium', 'high', 'critical');

create type risk_signal_status as enum ('detected', 'acknowledged', 'mitigated', 'escalated', 'false_positive');

create type risk_outcome as enum ('risk_materialized', 'risk_avoided', 'false_alarm');

create type client_update_type as enum ('weekly_status', 'milestone_reached', 'risk_alert', 'go_live_countdown');

create type client_update_status as enum ('draft', 'approved', 'sent', 'failed');

create type signal_trend as enum ('improving', 'stable', 'declining');

create type billing_model as enum ('fixed_fee', 'time_and_materials', 'milestone');

create type time_category as enum ('delivery', 'admin', 'internal', 'training');

create type allocation_status as enum ('active', 'planned', 'completed');

create type health_check_type as enum ('api_availability', 'db_performance', 'agent_success_rate', 'queue_depth', 'error_rate');

create type system_health_status as enum ('healthy', 'degraded', 'critical');

create type healing_event_type as enum ('auto_retry', 'circuit_break', 'fallback_activated', 'graceful_degradation', 'auto_rollback', 'anomaly_detected');

create type healing_result as enum ('resolved', 'escalated', 'failed');

create type learning_context_type as enum ('writing_style', 'risk_patterns', 'common_issues', 'client_preferences', 'process_norms');

create type outcome_result as enum ('positive', 'neutral', 'negative');

-- ============================================================
-- FOUNDATION TABLES
-- ============================================================

-- User profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Organizations
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  plan org_plan default 'free' not null,
  trial_ends_at timestamptz,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- Organization members
create table public.org_members (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role org_role default 'member' not null,
  invited_at timestamptz default now() not null,
  accepted_at timestamptz,
  unique(org_id, user_id)
);

-- Engagements
create table public.engagements (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  customer_name text,
  status engagement_status default 'kickoff' not null,
  health health_status default 'green' not null,
  health_score integer, -- 0-100 composite score from Layer 2
  owner_id uuid references public.org_members(id) on delete set null,
  start_date date,
  target_go_live date,
  actual_go_live date,
  description text,
  tags text[] default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Scope items (MoSCoW)
create table public.scope_items (
  id uuid primary key default uuid_generate_v4(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  requirement text not null,
  priority moscow_priority default 'should' not null,
  status scope_status default 'pending' not null,
  requested_by text,
  date_added date default current_date,
  date_resolved date,
  notes text,
  sort_order integer default 0
);

-- Stakeholders
create table public.stakeholders (
  id uuid primary key default uuid_generate_v4(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  role text,
  organization text,
  influence influence_level default 'medium' not null,
  communication_pref communication_pref default 'email' not null,
  key_concerns text,
  last_contact date,
  email text
);

-- Decisions
create table public.decisions (
  id uuid primary key default uuid_generate_v4(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  decision text not null,
  context text,
  made_by text,
  date date default current_date,
  impact impact_level default 'medium' not null,
  reversible boolean default true,
  status decision_status default 'active' not null
);

-- RACI items
create table public.raci_items (
  id uuid primary key default uuid_generate_v4(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  deliverable text not null,
  responsible text,
  accountable text,
  consulted text,
  informed text,
  sort_order integer default 0
);

-- Checklist items (kickoff + go-live unified)
create table public.checklist_items (
  id uuid primary key default uuid_generate_v4(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  checklist_type checklist_type not null,
  task text not null,
  phase text,
  owner text,
  status task_status default 'not_started' not null,
  due_date date,
  sign_off sign_off_status default 'na' not null,
  notes text,
  sort_order integer default 0
);

-- Lessons learned
create table public.lessons_learned (
  id uuid primary key default uuid_generate_v4(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  finding text not null,
  category lesson_category default 'process' not null,
  impact impact_level default 'medium' not null,
  recommendation text,
  owner text,
  created_at timestamptz default now() not null
);

-- Status reports
create table public.status_reports (
  id uuid primary key default uuid_generate_v4(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  report_type report_type default 'internal' not null,
  period_start date not null,
  period_end date not null,
  overall_health health_status default 'green' not null,
  accomplished jsonb default '[]'::jsonb,
  planned_next jsonb default '[]'::jsonb,
  blockers jsonb default '[]'::jsonb,
  risks jsonb default '[]'::jsonb,
  generated_by uuid references public.org_members(id),
  pdf_url text,
  created_at timestamptz default now() not null
);

-- Activity log
create table public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid references public.engagements(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- Automation rules
create table public.automation_rules (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  trigger_type text not null,
  trigger_config jsonb default '{}'::jsonb,
  action_type text not null,
  action_config jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now() not null
);

-- ============================================================
-- LAYER 1: OPERATIONS AUTOMATION
-- ============================================================

create table public.resource_profiles (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  member_id uuid not null references public.org_members(id) on delete cascade,
  skills text[] default '{}',
  max_concurrent_engagements integer default 5,
  available_hours_per_week integer default 40,
  hourly_cost decimal(10,2),
  billable_rate decimal(10,2),
  timezone text default 'America/Denver',
  unique(org_id, member_id)
);

create table public.resource_allocations (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  member_id uuid not null references public.org_members(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  role text default 'contributor',
  allocated_hours_per_week integer default 0,
  start_date date,
  end_date date,
  status allocation_status default 'active' not null
);

create table public.time_entries (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  member_id uuid not null references public.org_members(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  date date not null default current_date,
  hours decimal(4,2) not null,
  billable boolean default true,
  category time_category default 'delivery' not null,
  description text,
  agent_generated boolean default false,
  approved boolean default false
);

create table public.financial_tracking (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  budget_total decimal(12,2),
  budget_consumed decimal(12,2) default 0,
  revenue_recognized decimal(12,2) default 0,
  margin_target decimal(5,2),
  margin_actual decimal(5,2),
  billing_model billing_model default 'fixed_fee' not null,
  currency text default 'USD',
  last_calculated timestamptz default now(),
  unique(org_id, engagement_id)
);

create table public.compliance_rules (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  rule_name text not null,
  rule_type text not null,
  condition jsonb not null,
  action compliance_action default 'warn' not null,
  severity compliance_severity default 'warning' not null,
  is_active boolean default true,
  created_by uuid references public.org_members(id)
);

create table public.compliance_violations (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  rule_id uuid not null references public.compliance_rules(id) on delete cascade,
  engagement_id uuid references public.engagements(id) on delete set null,
  member_id uuid references public.org_members(id) on delete set null,
  violation_detail jsonb not null,
  status violation_status default 'open' not null,
  resolved_by uuid references public.org_members(id),
  resolved_at timestamptz,
  created_at timestamptz default now() not null
);

-- ============================================================
-- LAYER 2: DELIVERY GOVERNANCE
-- ============================================================

create table public.project_plans (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  version integer default 1,
  generated_by text default 'manual', -- ai_agent, manual, template
  milestones jsonb default '[]'::jsonb,
  phases jsonb default '[]'::jsonb,
  assumptions text[] default '{}',
  constraints text[] default '{}',
  source_document text,
  status text default 'draft', -- draft, active, superseded
  approved_by uuid references public.org_members(id),
  approved_at timestamptz,
  created_at timestamptz default now() not null
);

create table public.risk_signals (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  signal_type text not null, -- timeline, scope, budget, stakeholder, technical, resource
  severity risk_severity default 'medium' not null,
  confidence decimal(3,2) default 0.50,
  description text not null,
  evidence jsonb default '{}'::jsonb,
  recommended_action text,
  status risk_signal_status default 'detected' not null,
  detected_at timestamptz default now() not null,
  acknowledged_by uuid references public.org_members(id),
  resolution_notes text,
  outcome risk_outcome
);

create table public.client_updates (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  update_type client_update_type not null,
  generated_by text default 'manual', -- ai_agent, manual
  content text not null,
  recipients jsonb default '[]'::jsonb,
  status client_update_status default 'draft' not null,
  approved_by uuid references public.org_members(id),
  sent_at timestamptz,
  opened_by jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null
);

create table public.delivery_signals (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  signal_category text not null, -- velocity, scope_drift, stakeholder_engagement, etc.
  current_value decimal(10,2),
  expected_value decimal(10,2),
  deviation decimal(10,2),
  trend signal_trend default 'stable' not null,
  measured_at timestamptz default now() not null,
  data_points jsonb default '{}'::jsonb
);

-- ============================================================
-- LAYER 3: WORK EXECUTION (AI AGENTS)
-- ============================================================

create table public.agent_definitions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  agent_type agent_type not null,
  description text,
  execution_mode agent_execution_mode default 'propose_and_wait' not null,
  system_prompt text not null,
  input_schema jsonb default '{}'::jsonb,
  output_schema jsonb default '{}'::jsonb,
  is_system boolean default true,
  is_active boolean default true,
  version integer default 1
);

create table public.agent_tasks (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  agent_id uuid not null references public.agent_definitions(id),
  triggered_by text default 'manual', -- schedule, event, manual, automation_rule
  trigger_context jsonb default '{}'::jsonb,
  input_data jsonb default '{}'::jsonb,
  status agent_task_status default 'queued' not null,
  priority agent_task_priority default 'normal' not null,
  scheduled_for timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now() not null
);

create table public.agent_executions (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid not null references public.agent_tasks(id) on delete cascade,
  agent_id uuid not null references public.agent_definitions(id),
  execution_step integer default 1,
  step_description text,
  input_tokens integer default 0,
  output_tokens integer default 0,
  model_used text default 'claude-sonnet-4-20250514',
  output_content text,
  output_artifacts jsonb default '{}'::jsonb,
  duration_ms integer default 0,
  cost_cents integer default 0,
  status text default 'success', -- success, failed, retried
  error_message text,
  created_at timestamptz default now() not null
);

create table public.agent_artifacts (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  execution_id uuid not null references public.agent_executions(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  artifact_type artifact_type not null,
  name text not null,
  content text,
  storage_path text,
  format artifact_format default 'markdown' not null,
  status artifact_status default 'draft' not null,
  approved_by uuid references public.org_members(id),
  version integer default 1,
  created_at timestamptz default now() not null
);

-- ============================================================
-- SELF-LEARNING
-- ============================================================

create table public.learning_feedback (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  execution_id uuid not null references public.agent_executions(id) on delete cascade,
  agent_id uuid not null references public.agent_definitions(id),
  feedback_type feedback_type not null,
  original_output text,
  modified_output text,
  feedback_notes text,
  feedback_by uuid not null references public.org_members(id),
  created_at timestamptz default now() not null
);

create table public.org_learning_context (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  context_type learning_context_type not null,
  context_key text not null,
  context_value text not null,
  confidence decimal(3,2) default 0.50,
  source_count integer default 1,
  last_updated timestamptz default now() not null,
  unique(org_id, context_type, context_key)
);

create table public.outcome_correlations (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  signal_type text not null,
  action_taken text,
  outcome outcome_result not null,
  engagement_id uuid references public.engagements(id) on delete set null,
  correlation_data jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- ============================================================
-- SELF-HEALING
-- ============================================================

create table public.system_health_checks (
  id uuid primary key default uuid_generate_v4(),
  check_type health_check_type not null,
  status system_health_status default 'healthy' not null,
  measured_value decimal(10,2),
  threshold_warn decimal(10,2),
  threshold_critical decimal(10,2),
  metadata jsonb default '{}'::jsonb,
  checked_at timestamptz default now() not null
);

create table public.self_healing_events (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references public.organizations(id) on delete set null,
  event_type healing_event_type not null,
  trigger_error text not null,
  healing_action text not null,
  result healing_result not null,
  related_task_id uuid references public.agent_tasks(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

create table public.error_patterns (
  id uuid primary key default uuid_generate_v4(),
  error_signature text unique not null,
  error_type text not null,
  occurrence_count integer default 1,
  last_occurrence timestamptz default now(),
  auto_resolution text,
  resolution_success_rate decimal(3,2) default 0,
  requires_human boolean default false
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Foundation
create index idx_org_members_org on public.org_members(org_id);
create index idx_org_members_user on public.org_members(user_id);
create index idx_engagements_org on public.engagements(org_id);
create index idx_engagements_status on public.engagements(org_id, status);
create index idx_engagements_health on public.engagements(org_id, health);
create index idx_scope_items_engagement on public.scope_items(engagement_id);
create index idx_scope_items_org on public.scope_items(org_id);
create index idx_stakeholders_engagement on public.stakeholders(engagement_id);
create index idx_decisions_engagement on public.decisions(engagement_id);
create index idx_raci_engagement on public.raci_items(engagement_id);
create index idx_checklist_engagement on public.checklist_items(engagement_id);
create index idx_checklist_type on public.checklist_items(engagement_id, checklist_type);
create index idx_lessons_engagement on public.lessons_learned(engagement_id);
create index idx_lessons_org on public.lessons_learned(org_id);
create index idx_status_reports_engagement on public.status_reports(engagement_id);
create index idx_activity_log_org on public.activity_log(org_id);
create index idx_activity_log_engagement on public.activity_log(engagement_id);
create index idx_activity_log_created on public.activity_log(created_at desc);

-- Layer 1
create index idx_time_entries_engagement on public.time_entries(engagement_id);
create index idx_time_entries_member on public.time_entries(member_id);
create index idx_time_entries_date on public.time_entries(org_id, date);
create index idx_resource_alloc_engagement on public.resource_allocations(engagement_id);
create index idx_resource_alloc_member on public.resource_allocations(member_id);
create index idx_violations_org on public.compliance_violations(org_id, status);

-- Layer 2
create index idx_risk_signals_engagement on public.risk_signals(engagement_id);
create index idx_risk_signals_status on public.risk_signals(org_id, status);
create index idx_delivery_signals_engagement on public.delivery_signals(engagement_id);
create index idx_client_updates_engagement on public.client_updates(engagement_id);
create index idx_project_plans_engagement on public.project_plans(engagement_id);

-- Layer 3
create index idx_agent_tasks_org on public.agent_tasks(org_id);
create index idx_agent_tasks_engagement on public.agent_tasks(engagement_id);
create index idx_agent_tasks_status on public.agent_tasks(org_id, status);
create index idx_agent_executions_task on public.agent_executions(task_id);
create index idx_agent_artifacts_engagement on public.agent_artifacts(engagement_id);
create index idx_agent_artifacts_org on public.agent_artifacts(org_id);

-- Self-learning
create index idx_learning_feedback_org on public.learning_feedback(org_id);
create index idx_learning_feedback_agent on public.learning_feedback(agent_id);
create index idx_org_learning_context_org on public.org_learning_context(org_id);

-- Self-healing
create index idx_health_checks_type on public.system_health_checks(check_type);
create index idx_healing_events_created on public.self_healing_events(created_at desc);
create index idx_error_patterns_signature on public.error_patterns(error_signature);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.engagements enable row level security;
alter table public.scope_items enable row level security;
alter table public.stakeholders enable row level security;
alter table public.decisions enable row level security;
alter table public.raci_items enable row level security;
alter table public.checklist_items enable row level security;
alter table public.lessons_learned enable row level security;
alter table public.status_reports enable row level security;
alter table public.activity_log enable row level security;
alter table public.automation_rules enable row level security;
alter table public.resource_profiles enable row level security;
alter table public.resource_allocations enable row level security;
alter table public.time_entries enable row level security;
alter table public.financial_tracking enable row level security;
alter table public.compliance_rules enable row level security;
alter table public.compliance_violations enable row level security;
alter table public.project_plans enable row level security;
alter table public.risk_signals enable row level security;
alter table public.client_updates enable row level security;
alter table public.delivery_signals enable row level security;
alter table public.agent_definitions enable row level security;
alter table public.agent_tasks enable row level security;
alter table public.agent_executions enable row level security;
alter table public.agent_artifacts enable row level security;
alter table public.learning_feedback enable row level security;
alter table public.org_learning_context enable row level security;
alter table public.outcome_correlations enable row level security;

-- Helper function: check if user is a member of an org
create or replace function public.is_org_member(check_org_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.org_members
    where org_id = check_org_id
      and user_id = auth.uid()
      and accepted_at is not null
  );
$$ language sql security definer stable;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on public.profiles for select using (id = auth.uid());
create policy "Users can update own profile" on public.profiles for update using (id = auth.uid());
create policy "Users can insert own profile" on public.profiles for insert with check (id = auth.uid());

-- Organizations: members can view their orgs
create policy "Members can view org" on public.organizations for select using (public.is_org_member(id));
create policy "Anyone can create org" on public.organizations for insert with check (true);
create policy "Admins can update org" on public.organizations for update using (
  exists (
    select 1 from public.org_members
    where org_id = id and user_id = auth.uid() and role in ('owner', 'admin') and accepted_at is not null
  )
);

-- Org members: org members can view other members
create policy "Members can view org members" on public.org_members for select using (public.is_org_member(org_id));
create policy "Admins can manage members" on public.org_members for insert with check (
  exists (
    select 1 from public.org_members
    where org_id = org_members.org_id and user_id = auth.uid() and role in ('owner', 'admin') and accepted_at is not null
  ) or user_id = auth.uid() -- Users can accept their own invite
);
create policy "Admins can update members" on public.org_members for update using (
  exists (
    select 1 from public.org_members m
    where m.org_id = org_members.org_id and m.user_id = auth.uid() and m.role in ('owner', 'admin') and m.accepted_at is not null
  )
);

-- Org-scoped tables: standard pattern — members can view, members can insert/update
-- Apply this to all org-scoped tables
do $$
declare
  tbl text;
begin
  for tbl in
    select unnest(array[
      'engagements', 'scope_items', 'stakeholders', 'decisions', 'raci_items',
      'checklist_items', 'lessons_learned', 'status_reports', 'activity_log',
      'automation_rules', 'resource_profiles', 'resource_allocations',
      'time_entries', 'financial_tracking', 'compliance_rules', 'compliance_violations',
      'project_plans', 'risk_signals', 'client_updates', 'delivery_signals',
      'agent_tasks', 'agent_executions', 'agent_artifacts',
      'learning_feedback', 'org_learning_context', 'outcome_correlations'
    ])
  loop
    execute format(
      'create policy "Org members can view %1$s" on public.%1$s for select using (public.is_org_member(org_id))',
      tbl
    );
    execute format(
      'create policy "Org members can insert %1$s" on public.%1$s for insert with check (public.is_org_member(org_id))',
      tbl
    );
    execute format(
      'create policy "Org members can update %1$s" on public.%1$s for update using (public.is_org_member(org_id))',
      tbl
    );
    execute format(
      'create policy "Org members can delete %1$s" on public.%1$s for delete using (public.is_org_member(org_id))',
      tbl
    );
  end loop;
end $$;

-- Agent definitions: everyone can read system agents
create policy "Anyone can view system agents" on public.agent_definitions for select using (is_system = true);
create policy "System agents are read-only" on public.agent_definitions for insert with check (false);

-- Self-healing tables: no org_id — service role only (accessible via Edge Functions)
-- system_health_checks and error_patterns have no RLS policies — accessed via service role only

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at on engagements
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger engagements_updated_at
  before update on public.engagements
  for each row execute function public.update_updated_at();

-- ============================================================
-- SEED: System Agent Definitions
-- ============================================================

insert into public.agent_definitions (name, agent_type, description, execution_mode, system_prompt, is_system) values
(
  'Documentation Agent',
  'documentation',
  'Generates implementation-related documents from engagement data: requirements docs, meeting agendas, configuration runbooks, handoff documents, and more.',
  'propose_and_wait',
  'You are a documentation specialist for SaaS implementation projects. Generate professional, structured documents based on the engagement context provided. Use clear headings, action items, and implementation-specific terminology. Match the organization''s writing style if learning context is provided.',
  true
),
(
  'Communication Agent',
  'communication',
  'Drafts stakeholder communications: status updates, escalation emails, scope change notifications, kickoff follow-ups, and go-live announcements.',
  'propose_and_wait',
  'You are a communication specialist for SaaS implementation teams. Draft professional, clear communications appropriate for each stakeholder''s role and influence level. Always include specific action items and next steps. Match the organization''s tone and writing style.',
  true
),
(
  'Testing Agent',
  'testing',
  'Generates test plans, creates test cases from scope items, builds requirements traceability matrices, and tracks test execution results.',
  'propose_and_wait',
  'You are a QA specialist for SaaS implementations. Generate structured test plans with clear test cases, expected results, and priority levels. Map test cases to scope items for traceability. Identify regression risks when scope changes occur.',
  true
),
(
  'Migration Agent',
  'migration',
  'Plans data migrations: generates migration plans, suggests field mappings, creates validation checklists, and produces migration runbooks with rollback procedures.',
  'assist',
  'You are a data migration specialist for SaaS implementations. Generate detailed migration plans with pre-migration checks, execution steps, validation queries, and rollback procedures. You advise and plan — you do not execute migrations directly.',
  true
),
(
  'Configuration Agent',
  'configuration',
  'Generates configuration checklists, produces as-configured documentation, and reviews configurations against requirements for drift detection.',
  'assist',
  'You are a system configuration specialist for SaaS implementations. Generate detailed configuration checklists from requirements, create as-configured documentation, and compare current configurations against requirements to detect drift.',
  true
),
(
  'Analysis Agent',
  'analysis',
  'Performs cross-engagement analysis: pattern detection, resource utilization, scope creep trends, lessons learned synthesis, and engagement similarity matching.',
  'auto_execute',
  'You are an analytics specialist for SaaS implementation teams. Analyze engagement data to identify patterns, inefficiencies, and improvement opportunities. Surface actionable insights backed by specific data points.',
  true
);
