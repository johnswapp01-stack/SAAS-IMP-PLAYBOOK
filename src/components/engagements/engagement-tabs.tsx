'use client';

import { useState } from 'react';
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
}

const tabs = [
  { id: 'scope', label: 'Scope', icon: '🎯', group: 'delivery' },
  { id: 'stakeholders', label: 'Stakeholders', icon: '👥', group: 'delivery' },
  { id: 'decisions', label: 'Decisions', icon: '⚖️', group: 'delivery' },
  { id: 'raci', label: 'RACI', icon: '📊', group: 'delivery' },
  { id: 'kickoff', label: 'Kickoff', icon: '🚀', group: 'delivery' },
  { id: 'golive', label: 'Go-Live', icon: '✅', group: 'delivery' },
  { id: 'time', label: 'Time', icon: '⏱️', group: 'ops' },
  { id: 'budget', label: 'Budget', icon: '💰', group: 'ops' },
  { id: 'resources', label: 'Resources', icon: '👤', group: 'ops' },
  { id: 'plan', label: 'Plan', icon: '📅', group: 'governance' },
  { id: 'health', label: 'Health', icon: '💚', group: 'governance' },
  { id: 'risks', label: 'Risks', icon: '🛡️', group: 'governance' },
  { id: 'updates', label: 'Updates', icon: '📨', group: 'governance' },
  { id: 'trends', label: 'Trends', icon: '📈', group: 'governance' },
  { id: 'reports', label: 'Reports', icon: '📄', group: 'delivery' },
  { id: 'lessons', label: 'Lessons', icon: '💡', group: 'delivery' },
  { id: 'agents', label: 'AI Agents', icon: '🤖', group: 'ai' },
] as const;

type TabId = typeof tabs[number]['id'];

export function EngagementTabs({ engagementId }: EngagementTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('scope');

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              <span className="text-xs">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

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
