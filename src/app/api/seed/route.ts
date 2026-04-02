import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/seed — Seeds Acme Corp demo data for the authenticated user's org
export async function POST() {
  const supabase: any = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Get user's org
  const { data: membership } = await supabase
    .from('org_members')
    .select('id, org_id, role')
    .eq('user_id', user.id)
    .not('accepted_at', 'is', null)
    .limit(1)
    .single();

  if (!membership) return NextResponse.json({ error: 'No org found' }, { status: 400 });

  const orgId = membership.org_id;
  const memberId = membership.id;

  // Check if already seeded
  const { count } = await supabase
    .from('engagements')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('name', 'Acme Corp — Platform Migration');

  if (count && count > 0) {
    return NextResponse.json({ message: 'Demo data already seeded', seeded: false });
  }

  try {
    // ─── ENGAGEMENT 1: Acme Corp — Active, At Risk ───
    const { data: eng1 } = await supabase.from('engagements').insert({
      org_id: orgId,
      name: 'Acme Corp — Platform Migration',
      customer_name: 'Acme Corporation',
      status: 'in_progress',
      health: 'yellow',
      start_date: '2026-02-15',
      target_go_live: '2026-05-30',
      owner_id: memberId,
      description: 'Full platform migration from legacy on-prem to SaaS. 3-phase rollout covering data migration, user onboarding, and custom integration buildout.',
    }).select().single();

    // ─── ENGAGEMENT 2: GlobalTech — Active, On Track ───
    const { data: eng2 } = await supabase.from('engagements').insert({
      org_id: orgId,
      name: 'GlobalTech — CRM Integration',
      customer_name: 'GlobalTech Solutions',
      status: 'in_progress',
      health: 'green',
      start_date: '2026-03-01',
      target_go_live: '2026-06-15',
      owner_id: memberId,
      description: 'CRM integration project connecting Salesforce to the core platform. Bidirectional data sync with custom field mapping.',
    }).select().single();

    // ─── ENGAGEMENT 3: Pinnacle — Completed ───
    const { data: eng3 } = await supabase.from('engagements').insert({
      org_id: orgId,
      name: 'Pinnacle Health — Go-Live Complete',
      customer_name: 'Pinnacle Health Systems',
      status: 'complete',
      health: 'green',
      start_date: '2025-11-01',
      target_go_live: '2026-02-28',
      owner_id: memberId,
      description: 'Healthcare compliance implementation. HIPAA-compliant deployment with SSO and audit logging.',
    }).select().single();

    if (!eng1 || !eng2 || !eng3) throw new Error('Failed to create engagements');

    // ─── SCOPE ITEMS (Acme) ───
    const scopeItems = [
      { engagement_id: eng1.id, org_id: orgId, title: 'Data migration from legacy SQL Server', priority: 'must', status: 'in_progress', description: 'Migrate 2.3M records across 47 tables. Includes data cleansing and validation.' },
      { engagement_id: eng1.id, org_id: orgId, title: 'User provisioning via SSO', priority: 'must', status: 'completed', description: 'Okta SAML integration for 500+ users across 3 departments.' },
      { engagement_id: eng1.id, org_id: orgId, title: 'Custom reporting dashboard', priority: 'should', status: 'not_started', description: 'Executive dashboard with real-time KPIs and drill-down capability.' },
      { engagement_id: eng1.id, org_id: orgId, title: 'API integration with ERP', priority: 'must', status: 'in_progress', description: 'Bidirectional sync with SAP for order and inventory data.' },
      { engagement_id: eng1.id, org_id: orgId, title: 'Mobile app customization', priority: 'could', status: 'not_started', description: 'White-label mobile experience with customer branding.' },
      { engagement_id: eng1.id, org_id: orgId, title: 'Training materials and videos', priority: 'should', status: 'in_progress', description: 'Role-based training content for admins, managers, and end users.' },
    ];
    await supabase.from('scope_items').insert(scopeItems);

    // ─── STAKEHOLDERS (Acme) ───
    const stakeholders = [
      { engagement_id: eng1.id, org_id: orgId, name: 'Rachel Torres', role: 'Executive Sponsor', email: 'rachel.torres@acmecorp.com', influence_level: 'high', is_decision_maker: true },
      { engagement_id: eng1.id, org_id: orgId, name: 'David Kim', role: 'Project Lead', email: 'david.kim@acmecorp.com', influence_level: 'high', is_decision_maker: true },
      { engagement_id: eng1.id, org_id: orgId, name: 'Linda Chen', role: 'IT Director', email: 'linda.chen@acmecorp.com', influence_level: 'medium', is_decision_maker: false },
      { engagement_id: eng1.id, org_id: orgId, name: 'Marcus Webb', role: 'Change Manager', email: 'marcus.webb@acmecorp.com', influence_level: 'medium', is_decision_maker: false },
    ];
    await supabase.from('stakeholders').insert(stakeholders);

    // ─── DECISIONS (Acme) ───
    const decisions = [
      { engagement_id: eng1.id, org_id: orgId, title: 'Phased migration vs Big-Bang cutover', status: 'approved', decided_by: 'Rachel Torres', decision_date: '2026-02-20', rationale: 'Phased approach reduces risk. 3-department rollout over 6 weeks.', impact: 'high' },
      { engagement_id: eng1.id, org_id: orgId, title: 'SSO provider selection: Okta vs Azure AD', status: 'approved', decided_by: 'Linda Chen', decision_date: '2026-02-25', rationale: 'Existing Okta license covers the use case. No incremental cost.', impact: 'medium' },
      { engagement_id: eng1.id, org_id: orgId, title: 'Custom reporting scope: Looker vs embedded', status: 'pending', decided_by: null, decision_date: null, rationale: null, impact: 'medium' },
      { engagement_id: eng1.id, org_id: orgId, title: 'Data archival policy for migrated records', status: 'in_discussion', decided_by: null, decision_date: null, rationale: 'Legal team reviewing retention requirements', impact: 'high' },
    ];
    await supabase.from('decisions').insert(decisions);

    // ─── RACI (Acme) ───
    const raciEntries = [
      { engagement_id: eng1.id, org_id: orgId, activity: 'Data Migration Execution', responsible: 'David Kim', accountable: 'Rachel Torres', consulted: 'Linda Chen', informed: 'Marcus Webb' },
      { engagement_id: eng1.id, org_id: orgId, activity: 'User Acceptance Testing', responsible: 'Marcus Webb', accountable: 'David Kim', consulted: 'Rachel Torres', informed: 'Linda Chen' },
      { engagement_id: eng1.id, org_id: orgId, activity: 'Go-Live Sign-off', responsible: 'Rachel Torres', accountable: 'Rachel Torres', consulted: 'David Kim, Linda Chen', informed: 'Marcus Webb' },
    ];
    await supabase.from('raci_entries').insert(raciEntries);

    // ─── CHECKLIST ITEMS (Acme — Kickoff + Go-Live) ───
    const checklistItems = [
      { engagement_id: eng1.id, org_id: orgId, checklist_type: 'kickoff', title: 'SOW reviewed and signed', is_complete: true, completed_by: memberId, order_index: 1 },
      { engagement_id: eng1.id, org_id: orgId, checklist_type: 'kickoff', title: 'Stakeholder list confirmed', is_complete: true, completed_by: memberId, order_index: 2 },
      { engagement_id: eng1.id, org_id: orgId, checklist_type: 'kickoff', title: 'Environment access provisioned', is_complete: true, completed_by: memberId, order_index: 3 },
      { engagement_id: eng1.id, org_id: orgId, checklist_type: 'kickoff', title: 'Communication plan distributed', is_complete: false, order_index: 4 },
      { engagement_id: eng1.id, org_id: orgId, checklist_type: 'go_live', title: 'UAT sign-off from all departments', is_complete: false, order_index: 1 },
      { engagement_id: eng1.id, org_id: orgId, checklist_type: 'go_live', title: 'Production data migration verified', is_complete: false, order_index: 2 },
      { engagement_id: eng1.id, org_id: orgId, checklist_type: 'go_live', title: 'Rollback plan documented and tested', is_complete: false, order_index: 3 },
      { engagement_id: eng1.id, org_id: orgId, checklist_type: 'go_live', title: 'Support escalation path confirmed', is_complete: false, order_index: 4 },
    ];
    await supabase.from('checklist_items').insert(checklistItems);

    // ─── TIME ENTRIES (Acme) ───
    const timeEntries = [
      { engagement_id: eng1.id, org_id: orgId, member_id: memberId, date: '2026-03-24', hours: 6.5, category: 'delivery', description: 'Data migration Phase 1 — schema mapping and validation scripts' },
      { engagement_id: eng1.id, org_id: orgId, member_id: memberId, date: '2026-03-25', hours: 4.0, category: 'delivery', description: 'SSO integration testing with Okta sandbox' },
      { engagement_id: eng1.id, org_id: orgId, member_id: memberId, date: '2026-03-26', hours: 2.0, category: 'admin', description: 'Weekly status call with David Kim and Rachel Torres' },
      { engagement_id: eng1.id, org_id: orgId, member_id: memberId, date: '2026-03-27', hours: 7.0, category: 'delivery', description: 'API integration — SAP connector build and initial sync test' },
      { engagement_id: eng1.id, org_id: orgId, member_id: memberId, date: '2026-03-28', hours: 3.5, category: 'delivery', description: 'Data migration Phase 1 — test batch run on staging environment' },
    ];
    await supabase.from('time_entries').insert(timeEntries);

    // ─── BUDGET (Acme) ───
    const budgetItems = [
      { engagement_id: eng1.id, org_id: orgId, category: 'Professional Services', planned_amount: 45000, actual_amount: 28500, description: 'Implementation consulting hours' },
      { engagement_id: eng1.id, org_id: orgId, category: 'Data Migration', planned_amount: 15000, actual_amount: 12200, description: 'Migration tooling and validation' },
      { engagement_id: eng1.id, org_id: orgId, category: 'Training', planned_amount: 8000, actual_amount: 2500, description: 'Training content creation and delivery' },
      { engagement_id: eng1.id, org_id: orgId, category: 'Infrastructure', planned_amount: 5000, actual_amount: 4800, description: 'Staging and test environments' },
    ];
    await supabase.from('budget_items').insert(budgetItems);

    // ─── RESOURCE ALLOCATIONS (Acme) ───
    const resources = [
      { engagement_id: eng1.id, org_id: orgId, member_id: memberId, role: 'Implementation Lead', allocation_pct: 80, start_date: '2026-02-15', end_date: '2026-05-30', status: 'active' },
    ];
    await supabase.from('resource_allocations').insert(resources);

    // ─── LESSONS LEARNED (Pinnacle — completed engagement) ───
    const lessons = [
      { engagement_id: eng3.id, org_id: orgId, title: 'SSO testing needs dedicated UAT cycle', category: 'process', impact: 'high', description: 'Discovered late-stage SSO issues because UAT didn\'t include auth flows. Added SSO-specific UAT checklist items going forward.', recommendation: 'Always include SSO and auth in the UAT test plan, not just functional testing.' },
      { engagement_id: eng3.id, org_id: orgId, title: 'Executive sponsor check-ins prevent scope drift', category: 'stakeholder', impact: 'medium', description: 'Bi-weekly check-ins with the exec sponsor kept scope tight and decisions fast. When we skipped one, a scope request slipped through.', recommendation: 'Schedule exec sponsor check-ins at kickoff and protect those time slots.' },
    ];
    await supabase.from('lessons_learned').insert(lessons);

    // ─── RISK SIGNALS (Acme) ───
    const risks = [
      { engagement_id: eng1.id, org_id: orgId, signal_type: 'timeline', severity: 'high', confidence: 0.85, description: 'Data migration Phase 1 running 5 days behind schedule due to unexpected schema complexity in legacy system', status: 'acknowledged', recommended_action: 'Add weekend sprint for migration team. Evaluate if Phase 2 start date needs to shift.' },
      { engagement_id: eng1.id, org_id: orgId, signal_type: 'stakeholder', severity: 'medium', confidence: 0.70, description: 'Marcus Webb (Change Manager) missed last two status meetings. Training rollout may slip.', status: 'detected', recommended_action: 'Direct outreach to Marcus. Escalate to David Kim if no response by Friday.' },
      { engagement_id: eng1.id, org_id: orgId, signal_type: 'budget', severity: 'low', confidence: 0.60, description: 'Infrastructure costs tracking 4% below budget. Healthy position.', status: 'mitigated', recommended_action: 'No action needed. Monitor monthly.' },
    ];
    await supabase.from('risk_signals').insert(risks);

    // ─── PROJECT PLAN (Acme) ───
    const { data: plan } = await supabase.from('project_plans').insert({
      engagement_id: eng1.id,
      org_id: orgId,
      version: 1,
      status: 'active',
      created_by: memberId,
      assumptions: JSON.stringify(['Customer provides legacy DB access by Week 1', 'Okta admin available for SSO config', 'UAT resources available for 2-week cycle']),
      constraints: JSON.stringify(['HIPAA-adjacent data handling requirements', 'Production cutover must happen on a weekend', 'No more than 4 hours downtime during cutover']),
    }).select().single();

    if (plan) {
      // Milestones
      await supabase.from('plan_milestones').insert([
        { plan_id: plan.id, title: 'Kickoff Complete', target_date: '2026-02-15', status: 'completed', order_index: 1 },
        { plan_id: plan.id, title: 'Data Migration Phase 1 Done', target_date: '2026-03-28', status: 'at_risk', order_index: 2 },
        { plan_id: plan.id, title: 'SSO Go-Live', target_date: '2026-04-10', status: 'pending', order_index: 3 },
        { plan_id: plan.id, title: 'UAT Complete', target_date: '2026-05-15', status: 'pending', order_index: 4 },
        { plan_id: plan.id, title: 'Production Go-Live', target_date: '2026-05-30', status: 'pending', order_index: 5 },
      ]);

      // Phases
      await supabase.from('plan_phases').insert([
        { plan_id: plan.id, name: 'Foundation', start_date: '2026-02-15', end_date: '2026-03-15', progress: 100, order_index: 1 },
        { plan_id: plan.id, name: 'Data Migration', start_date: '2026-03-01', end_date: '2026-04-15', progress: 55, order_index: 2 },
        { plan_id: plan.id, name: 'Integration & Testing', start_date: '2026-04-01', end_date: '2026-05-15', progress: 10, order_index: 3 },
        { plan_id: plan.id, name: 'Go-Live', start_date: '2026-05-15', end_date: '2026-05-30', progress: 0, order_index: 4 },
      ]);
    }

    // ─── CLIENT UPDATES (Acme) ───
    await supabase.from('client_updates').insert([
      {
        engagement_id: eng1.id,
        org_id: orgId,
        update_type: 'weekly_status',
        subject: 'Weekly Status — Acme Corp Platform Migration (Week 6)',
        body: 'Hi Rachel and David,\n\nHere\'s your weekly update.\n\n**Progress This Week:**\n- SSO integration with Okta is complete and tested\n- Data migration Phase 1 is 55% through test batches\n- SAP connector initial handshake successful\n\n**Blockers:**\n- Legacy schema has undocumented relationships in 3 tables. David\'s team is helping us map these.\n\n**Next Week:**\n- Complete data migration Phase 1 test batch\n- Begin SAP field mapping for bidirectional sync\n- Schedule UAT kickoff planning session\n\n[YOUR SIGN-OFF]',
        status: 'sent',
        recipients: 'rachel.torres@acmecorp.com,david.kim@acmecorp.com',
        created_by: memberId,
      },
    ]);

    // ─── DELIVERY SIGNALS (Acme) ───
    await supabase.from('delivery_signals').insert([
      { engagement_id: eng1.id, org_id: orgId, signal_category: 'velocity', current_value: 65, expected_value: 80, trend: 'declining', notes: 'Migration complexity slowing velocity' },
      { engagement_id: eng1.id, org_id: orgId, signal_category: 'scope_drift', current_value: 12, expected_value: 5, trend: 'stable', notes: '2 scope items added since kickoff, both approved' },
      { engagement_id: eng1.id, org_id: orgId, signal_category: 'stakeholder_engagement', current_value: 70, expected_value: 85, trend: 'declining', notes: 'Marcus Webb attendance dropping' },
      { engagement_id: eng1.id, org_id: orgId, signal_category: 'budget_burn', current_value: 66, expected_value: 60, trend: 'stable', notes: 'Slightly ahead on spend but within tolerance' },
      { engagement_id: eng1.id, org_id: orgId, signal_category: 'timeline_adherence', current_value: 72, expected_value: 90, trend: 'declining', notes: 'Phase 1 migration 5 days behind' },
    ]);

    // ─── ORG LEARNING CONTEXT ───
    await supabase.from('org_learning_context').upsert([
      { org_id: orgId, context_type: 'risk_patterns', context_key: 'stakeholder_absence_risk', context_value: 'When a key stakeholder misses 2+ consecutive meetings, there is a 73% correlation with timeline slippage. Proactive outreach after the first miss prevents escalation.', confidence: 0.73, source_count: 4 },
      { org_id: orgId, context_type: 'writing_style', context_key: 'status_update_format', context_value: 'Customer-facing updates perform best with: recap bullet points first, then blockers, then next steps. Keep to one page or less.', confidence: 0.85, source_count: 8 },
      { org_id: orgId, context_type: 'common_issues', context_key: 'legacy_migration_complexity', context_value: 'Legacy database migrations consistently underestimate schema complexity by 30-40%. Build in a discovery sprint before committing to migration timelines.', confidence: 0.80, source_count: 5 },
      { org_id: orgId, context_type: 'client_preferences', context_key: 'enterprise_communication', context_value: 'Enterprise clients (500+ users) prefer formal weekly written updates over ad-hoc Slack messages. Executive sponsors want a one-paragraph summary, not a full report.', confidence: 0.90, source_count: 12 },
    ] as any, { onConflict: 'org_id,context_type,context_key' });

    // ─── OUTCOME CORRELATIONS ───
    await supabase.from('outcome_correlations').insert([
      { org_id: orgId, signal_type: 'stakeholder_churn', action_taken: 'escalated_to_exec_sponsor', outcome: 'positive', engagement_id: eng3.id },
      { org_id: orgId, signal_type: 'stakeholder_churn', action_taken: 'no_action', outcome: 'negative', engagement_id: eng1.id },
      { org_id: orgId, signal_type: 'timeline_slippage', action_taken: 'added_weekend_sprint', outcome: 'positive', engagement_id: eng3.id },
      { org_id: orgId, signal_type: 'scope_creep', action_taken: 'formal_change_request', outcome: 'positive', engagement_id: eng3.id },
      { org_id: orgId, signal_type: 'scope_creep', action_taken: 'informal_agreement', outcome: 'negative', engagement_id: eng1.id },
      { org_id: orgId, signal_type: 'budget_overrun', action_taken: 'early_client_notification', outcome: 'positive', engagement_id: eng3.id },
    ]);

    // ─── AGENT DEFINITIONS (seed if none exist) ───
    const { count: agentCount } = await supabase
      .from('agent_definitions')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    let docAgentId: string | null = null;
    if (!agentCount || agentCount === 0) {
      const agents = [
        { org_id: orgId, name: 'Documentation Agent', agent_type: 'documentation', description: 'Generates project documentation, status reports, and handoff docs', execution_mode: 'draft_and_review', is_system: true, is_active: true, version: 1 },
        { org_id: orgId, name: 'Communication Agent', agent_type: 'communication', description: 'Drafts client-facing emails, status updates, and meeting summaries', execution_mode: 'draft_and_review', is_system: true, is_active: true, version: 1 },
        { org_id: orgId, name: 'Analysis Agent', agent_type: 'analysis', description: 'Analyzes engagement health, risk patterns, and delivery trends', execution_mode: 'autonomous', is_system: true, is_active: true, version: 1 },
      ];
      const { data: createdAgents } = await supabase.from('agent_definitions').insert(agents as any).select();
      if (createdAgents) docAgentId = createdAgents[0].id;
    } else {
      const { data: existingAgents } = await supabase.from('agent_definitions').select('id').eq('org_id', orgId).limit(1);
      if (existingAgents && existingAgents.length > 0) docAgentId = existingAgents[0].id;
    }

    // ─── AGENT TASK + EXECUTION (Acme) ───
    if (docAgentId) {
      const { data: task } = await supabase.from('agent_tasks').insert({
        org_id: orgId,
        engagement_id: eng1.id,
        agent_id: docAgentId,
        triggered_by: 'manual',
        input_data: { request: 'Generate weekly status report for Acme Corp engagement' },
        status: 'completed',
        priority: 'medium',
        started_at: '2026-03-28T10:00:00Z',
        completed_at: '2026-03-28T10:00:12Z',
      }).select().single();

      if (task) {
        const { data: execution } = await supabase.from('agent_executions').insert({
          task_id: task.id,
          agent_id: docAgentId,
          execution_step: 1,
          step_description: 'Generated weekly status report draft',
          input_tokens: 1250,
          output_tokens: 890,
          model_used: 'claude-sonnet-4-5-20250514',
          output_content: 'Weekly status report generated with progress summary, blockers, and next steps for Acme Corp Platform Migration.',
          duration_ms: 3400,
          cost_cents: 2,
          status: 'completed',
        }).select().single();

        if (execution) {
          // Artifact
          await supabase.from('agent_artifacts').insert({
            execution_id: execution.id,
            engagement_id: eng1.id,
            artifact_type: 'report',
            name: 'Weekly Status Report — Week 6',
            content: 'Acme Corp Platform Migration — Weekly Status (Week 6)\n\nProgress: SSO complete, migration 55%, SAP connector handshake successful.\nBlockers: Legacy schema undocumented relationships.\nNext: Complete Phase 1 batch, begin SAP field mapping.',
            format: 'markdown',
            status: 'approved',
            approved_by: memberId,
            version: 1,
          });

          // Learning feedback
          await supabase.from('learning_feedback').insert({
            execution_id: execution.id,
            agent_id: docAgentId,
            feedback_type: 'accepted',
            original_output: 'Weekly status report generated.',
            feedback_notes: 'Good structure. Matches our format preferences.',
            feedback_by: memberId,
          });
        }
      }
    }

    // ─── SCOPE + STAKEHOLDERS for GlobalTech (eng2) ───
    await supabase.from('scope_items').insert([
      { engagement_id: eng2.id, org_id: orgId, title: 'Salesforce field mapping', priority: 'must', status: 'in_progress', description: 'Map 120+ custom fields between Salesforce and platform.' },
      { engagement_id: eng2.id, org_id: orgId, title: 'Bidirectional sync engine', priority: 'must', status: 'not_started', description: 'Real-time sync with conflict resolution and retry logic.' },
      { engagement_id: eng2.id, org_id: orgId, title: 'Historical data backfill', priority: 'should', status: 'not_started', description: 'Import 18 months of historical CRM data.' },
    ]);

    await supabase.from('stakeholders').insert([
      { engagement_id: eng2.id, org_id: orgId, name: 'Sarah Park', role: 'VP of Sales', email: 'sarah.park@globaltech.io', influence_level: 'high', is_decision_maker: true },
      { engagement_id: eng2.id, org_id: orgId, name: 'Tom Bradley', role: 'Salesforce Admin', email: 'tom.bradley@globaltech.io', influence_level: 'medium', is_decision_maker: false },
    ]);

    return NextResponse.json({
      message: 'Demo data seeded successfully',
      seeded: true,
      engagements: [eng1.name, eng2.name, eng3.name],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Seed failed' }, { status: 500 });
  }
}
