'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils';
import type { AgentDefinition, AgentTask } from '@/types';

const modeLabels: Record<string, { label: string; color: string }> = {
  auto_execute: { label: 'Auto-Execute', color: 'bg-green-100 text-green-700' },
  propose_and_wait: { label: 'Propose & Wait', color: 'bg-blue-100 text-blue-700' },
  assist: { label: 'Assist', color: 'bg-purple-100 text-purple-700' },
};

const typeIcons: Record<string, string> = {
  documentation: String.fromCodePoint(0x1F4DD),
  communication: String.fromCodePoint(0x1F4AC),
  testing: String.fromCodePoint(0x1F9EA),
  migration: String.fromCodePoint(0x1F504),
  configuration: String.fromCodePoint(0x2699, 0xFE0F),
  analysis: String.fromCodePoint(0x1F4CA),
};

const taskStatusColors: Record<string, string> = {
  queued: 'bg-muted text-muted-foreground',
  running: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  awaiting_approval: 'bg-yellow-100 text-yellow-700',
};

// Seed agent definitions if none exist
const systemAgents = [
  { name: 'Documentation Agent', agent_type: 'documentation', description: 'Generates SOWs, runbooks, handoff docs, and meeting summaries from engagement data.', execution_mode: 'propose_and_wait', system_prompt: 'You are an implementation documentation specialist. Generate professional documents from engagement data.' },
  { name: 'Communication Agent', agent_type: 'communication', description: 'Drafts stakeholder updates, client emails, and status reports.', execution_mode: 'propose_and_wait', system_prompt: 'You are a communication specialist for implementation projects. Draft clear, professional updates.' },
  { name: 'Testing Agent', agent_type: 'testing', description: 'Creates test plans, acceptance criteria, and traceability matrices.', execution_mode: 'propose_and_wait', system_prompt: 'You are a QA specialist for SaaS implementations. Create thorough test plans and acceptance criteria.' },
  { name: 'Migration Agent', agent_type: 'migration', description: 'Plans data migrations with validation steps and rollback procedures.', execution_mode: 'assist', system_prompt: 'You are a data migration specialist. Plan safe, validated migrations with rollback steps.' },
  { name: 'Configuration Agent', agent_type: 'configuration', description: 'Generates configuration checklists and detects drift from baseline.', execution_mode: 'assist', system_prompt: 'You are a system configuration specialist. Create thorough config checklists and detect drift.' },
  { name: 'Analysis Agent', agent_type: 'analysis', description: 'Cross-engagement pattern detection, health trend analysis, and risk prediction.', execution_mode: 'auto_execute', system_prompt: 'You are a delivery analytics specialist. Analyze patterns across engagements and predict risks.' },
];

export default function AgentsPage() {
  const { org } = useOrg();
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [recentTasks, setRecentTasks] = useState<(AgentTask & { agent_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ tasksThisMonth: 0, acceptanceRate: 0, totalCost: 0 });

  const fetchData = useCallback(async () => {
    if (!org) return;
    const supabase = createClient();

    // Fetch agent definitions
    let { data: agentDefs } = await supabase.from('agent_definitions').select('*').order('name');

    // Seed system agents if none exist
    if (!agentDefs || agentDefs.length === 0) {
      for (const sa of systemAgents) {
        await supabase.from('agent_definitions').insert(sa as any);
      }
      const { data: seeded } = await supabase.from('agent_definitions').select('*').order('name');
      agentDefs = seeded;
    }

    setAgents((agentDefs || []) as unknown as AgentDefinition[]);

    // Fetch recent tasks across all engagements for this org
    const { data: tasks } = await supabase
      .from('agent_tasks')
      .select('*, agent_definitions(name)')
      .eq('org_id', org.id)
      .order('created_at', { ascending: false })
      .limit(20);

    const mapped = (tasks || []).map((t: any) => ({
      ...t,
      agent_name: t.agent_definitions?.name,
    }));
    setRecentTasks(mapped as any);

    // Compute stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count: monthCount } = await supabase
      .from('agent_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', org.id)
      .gte('created_at', monthStart);

    const { data: feedback } = await supabase
      .from('learning_feedback')
      .select('feedback_type')
      .eq('org_id', org.id);
    const accepted = (feedback || []).filter((f: any) => f.feedback_type === 'accepted').length;
    const totalFeedback = (feedback || []).length;
    const rate = totalFeedback > 0 ? Math.round((accepted / totalFeedback) * 100) : 0;

    // Total cost
    const { data: executions } = await supabase
      .from('agent_executions')
      .select('cost_cents')
      .eq('org_id', org.id)
      .gte('created_at', monthStart);
    const totalCents = (executions || []).reduce((s: number, e: any) => s + (e.cost_cents || 0), 0);

    setStats({
      tasksThisMonth: monthCount || 0,
      acceptanceRate: rate,
      totalCost: totalCents,
    });

    setLoading(false);
  }, [org]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map((i) => <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-lg" />)}</div>
        <div className="grid gap-4 md:grid-cols-3">{[1,2,3].map((i) => <div key={i} className="h-40 bg-muted/50 animate-pulse rounded-lg" />)}</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">AI Agents</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Deploy AI agents to execute repeatable delivery tasks. Review artifacts before they go to clients.
      </p>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="rounded-lg border border-border p-4 text-center">
          <p className="text-3xl font-bold">{agents.filter((a) => a.is_active).length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active Agents</p>
        </div>
        <div className="rounded-lg border border-border p-4 text-center">
          <p className="text-3xl font-bold">{stats.tasksThisMonth}</p>
          <p className="text-xs text-muted-foreground mt-1">Tasks This Month</p>
        </div>
        <div className="rounded-lg border border-border p-4 text-center">
          <p className="text-3xl font-bold">{stats.acceptanceRate > 0 ? `${stats.acceptanceRate}%` : '—'}</p>
          <p className="text-xs text-muted-foreground mt-1">Acceptance Rate</p>
        </div>
        <div className="rounded-lg border border-border p-4 text-center">
          <p className="text-3xl font-bold">${(stats.totalCost / 100).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Cost This Month</p>
        </div>
      </div>

      {/* Agent cards */}
      <h2 className="font-semibold text-lg mb-4">System Agents</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {agents.map((agent) => (
          <div key={agent.id} className={cn('rounded-lg border p-5 transition-colors', agent.is_active ? 'border-border hover:border-primary/50' : 'border-border/50 opacity-60')}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{typeIcons[agent.agent_type] || String.fromCodePoint(0x1F916)}</span>
              <div>
                <p className="font-medium">{agent.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', modeLabels[agent.execution_mode]?.color)}>{modeLabels[agent.execution_mode]?.label}</span>
                  <span className="text-[10px] text-muted-foreground">v{agent.version}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{agent.description}</p>
            <div className="mt-3 text-xs text-muted-foreground">
              {agent.execution_mode === 'auto_execute'
                ? 'Runs automatically on schedule or trigger.'
                : agent.execution_mode === 'propose_and_wait'
                ? 'Generates output for your review before delivery.'
                : 'Assists with work but requires manual completion.'}
            </div>
          </div>
        ))}
      </div>

      {/* Recent tasks */}
      <h2 className="font-semibold text-lg mb-4">Recent Tasks</h2>
      {recentTasks.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">{String.fromCodePoint(0x1F916)}</div>
          <h3 className="font-semibold mb-1">No agent tasks yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Open an engagement and use the AI Agents tab to run your first task. Agents generate documents, test plans, status updates, and more.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Agent</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Priority</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Triggered By</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.map((task) => (
                <tr key={task.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium">{task.agent_name || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', taskStatusColors[task.status])}>{task.status.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell capitalize text-muted-foreground">{task.priority}</td>
                  <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">{task.triggered_by}</td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(task.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
