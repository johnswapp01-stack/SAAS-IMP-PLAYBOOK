'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScopeTab } from './tabs/scope-tab';
import { StakeholdersTab } from './tabs/stakeholders-tab';
import { DecisionsTab } from './tabs/decisions-tab';
import { RaciTab } from './tabs/raci-tab';
import { ChecklistTab } from './tabs/checklist-tab';
import { LessonsTab } from './tabs/lessons-tab';
import { ReportsTab } from './tabs/reports-tab';
import { TimeEntriesTab } from './tabs/time-entries-tab';
import { BudgetTab } from './tabs/budget-tab';
import { ResourcesTab } from './tabs/resources-tab';
import { ProjectPlanTab } from './tabs/project-plan-tab';
import { RiskSignalsTab } from './tabs/risk-signals-tab';
import { HealthTab } from './tabs/health-tab';
import { ClientUpdatesTab } from './tabs/client-updates-tab';
import { DeliveryTrendsTab } from './tabs/delivery-trends-tab';
import { AgentsTab } from './tabs/agents-tab';

interface EngagementTabsProps {
  engagementId: string;
  /** From server `searchParams.tab`; kept in sync with the URL when switching tabs */
  initialTab?: string;
}

const tabs = [
  {
    id: 'scope',
    label: 'Scope',
    icon: '🎯',
    group: 'delivery',
    plainHint:
      'MoSCoW priorities show what must ship versus what can wait—your main tool for scope conversations.',
  },
  {
    id: 'stakeholders',
    label: 'Stakeholders',
    icon: '👥',
    group: 'delivery',
    plainHint: 'People affected by the implementation: who has power, who needs updates, and how they prefer to communicate.',
  },
  {
    id: 'decisions',
    label: 'Decisions',
    icon: '⚖️',
    group: 'delivery',
    plainHint: 'A running log of what was agreed, so the team does not rely on memory or inbox archaeology.',
  },
  {
    id: 'raci',
    label: 'RACI',
    icon: '📊',
    group: 'delivery',
    plainHint:
      'Responsible, Accountable, Consulted, Informed—clarifies who does the work versus who signs off.',
  },
  {
    id: 'kickoff',
    label: 'Kickoff',
    icon: '🚀',
    group: 'delivery',
    plainHint: 'Checklist for the start of the engagement: alignment before build and testing consume the timeline.',
  },
  {
    id: 'golive',
    label: 'Go-Live',
    icon: '✅',
    group: 'delivery',
    plainHint: 'Readiness checks before the customer-facing launch; reduces “we thought we were ready” surprises.',
  },
  {
    id: 'time',
    label: 'Time',
    icon: '⏱️',
    group: 'ops',
    plainHint: 'Hours logged against the engagement—supports operational controls and billing accuracy.',
  },
  {
    id: 'budget',
    label: 'Budget',
    icon: '💰',
    group: 'ops',
    plainHint: 'Budget versus spend for this implementation so margin and overruns stay visible.',
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: '👤',
    group: 'ops',
    plainHint: 'Who is allocated and at what capacity—helps avoid passive overbooking across projects.',
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: '📅',
    group: 'governance',
    plainHint: 'Milestone-style plan for the implementation: phases, dates, and dependencies in one place.',
  },
  {
    id: 'health',
    label: 'Health',
    icon: '💚',
    group: 'governance',
    plainHint: 'Simple health signal for this engagement so managers see heat without reading every detail.',
  },
  {
    id: 'risks',
    label: 'Risks',
    icon: '🛡️',
    group: 'governance',
    plainHint: 'Early-warning items: what might go wrong, how serious it is, and what to do about it.',
  },
  {
    id: 'updates',
    label: 'Updates',
    icon: '📨',
    group: 'governance',
    plainHint: 'Customer-facing status drafts and sends—keeps executives and sponsors aligned in plain language.',
  },
  {
    id: 'trends',
    label: 'Trends',
    icon: '📈',
    group: 'governance',
    plainHint: 'Delivery signals over time—spot drift (dates, burn, quality) before it becomes a crisis.',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: '📄',
    group: 'delivery',
    plainHint: 'Structured reports for internal or customer audiences, often generated or assisted by agents.',
  },
  {
    id: 'lessons',
    label: 'Lessons',
    icon: '💡',
    group: 'delivery',
    plainHint: 'What to repeat or avoid next time—this is how the org gets better on every implementation.',
  },
  {
    id: 'agents',
    label: 'AI Agents',
    icon: '🤖',
    group: 'ai',
    plainHint: 'Run AI-assisted tasks (documents, analysis, communications) with your engagement context applied.',
  },
] as const;

type TabId = (typeof tabs)[number]['id'];

const TAB_IDS = new Set<string>(tabs.map((t) => t.id));

function resolveTabId(raw: string | null | undefined, fallback: TabId = 'scope'): TabId {
  if (raw && TAB_IDS.has(raw)) return raw as TabId;
  return fallback;
}

export function EngagementTabs({ engagementId, initialTab }: EngagementTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabId>(() =>
    resolveTabId(initialTab ?? searchParams.get('tab'))
  );

  useEffect(() => {
    setActiveTab(resolveTabId(searchParams.get('tab') ?? initialTab));
  }, [searchParams, initialTab]);

  function selectTab(id: TabId) {
    setActiveTab(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', id);
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  const activeHint = tabs.find((t) => t.id === activeTab)?.plainHint;

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-border mb-2">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              title={`${tab.label}: ${tab.plainHint}`}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              <span className="text-xs" aria-hidden>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeHint && (
        <p className="text-xs text-muted-foreground mb-6 max-w-3xl leading-relaxed">{activeHint}</p>
      )}

      {/* Tab content */}
      <div>
        {activeTab === 'scope' && <ScopeTab engagementId={engagementId} />}
        {activeTab === 'stakeholders' && <StakeholdersTab engagementId={engagementId} />}
        {activeTab === 'decisions' && <DecisionsTab engagementId={engagementId} />}
        {activeTab === 'raci' && <RaciTab engagementId={engagementId} />}
        {activeTab === 'kickoff' && <ChecklistTab engagementId={engagementId} checklistType="kickoff" />}
        {activeTab === 'golive' && <ChecklistTab engagementId={engagementId} checklistType="go_live" />}
        {activeTab === 'time' && <TimeEntriesTab engagementId={engagementId} />}
        {activeTab === 'budget' && <BudgetTab engagementId={engagementId} />}
        {activeTab === 'resources' && <ResourcesTab engagementId={engagementId} />}
        {activeTab === 'plan' && <ProjectPlanTab engagementId={engagementId} />}
        {activeTab === 'health' && <HealthTab engagementId={engagementId} />}
        {activeTab === 'risks' && <RiskSignalsTab engagementId={engagementId} />}
        {activeTab === 'updates' && <ClientUpdatesTab engagementId={engagementId} />}
        {activeTab === 'trends' && <DeliveryTrendsTab engagementId={engagementId} />}
        {activeTab === 'reports' && <ReportsTab engagementId={engagementId} />}
        {activeTab === 'lessons' && <LessonsTab engagementId={engagementId} />}
        {activeTab === 'agents' && <AgentsTab engagementId={engagementId} />}
      </div>
    </div>
  );
}
