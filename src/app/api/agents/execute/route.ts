export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAnthropicClient, DEFAULT_MODEL, MAX_TOKENS } from '@/lib/ai/client';
import { getSystemPrompt } from '@/lib/ai/prompts';
import { getMonthlyAgentTaskLimit } from '@/lib/billing/plan-limits';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase: any = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    // Fetch the task with agent definition
    const { data: task, error: taskErr } = await supabase
      .from('agent_tasks')
      .select('*, agent_definitions(*)')
      .eq('id', taskId)
      .single();

    if (taskErr || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify org membership
    const { data: member } = await supabase
      .from('org_members')
      .select('id')
      .eq('org_id', task.org_id)
      .eq('user_id', user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Plan and monthly agent-task quota (completed tasks this UTC month vs tier cap)
    const { data: org } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', task.org_id)
      .single();

    if (org?.plan === 'free') {
      return NextResponse.json(
        { error: 'AI agent execution requires a Pro or Team plan.', code: 'plan_free' },
        { status: 403 }
      );
    }

    const monthlyLimit = getMonthlyAgentTaskLimit(org?.plan);
    if (Number.isFinite(monthlyLimit)) {
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);

      const { count: completedThisMonth } = await supabase
        .from('agent_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', task.org_id)
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
        .gte('completed_at', monthStart.toISOString());

      const used = completedThisMonth ?? 0;
      if (used >= monthlyLimit) {
        return NextResponse.json(
          {
            error:
              'This workspace reached its agent task limit for the current month. Open Settings to review your plan and usage, or try again next month.',
            code: 'agent_task_quota_exceeded',
            limit: monthlyLimit,
            used,
          },
          { status: 403 }
        );
      }
    }

    // Mark task as running
    await supabase.from('agent_tasks').update({
      status: 'running',
      started_at: new Date().toISOString(),
    }).eq('id', taskId);

    // Build context — pull engagement data if available
    let contextStr = '';
    if (task.engagement_id) {
      const { data: eng } = await supabase
        .from('engagements')
        .select('name, customer_name, status, health, description')
        .eq('id', task.engagement_id)
        .single();

      if (eng) {
        contextStr = `\n## Engagement Context\n- Name: ${eng.name}\n- Customer: ${eng.customer_name}\n- Status: ${eng.status}\n- Health: ${eng.health}\n${eng.description ? `- Description: ${eng.description}` : ''}`;
      }

      // Pull org learning context for this agent type
      const agentType = task.agent_definitions?.agent_type || 'documentation';
      const { data: learningCtx } = await supabase
        .from('org_learning_context')
        .select('context_key, context_value, confidence')
        .eq('org_id', task.org_id)
        .gte('confidence', 0.5)
        .order('confidence', { ascending: false })
        .limit(10);

      if (learningCtx && learningCtx.length > 0) {
        contextStr += '\n\n## Learned Preferences\n';
        for (const ctx of learningCtx) {
          contextStr += `- ${ctx.context_key}: ${ctx.context_value} (confidence: ${Math.round(ctx.confidence * 100)}%)\n`;
        }
      }
    }

    // Build the user message from input_data
    const inputData = task.input_data || {};
    let userMessage = inputData.instructions || inputData.prompt || 'Execute the assigned task.';
    if (contextStr) {
      userMessage = `${userMessage}\n${contextStr}`;
    }

    // Get system prompt for agent type
    const agentType = task.agent_definitions?.agent_type || 'documentation';
    const customSystemPrompt = task.agent_definitions?.system_prompt;
    const systemPrompt = customSystemPrompt || getSystemPrompt(agentType);

    // Call Anthropic API
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const duration = Date.now() - startTime;
    const outputContent = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.type === 'text' ? block.text : '')
      .join('\n\n');

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;

    // Estimate cost (Claude Sonnet pricing: $3/1M input, $15/1M output as of 2025)
    const costCents = Math.round(((inputTokens * 3 / 1_000_000) + (outputTokens * 15 / 1_000_000)) * 100);

    // Create execution record
    const { data: execution } = await supabase.from('agent_executions').insert({
      org_id: task.org_id,
      task_id: taskId,
      agent_id: task.agent_id,
      execution_step: 1,
      step_description: 'Primary execution',
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      model_used: DEFAULT_MODEL,
      output_content: outputContent,
      output_artifacts: {},
      duration_ms: duration,
      cost_cents: costCents,
      status: 'success',
    }).select().single();

    // Create artifact from output
    if (execution) {
      await supabase.from('agent_artifacts').insert({
        org_id: task.org_id,
        execution_id: execution.id,
        engagement_id: task.engagement_id,
        artifact_type: agentType === 'analysis' ? 'status_report' : 'document',
        name: `${agentType}_output_${new Date().toISOString().slice(0, 10)}`,
        content: outputContent,
        format: 'markdown',
        status: task.agent_definitions?.execution_mode === 'auto_execute' ? 'delivered' : 'draft',
        version: 1,
      });
    }

    // Mark task completed
    await supabase.from('agent_tasks').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', taskId);

    // Log activity
    await supabase.from('activity_log').insert({
      org_id: task.org_id,
      engagement_id: task.engagement_id,
      entity_type: 'agent_task',
      entity_id: taskId,
      action: 'agent_executed',
      user_id: user.id,
      metadata: {
        agent_type: agentType,
        model: DEFAULT_MODEL,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        duration_ms: duration,
        cost_cents: costCents,
      },
    });

    return NextResponse.json({
      success: true,
      executionId: execution?.id,
      output: outputContent.slice(0, 500) + (outputContent.length > 500 ? '...' : ''),
      tokens: { input: inputTokens, output: outputTokens },
      costCents,
      durationMs: duration,
    });
  } catch (err: any) {
    console.error('Agent execution error:', err);

    // Try to mark task as failed
    try {
      const supabase: any = await createClient();
      const body = await req.clone().json().catch(() => ({}));
      if (body.taskId) {
        await supabase.from('agent_tasks').update({
          status: 'failed',
          completed_at: new Date().toISOString(),
        }).eq('id', body.taskId);

        // Log self-healing event
        const { data: task } = await supabase
          .from('agent_tasks')
          .select('org_id')
          .eq('id', body.taskId)
          .single();

        if (task) {
          await supabase.from('self_healing_events').insert({
            org_id: task.org_id,
            event_type: 'auto_retry',
            trigger_error: err.message || 'Unknown error',
            healing_action: 'Task marked as failed for manual retry',
            result: 'escalated',
            related_task_id: body.taskId,
            metadata: { error_type: err.constructor?.name },
          });
        }
      }
    } catch { /* best effort */ }

    return NextResponse.json({ error: err.message || 'Agent execution failed' }, { status: 500 });
  }
}
