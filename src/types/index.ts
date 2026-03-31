// ============================================================
// Implementation Pro — Core Type Definitions
// ============================================================

// Generated Supabase database types (auto-generated — do not edit manually)
export type { Database } from './database.types'

// --- Enums ---

export type EngagementStatus = 'kickoff' | 'in_progress' | 'uat' | 'go_live' | 'complete' | 'on_hold';
export type HealthStatus = 'green' | 'yellow' | 'red';
export type MoscowPriority = 'must' | 'should' | 'could' | 'wont';
export type ScopeStatus = 'approved' | 'pending' | 'rejected' | 'deferred';
export type InfluenceLevel = 'high' | 'medium' | 'low';
export type ImpactLevel = 'high' | 'medium' | 'low';
export type CommunicationPref = 'email' | 'slack' | 'call' | 'in_person';
export type ChecklistType = 'kickoff' | 'go_live';
export type TaskStatus = 'not_started' | 'in_progress' | 'complete' | 'blocked' | 'na';
export type SignOffStatus = 'pending' | 'approved' | 'na';
export type DecisionStatus = 'active' | 'superseded' | 'reversed';
export type LessonCategory = 'process' | 'communication' | 'technical' | 'scope' | 'timeline';
export type ReportType = 'internal' | 'customer' | 'executive';
export type OrgPlan = 'free' | 'pro' | 'team' | 'enterprise';
export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';

// Agent-specific enums
export type AgentExecutionMode = 'auto_execute' | 'propose_and_wait' | 'assist';
export type AgentType = 'documentation' | 'testing' | 'migration' | 'configuration' | 'communication' | 'analysis';
export type AgentTaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'awaiting_approval';
export type AgentTaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type FeedbackType = 'accepted' | 'modified' | 'rejected';
export type ArtifactType = 'document' | 'test_report' | 'migration_log' | 'config_file' | 'status_report' | 'project_plan';
export type ArtifactFormat = 'markdown' | 'pdf' | 'json' | 'xlsx' | 'docx';

// Self-healing enums
export type HealthCheckType = 'api_availability' | 'db_performance' | 'agent_success_rate' | 'queue_depth' | 'error_rate';
export type SystemHealthStatus = 'healthy' | 'degraded' | 'critical';
export type HealingEventType = 'auto_retry' | 'circuit_break' | 'fallback_activated' | 'graceful_degradation' | 'auto_rollback' | 'anomaly_detected';

// --- Foundation Models ---

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: OrgPlan;
  trial_ends_at: string | null;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  invited_at: string;
  accepted_at: string | null;
  // Joined fields
  user?: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Engagement {
  id: string;
  org_id: string;
  name: string;
  customer_name: string;
  status: EngagementStatus;
  health: HealthStatus;
  owner_id: string | null;
  start_date: string | null;
  target_go_live: string | null;
  actual_go_live: string | null;
  description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
  owner?: OrgMember;
  health_score?: number;
}

export interface ScopeItem {
  id: string;
  engagement_id: string;
  org_id: string;
  requirement: string;
  priority: MoscowPriority;
  status: ScopeStatus;
  requested_by: string | null;
  date_added: string | null;
  date_resolved: string | null;
  notes: string | null;
  sort_order: number;
}

export interface Stakeholder {
  id: string;
  engagement_id: string;
  org_id: string;
  name: string;
  role: string | null;
  organization: string | null;
  influence: InfluenceLevel;
  communication_pref: CommunicationPref;
  key_concerns: string | null;
  last_contact: string | null;
  email: string | null;
}

export interface Decision {
  id: string;
  engagement_id: string;
  org_id: string;
  decision: string;
  context: string | null;
  made_by: string | null;
  date: string | null;
  impact: ImpactLevel;
  reversible: boolean;
  status: DecisionStatus;
}

export interface RaciItem {
  id: string;
  engagement_id: string;
  org_id: string;
  deliverable: string;
  responsible: string | null;
  accountable: string | null;
  consulted: string | null;
  informed: string | null;
  sort_order: number;
}

export interface ChecklistItem {
  id: string;
  engagement_id: string;
  org_id: string;
  checklist_type: ChecklistType;
  task: string;
  phase: string | null;
  owner: string | null;
  status: TaskStatus;
  due_date: string | null;
  sign_off: SignOffStatus;
  notes: string | null;
  sort_order: number;
}

export interface LessonLearned {
  id: string;
  engagement_id: string;
  org_id: string;
  finding: string;
  category: LessonCategory;
  impact: ImpactLevel;
  recommendation: string | null;
  owner: string | null;
  created_at: string;
}

export interface StatusReport {
  id: string;
  engagement_id: string;
  org_id: string;
  report_type: ReportType;
  period_start: string;
  period_end: string;
  overall_health: HealthStatus;
  accomplished: Record<string, unknown>[];
  planned_next: Record<string, unknown>[];
  blockers: Record<string, unknown>[];
  risks: Record<string, unknown>[];
  generated_by: string | null;
  pdf_url: string | null;
  created_at: string;
}

// --- Layer 3: Agent Models ---

export interface AgentDefinition {
  id: string;
  name: string;
  agent_type: AgentType;
  description: string;
  execution_mode: AgentExecutionMode;
  system_prompt: string;
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  is_system: boolean;
  is_active: boolean;
  version: number;
}

export interface AgentTask {
  id: string;
  org_id: string;
  engagement_id: string;
  agent_id: string;
  triggered_by: 'schedule' | 'event' | 'manual' | 'automation_rule';
  trigger_context: Record<string, unknown>;
  input_data: Record<string, unknown>;
  status: AgentTaskStatus;
  priority: AgentTaskPriority;
  scheduled_for: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  // Joined
  agent?: AgentDefinition;
  executions?: AgentExecution[];
}

export interface AgentExecution {
  id: string;
  org_id: string;
  task_id: string;
  agent_id: string;
  execution_step: number;
  step_description: string;
  input_tokens: number;
  output_tokens: number;
  model_used: string;
  output_content: string;
  output_artifacts: Record<string, unknown>;
  duration_ms: number;
  cost_cents: number;
  status: 'success' | 'failed' | 'retried';
  error_message: string | null;
  created_at: string;
}

export interface AgentArtifact {
  id: string;
  org_id: string;
  execution_id: string;
  engagement_id: string;
  artifact_type: ArtifactType;
  name: string;
  content: string | null;
  storage_path: string | null;
  format: ArtifactFormat;
  status: 'draft' | 'approved' | 'delivered' | 'archived';
  approved_by: string | null;
  version: number;
  created_at: string;
}

// --- Self-Learning Models ---

export interface LearningFeedback {
  id: string;
  org_id: string;
  execution_id: string;
  agent_id: string;
  feedback_type: FeedbackType;
  original_output: string;
  modified_output: string | null;
  feedback_notes: string | null;
  feedback_by: string;
  created_at: string;
}

export interface OrgLearningContext {
  id: string;
  org_id: string;
  context_type: 'writing_style' | 'risk_patterns' | 'common_issues' | 'client_preferences' | 'process_norms';
  context_key: string;
  context_value: string;
  confidence: number;
  source_count: number;
  last_updated: string;
}

// --- Self-Healing Models ---

export interface SystemHealthCheck {
  id: string;
  check_type: HealthCheckType;
  status: SystemHealthStatus;
  measured_value: number;
  threshold_warn: number;
  threshold_critical: number;
  metadata: Record<string, unknown>;
  checked_at: string;
}

export interface SelfHealingEvent {
  id: string;
  org_id: string | null;
  event_type: HealingEventType;
  trigger_error: string;
  healing_action: string;
  result: 'resolved' | 'escalated' | 'failed';
  related_task_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// --- UI State Types ---

export interface DashboardView {
  type: 'table' | 'kanban' | 'timeline';
}

export interface EngagementFilters {
  status?: EngagementStatus[];
  health?: HealthStatus[];
  owner_id?: string;
  search?: string;
  date_range?: { start: string; end: string };
}

export interface EngagementTab {
  id: 'scope' | 'stakeholders' | 'decisions' | 'raci' | 'kickoff' | 'golive' | 'reports' | 'lessons' | 'agents';
  label: string;
  count?: number;
}
