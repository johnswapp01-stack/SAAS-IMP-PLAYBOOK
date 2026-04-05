'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { AgentDefinition, AgentTask, AgentExecution, AgentArtifact, AgentTaskStatus } from '@/types';

interface AgentsTabProps {
  engagementId: string;
}

const taskStatusColors: Record<AgentTaskStatus, string> = {
  queued: 'bg-muted text-muted-foreground',
  running: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  awaiting_approval: 'bg-yellow-100 text-yellow-700',
};

const artifactStatusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  delivered: 'bg-blue-100 text-blue-700',
  archived: 'bg-gray-100 text-gray-500',
};

export function AgentsTab({ engagementId }: AgentsTabProps) {
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [tasks, setTasks] = useState<(AgentTask & { agent_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [taskPriority, setTaskPriority] = useState('normal');
  const [taskInput, setTaskInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);

  // Detail view state
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [artifacts, setArtifacts] = useState<AgentArtifact[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Feedback state
  const [feedbackExecId, setFeedbackExecId] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'accepted' | 'modified' | 'rejected'>('accepted');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [modifiedOutput, setModifiedOutput] = useState('');
  const [savingFeedback, setSavingFeedback] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const { data: agentDefs } = await supabase.from('agent_definitions').select('*').eq('is_active', true).order('name');
    setAgents((agentDefs || []) as unknown as AgentDefinition[]);

    const { data: taskData } = await supabase
      .from('agent_tasks')
      .select('*, agent_definitions(name)')
      .eq('engagement_id', engagementId)
      .order('created_at', { ascending: false });
    const mapped = (taskData || []).map((t: any) => ({ ...t, agent_name: t.agent_definitions?.name }));
    setTasks(mapped as any);
    setLoading(false);
  }, [engagementId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function loadTaskDetail(taskId: string) {
    setSelectedTask(taskId);
    setLoadingDetail(true);
    const supabase = createClient();

    const { data: execs } = await supabase
      .from('agent_executions')
      .select('*')
      .eq('task_id', taskId)
      .order('execution_step', { ascending: true });
    setExecutions((execs || []) as unknown as AgentExecution[]);

    const execIds = (execs || []).map((e: any) => e.id);
    if (execIds.length > 0) {
      const { data: arts } = await supabase
        .from('agent_artifacts')
        .select('*')
        .in('execution_id', execIds)
        .order('created_at', { ascending: false });
      setArtifacts((arts || []) as unknown as AgentArtifact[]);
    } else {
      setArtifacts([]);
    }
    setLoadingDetail(false);
  }

  async function handleCreateTask() {
    if (!selectedAgentId) return;
    setSaving(true);
    const supabase = createClient();
    const { data: eng } = await supabase.from('engagements').select('org_id').eq('id', engagementId).single();

    const payload: any = {
      org_id: eng?.org_id,
      engagement_id: engagementId,
      agent_id: selectedAgentId,
      triggered_by: 'manual',
      trigger_context: {},
      input_data: taskInput.trim() ? { instructions: taskInput.trim() } : {},
      status: 'queued',
      priority: taskPriority,
    };

    await supabase.from('agent_tasks').insert(payload);
    setShowNewTask(false); setSelectedAgentId(''); setTaskInput(''); setTaskPriority('normal');
    setSaving(false); fetchData();
  }

  async function handleExecuteWithAI(taskId: string) {
    setExecutingTaskId(taskId);
    try {
      const res = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      const result = await res.json();
      if (!res.ok) {
        const extra =
          result.code === 'agent_task_quota_exceeded'
            ? ' Open Settings → Plan & Billing to upgrade or wait until the next month.'
            : result.code === 'plan_free'
              ? ' Upgrade to Pro or Team under Settings → Plan & Billing.'
              : '';
        alert(`Execution failed: ${result.error || 'Unknown error'}${extra}`);
      }
      fetchData();
      if (selectedTask === taskId) loadTaskDetail(taskId);
    } catch (err) {
      alert('Failed to execute agent. Check that ANTHROPIC_API_KEY is configured.');
    } finally {
      setExecutingTaskId(null);
    }
  }

  async function handleTaskStatus(taskId: string, newStatus: AgentTaskStatus) {
    const supabase = createClient();
    const update: any = { status: newStatus };
    if (newStatus === 'running') update.started_at = new Date().toISOString();
    if (newStatus === 'completed' || newStatus === 'failed' || newStatus === 'cancelled') {
      update.completed_at = new Date().toISOString();
    }
    await supabase.from('agent_tasks').update(update).eq('id', taskId);
    fetchData();
  }

  async function handleArtifactStatus(artifactId: string, newStatus: string) {
    const supabase = createClient();
    await supabase.from('agent_artifacts').update({ status: newStatus } as any).eq('id', artifactId);
    if (selectedTask) loadTaskDetail(selectedTask);
  }

  async function handleSubmitFeedback() {
    if (!feedbackExecId) return;
    setSavingFeedback(true);
    const supabase = createClient();
    const { data: eng } = await supabase.from('engagements').select('org_id').eq('id', engagementId).single();
    const { data: { user } } = await supabase.auth.getUser();

    // Get the execution to find agent_id and original output
    const exec = executions.find((e) => e.id === feedbackExecId);
    if (!exec) { setSavingFeedback(false); return; }

    // Find membership for feedback_by
    const { data: membership } = await supabase
      .from('org_members')
      .select('id')
      .eq('user_id', user?.id || '')
      .eq('org_id', eng?.org_id || '')
      .single();

    const payload: any = {
      org_id: eng?.org_id,
      execution_id: feedbackExecId,
      agent_id: exec.agent_id,
      feedback_type: feedbackType,
      original_output: exec.output_content || '',
      modified_output: feedbackType === 'modified' ? modifiedOutput.trim() || null : null,
      feedback_notes: feedbackNotes.trim() || null,
      feedback_by: membership?.id,
    };

    await supabase.from('learning_feedback').insert(payload);
    setFeedbackExecId(null); setFeedbackNotes(''); setModifiedOutput('');
    setSavingFeedback(false);
  }

  if (loading) {
    return <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-lg" />)}</div>;
  }

  // Detail view
  if (selectedTask) {
    const task = tasks.find((t) => t.id === selectedTask);
    return (
      <div>
        <button onClick={() => { setSelectedTask(null); setExecutions([]); setArtifacts([]); }} className="text-sm text-primary hover:underline mb-4">
          {String.fromCodePoint(0x2190)} Back to tasks
        </button>

        {task && (
          <div className="rounded-lg border border-border bg-card p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{task.agent_name}</span>
              <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', taskStatusColors[task.status])}>{task.status.replace('_', ' ')}</span>
              <span className="text-xs text-muted-foreground capitalize">{task.priority}</span>
            </div>
            {task.input_data && (task.input_data as any).instructions && (
              <p className="text-sm text-muted-foreground mb-2">Input: {(task.input_data as any).instructions}</p>
            )}
            <div className="flex gap-1">
              {task.status === 'queued' && <button onClick={() => handleExecuteWithAI(task.id)} disabled={executingTaskId === task.id} className="px-2 py-1 text-xs rounded border border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50">{executingTaskId === task.id ? 'Running...' : 'Run with AI'}</button>}
              {task.status === 'running' && <button onClick={() => handleTaskStatus(task.id, 'completed')} className="px-2 py-1 text-xs rounded border border-green-200 text-green-700 hover:bg-green-50">Complete</button>}
              {(task.status === 'queued' || task.status === 'running') && <button onClick={() => handleTaskStatus(task.id, 'cancelled')} className="px-2 py-1 text-xs rounded border border-input text-muted-foreground hover:bg-accent">Cancel</button>}
            </div>
          </div>
        )}

        {/* Execution log */}
        <h4 className="font-medium text-sm mb-3">Execution Log</h4>
        {loadingDetail ? (
          <div className="h-24 bg-muted/50 animate-pulse rounded-lg mb-4" />
        ) : executions.length === 0 ? (
          <div className="rounded-lg border border-border border-dashed p-6 text-center mb-4">
            <p className="text-sm text-muted-foreground">No execution steps recorded yet. Start the task to begin execution.</p>
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            {executions.map((exec) => (
              <div key={exec.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">Step {exec.execution_step}</span>
                    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', exec.status === 'success' ? 'bg-green-100 text-green-700' : exec.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}>{exec.status}</span>
                    <span className="text-xs text-muted-foreground">{exec.model_used}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{exec.duration_ms}ms</span>
                    <span>{exec.input_tokens + exec.output_tokens} tokens</span>
                    <span>${(exec.cost_cents / 100).toFixed(3)}</span>
                  </div>
                </div>
                {exec.step_description && <p className="text-xs text-muted-foreground mb-1">{exec.step_description}</p>}
                {exec.output_content && (
                  <div className="mt-2 rounded bg-muted/50 p-3 text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {exec.output_content}
                  </div>
                )}
                {exec.error_message && (
                  <p className="text-xs text-destructive mt-1">{exec.error_message}</p>
                )}
                {/* Feedback button */}
                <div className="flex gap-1 mt-2">
                  <button onClick={() => { setFeedbackExecId(exec.id); setFeedbackType('accepted'); }} className="px-2 py-1 text-xs rounded border border-green-200 text-green-700 hover:bg-green-50">
                    {String.fromCodePoint(0x2705)} Accept
                  </button>
                  <button onClick={() => { setFeedbackExecId(exec.id); setFeedbackType('modified'); setModifiedOutput(exec.output_content || ''); }} className="px-2 py-1 text-xs rounded border border-yellow-200 text-yellow-700 hover:bg-yellow-50">
                    {String.fromCodePoint(0x270F, 0xFE0F)} Modify
                  </button>
                  <button onClick={() => { setFeedbackExecId(exec.id); setFeedbackType('rejected'); }} className="px-2 py-1 text-xs rounded border border-red-200 text-red-700 hover:bg-red-50">
                    {String.fromCodePoint(0x274C)} Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback form */}
        {feedbackExecId && (
          <div className="rounded-lg border border-border bg-card p-4 mb-6">
            <h4 className="font-medium text-sm mb-3">
              {feedbackType === 'accepted' ? 'Accept Output' : feedbackType === 'modified' ? 'Modify Output' : 'Reject Output'}
            </h4>
            {feedbackType === 'modified' && (
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Modified Output</label>
                <textarea value={modifiedOutput} onChange={(e) => setModifiedOutput(e.target.value)} rows={6} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y" />
              </div>
            )}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Notes (optional)</label>
              <textarea value={feedbackNotes} onChange={(e) => setFeedbackNotes(e.target.value)} rows={2} placeholder="Why are you accepting/modifying/rejecting this output?" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFeedbackExecId(null)} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
              <button onClick={handleSubmitFeedback} disabled={savingFeedback} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {savingFeedback ? 'Saving...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        )}

        {/* Artifacts */}
        <h4 className="font-medium text-sm mb-3">Artifacts</h4>
        {artifacts.length === 0 ? (
          <div className="rounded-lg border border-border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">No artifacts generated yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {artifacts.map((art) => (
              <div key={art.id} className="rounded-lg border border-border bg-card p-3 group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{art.name}</span>
                      <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', artifactStatusColors[art.status])}>{art.status}</span>
                      <span className="text-xs text-muted-foreground">{art.format} · v{art.version}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{art.artifact_type.replace('_', ' ')}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {art.status === 'draft' && (
                      <button onClick={() => handleArtifactStatus(art.id, 'approved')} className="px-2 py-1 text-xs rounded border border-green-200 text-green-700 hover:bg-green-50">Approve</button>
                    )}
                    {art.status === 'approved' && (
                      <button onClick={() => handleArtifactStatus(art.id, 'delivered')} className="px-2 py-1 text-xs rounded border border-blue-200 text-blue-700 hover:bg-blue-50">Deliver</button>
                    )}
                    {art.status !== 'archived' && (
                      <button onClick={() => handleArtifactStatus(art.id, 'archived')} className="px-2 py-1 text-xs rounded border border-input text-muted-foreground hover:bg-accent">Archive</button>
                    )}
                  </div>
                </div>
                {art.content && (
                  <div className="mt-2 rounded bg-muted/50 p-3 text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {art.content.slice(0, 500)}{art.content.length > 500 ? '...' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Task list view
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">AI Agent Tasks</h3>
          <p className="text-xs text-muted-foreground">{tasks.length} task{tasks.length !== 1 ? 's' : ''} for this engagement</p>
        </div>
        <button onClick={() => setShowNewTask(true)} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          + New Task
        </button>
      </div>

      {showNewTask && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Agent *</label>
              <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select an agent...</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.agent_type})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instructions (optional)</label>
            <textarea value={taskInput} onChange={(e) => setTaskInput(e.target.value)} rows={3} placeholder="Specific instructions for the agent, e.g., 'Generate a weekly status report focusing on scope changes and risk updates.'" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNewTask(false)} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleCreateTask} disabled={saving || !selectedAgentId} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Creating...' : 'Queue Task'}
            </button>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">{String.fromCodePoint(0x1F916)}</div>
          <h3 className="font-semibold mb-1">No agent tasks yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Queue an AI agent to generate documents, test plans, status updates, or run analysis on this engagement. Everything goes through review before delivery.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} onClick={() => loadTaskDetail(task.id)} className="rounded-lg border border-border bg-card p-3 flex items-center gap-3 cursor-pointer hover:bg-accent/30 transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{task.agent_name || 'Unknown Agent'}</span>
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', taskStatusColors[task.status])}>{task.status.replace('_', ' ')}</span>
                  <span className="text-xs text-muted-foreground capitalize">{task.priority}</span>
                </div>
                {task.input_data && (task.input_data as any).instructions && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{(task.input_data as any).instructions}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(task.created_at).toLocaleDateString()}
                  {task.completed_at && ` · Completed ${new Date(task.completed_at).toLocaleDateString()}`}
                </p>
              </div>
              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">{String.fromCodePoint(0x2192)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
