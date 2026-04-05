'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  getNextStepsForEngagement,
  IMPLEMENTATION_POSITIONING_LINE,
} from '@/lib/product/implementation-lifecycle';
import type { EngagementStatus } from '@/types';

interface EngagementSummary {
  id: string;
  name: string;
  customer_name: string | null;
  status: string;
  health: string;
  start_date: string | null;
  target_go_live: string | null;
}

interface AgentTaskSummary {
  id: string;
  status: string;
  priority: string;
  created_at: string;
  agent_name?: string;
  engagement_name?: string;
}

interface RecentDecision {
  id: string;
  title: string;
  status: string;
  created_at: string;
  engagement_name?: string;
}

const healthColors: Record<string, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  kickoff: 'Kickoff',
  in_progress: 'In Progress',
  uat: 'UAT',
  go_live: 'Go-Live',
  complete: 'Complete',
  on_hold: 'On Hold',
};

export default function DashboardPage() {
  const supabase = createClient();
  const { org, loading: orgLoading } = useOrg();

  const [engagements, setEngagements] = useState<EngagementSummary[]>([]);
  const [agentTasks, setAgentTasks] = useState<AgentTaskSummary[]>([]);
  const [decisions, setDecisions] = useState<RecentDecision[]>([]);
  const [stats, setStats] = useState({
    totalEngagements: 0,
    activeEngagements: 0,
    onTrack: 0,
    atRisk: 0,
    offTrack: 0,
    openDecisions: 0,
    agentTasksThisMonth: 0,
    acceptanceRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!org) return;

    // Engagements
    const { data: engData } = await supabase
      .from('engagements')
      .select('id, name, customer_name, status, health, start_date, target_go_live')
      .eq('org_id', org.id)
      .order('updated_at', { ascending: false });

    const engs = (engData || []) as EngagementSummary[];
    setEngagements(engs);

    const active = engs.filter(e => !['complete', 'on_hold'].includes(e.status));
    const onTrack = active.filter(e => e.health === 'green').length;
    const atRisk = active.filter(e => e.health === 'yellow').length;
    const offTrack = active.filter(e => e.health === 'red').length;

    // Open decisions
    const { count: openDecisions } = await supabase
      .from('decisions')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', org.id)
      .in('status', ['pending', 'in_discussion'] as any);

    // Recent decisions
    const { data: decData } = await supabase
      .from('decisions')
      .select('id, title, status, created_at, engagement_id')
      .eq('org_id', org.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Map engagement names to decisions
    const decWithNames: RecentDecision[] = [];
    for (const d of (decData || []) as any[]) {
      const eng = engs.find(e => e.id === d.engagement_id);
      decWithNames.push({ ...d, engagement_name: eng?.name || '' });
    }
    setDecisions(decWithNames);

    // Agent tasks this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: taskData, count: taskCount } = await supabase
      .from('agent_tasks')
      .select('id, status, priority, created_at, agent_id, engagement_id', { count: 'exact' })
      .eq('org_id', org.id)
      .gte('created_at', monthStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    // Get agent names for tasks
    const taskSummaries: AgentTaskSummary[] = [];
    if (taskData) {
      const agentIds = [...new Set((taskData as any[]).map(t => t.agent_id).filter(Boolean))];
      let agentMap: Record<string, string> = {};
      if (agentIds.length > 0) {
        const { data: agents } = await supabase.from('agent_definitions').select('id, name').in('id', agentIds);
        agentMap = (agents || []).reduce((acc: Record<string, string>, a: any) => { acc[a.id] = a.name; return acc; }, {});
      }
      for (const t of taskData as any[]) {
        const eng = engs.find(e => e.id === t.engagement_id);
        taskSummaries.push({
          ...t,
          agent_name: agentMap[t.agent_id] || 'Unknown',
          engagement_name: eng?.name || '',
        });
      }
    }
    setAgentTasks(taskSummaries);

    // Acceptance rate
    const { count: totalFeedback } = await supabase.from('learning_feedback').select('*', { count: 'exact', head: true });
    const { count: acceptedFeedback } = await supabase.from('learning_feedback').select('*', { count: 'exact', head: true }).eq('feedback_type', 'accepted');
    const rate = totalFeedback && totalFeedback > 0 ? Math.round(((acceptedFeedback || 0) / totalFeedback) * 100) : 0;

    setStats({
      totalEngagements: engs.length,
      activeEngagements: active.length,
      onTrack,
      atRisk,
      offTrack,
      openDecisions: openDecisions || 0,
      agentTasksThisMonth: taskCount || 0,
      acceptanceRate: rate,
    });

    setLoading(false);
  }, [org, supabase]);

  useEffect(() => { load(); }, [load]);

  if (orgLoading || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-lg" />)}
          </div>
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Please complete onboarding to access the dashboard.</p>
      </div>
    );
  }

  const activeEngagements = engagements.filter(
    (e) => !['complete', 'on_hold'].includes(e.status)
  );

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{greeting}</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s where things stand across your engagements.</p>
        <p className="text-xs text-muted-foreground mt-2 max-w-2xl leading-relaxed border-l-2 border-primary/30 pl-3">
          {IMPLEMENTATION_POSITIONING_LINE}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Active Engagements" value={stats.activeEngagements} subtext={`${stats.totalEngagements} total`} href="/engagements" />
        <KpiCard label="On Track" value={stats.onTrack} subtext={stats.atRisk > 0 ? `${stats.atRisk} at risk` : 'All clear'} variant={stats.atRisk > 0 ? 'warn' : 'good'} href="/engagements" />
        <KpiCard label="Open Decisions" value={stats.openDecisions} subtext="Awaiting resolution" href="/engagements" />
        <KpiCard label="Agent Tasks (Month)" value={stats.agentTasksThisMonth} subtext={stats.acceptanceRate > 0 ? `${stats.acceptanceRate}% accepted` : 'No feedback yet'} href="/agents" />
      </div>

      {/* Lifecycle playbook: concrete next steps by phase */}
      {activeEngagements.length > 0 && (
        <div className="border border-border rounded-lg p-4 bg-muted/20">
          <h2 className="text-sm font-medium mb-1">Playbook suggestions</h2>
          <p className="text-xs text-muted-foreground mb-3">
            One suggested next step per active engagement (links open the right tab).
          </p>
          <ul className="space-y-2">
            {activeEngagements.slice(0, 5).map((eng) => {
              const steps = getNextStepsForEngagement(eng.id, eng.status as EngagementStatus);
              const step = steps[0];
              if (!step) return null;
              return (
                <li key={eng.id}>
                  <Link
                    href={step.href}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    {eng.name}
                  </Link>
                  <span className="text-sm text-muted-foreground"> — {step.title}</span>
                  <span className="sr-only">.</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Health Distribution */}
      {stats.activeEngagements > 0 && (
        <div className="border border-border rounded-lg p-4">
          <h2 className="text-sm font-medium mb-3">Portfolio Health</h2>
          <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-muted">
            {stats.onTrack > 0 && (
              <div className="bg-green-500 h-full transition-all" style={{ width: `${(stats.onTrack / stats.activeEngagements) * 100}%` }} title={`${stats.onTrack} on track`} />
            )}
            {stats.atRisk > 0 && (
              <div className="bg-yellow-500 h-full transition-all" style={{ width: `${(stats.atRisk / stats.activeEngagements) * 100}%` }} title={`${stats.atRisk} at risk`} />
            )}
            {stats.offTrack > 0 && (
              <div className="bg-red-500 h-full transition-all" style={{ width: `${(stats.offTrack / stats.activeEngagements) * 100}%` }} title={`${stats.offTrack} off track`} />
            )}
            {stats.activeEngagements - stats.onTrack - stats.atRisk - stats.offTrack > 0 && (
              <div className="bg-gray-400 h-full transition-all" style={{ width: `${((stats.activeEngagements - stats.onTrack - stats.atRisk - stats.offTrack) / stats.activeEngagements) * 100}%` }} title="Not started" />
            )}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Green ({stats.onTrack})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Yellow ({stats.atRisk})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Red ({stats.offTrack})</span>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagements list */}
        <div className="border border-border rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Engagements</h2>
            <Link href="/engagements" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {engagements.slice(0, 6).map(eng => (
              <Link key={eng.id} href={`/engagements/${eng.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors">
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', healthColors[eng.health] || 'bg-gray-400')} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{eng.name}</div>
                  {eng.customer_name && <div className="text-xs text-muted-foreground truncate">{eng.customer_name}</div>}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {statusLabels[eng.status] || eng.status}
                </span>
              </Link>
            ))}
            {engagements.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground max-w-md mx-auto space-y-2">
                <p>
                  An engagement is one customer implementation (one project you run from kickoff through
                  go-live).
                </p>
                <p>
                  <Link href="/engagements/new" className="text-primary font-medium hover:underline">
                    Create your first engagement
                  </Link>{' '}
                  or load sample data from Settings if you want to explore with demo content.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Decisions + Agent Tasks */}
        <div className="space-y-6">
          {/* Recent Decisions */}
          <div className="border border-border rounded-lg">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-medium">Recent Decisions</h2>
            </div>
            <div className="divide-y divide-border">
              {decisions.length > 0 ? decisions.map(d => (
                <div key={d.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full flex-shrink-0',
                      d.status === 'approved' ? 'bg-green-500' : d.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                    )} />
                    <span className="text-sm truncate">{d.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    {d.engagement_name && <span>{d.engagement_name}</span>}
                    <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )) : (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">No decisions logged yet.</div>
              )}
            </div>
          </div>

          {/* Agent Activity */}
          <div className="border border-border rounded-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-medium">Agent Activity</h2>
              <Link href="/agents" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-border">
              {agentTasks.length > 0 ? agentTasks.map(t => (
                <div key={t.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t.agent_name}</span>
                    <TaskStatusBadge status={t.status} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t.engagement_name && <span>{t.engagement_name} · </span>}
                    {new Date(t.created_at).toLocaleDateString()}
                  </div>
                </div>
              )) : (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">No agent tasks this month.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="border border-border rounded-lg p-4">
        <h2 className="text-sm font-medium mb-3">Quick actions</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Common moves: start work, review operational controls, or run an AI task.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/engagements/new" className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">New engagement</Link>
          <Link href="/governance" className="px-3 py-1.5 border border-input rounded-md text-sm hover:bg-accent">Operations (time, budget, compliance)</Link>
          <Link href="/agents" className="px-3 py-1.5 border border-input rounded-md text-sm hover:bg-accent">AI agent console</Link>
          <Link href="/intelligence" className="px-3 py-1.5 border border-input rounded-md text-sm hover:bg-accent">Intelligence</Link>
          <Link href="/settings" className="px-3 py-1.5 border border-input rounded-md text-sm hover:bg-accent">Settings & billing</Link>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function KpiCard({ label, value, subtext, variant, href }: { label: string; value: number; subtext: string; variant?: 'good' | 'warn'; href: string }) {
  return (
    <Link href={href} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      <div className={cn('text-xs mt-1', variant === 'warn' ? 'text-yellow-600' : variant === 'good' ? 'text-green-600' : 'text-muted-foreground')}>
        {subtext}
      </div>
    </Link>
  );
}

function TaskStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    queued: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    running: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    awaiting_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  return <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', map[status] || map.queued)}>{status.replace('_', ' ')}</span>;
}
