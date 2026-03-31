'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface EngagementTabsProps {
  engagementId: string;
}

const tabs = [
  { id: 'scope', label: 'Scope (MoSCoW)', icon: '🎯' },
  { id: 'stakeholders', label: 'Stakeholders', icon: '👥' },
  { id: 'decisions', label: 'Decisions', icon: '⚖️' },
  { id: 'raci', label: 'RACI', icon: '📊' },
  { id: 'kickoff', label: 'Kickoff', icon: '🚀' },
  { id: 'golive', label: 'Go-Live', icon: '✅' },
  { id: 'reports', label: 'Reports', icon: '📄' },
  { id: 'lessons', label: 'Lessons', icon: '💡' },
  { id: 'agents', label: 'AI Agents', icon: '🤖' },
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
        {activeTab === 'scope' && <ScopeTabPlaceholder engagementId={engagementId} />}
        {activeTab === 'stakeholders' && <TabPlaceholder name="Stakeholders" description="Track stakeholder influence, communication preferences, and concerns." />}
        {activeTab === 'decisions' && <TabPlaceholder name="Decisions" description="Log decisions with context, impact, and reversibility." />}
        {activeTab === 'raci' && <TabPlaceholder name="RACI Matrix" description="Assign Responsible, Accountable, Consulted, and Informed roles per deliverable." />}
        {activeTab === 'kickoff' && <TabPlaceholder name="Kickoff Checklist" description="Track pre-kickoff, during-kickoff, and post-kickoff tasks." />}
        {activeTab === 'golive' && <TabPlaceholder name="Go-Live Checklist" description="Phase-gated checklist from Pre-UAT through Post-Launch." />}
        {activeTab === 'reports' && <TabPlaceholder name="Status Reports" description="Generate and manage internal, customer-facing, and executive reports." />}
        {activeTab === 'lessons' && <TabPlaceholder name="Lessons Learned" description="Capture findings, categorize by type, and track recommendations." />}
        {activeTab === 'agents' && <TabPlaceholder name="AI Agents" description="View agent tasks, artifacts, and execution history for this engagement." />}
      </div>
    </div>
  );
}

function ScopeTabPlaceholder({ engagementId }: { engagementId: string }) {
  return (
    <div className="rounded-lg border border-border p-8 text-center">
      <div className="text-3xl mb-3">🎯</div>
      <h3 className="font-semibold text-lg mb-2">MoSCoW Scope Tracker</h3>
      <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
        Track requirements by priority (Must / Should / Could / Won&apos;t).
        Drag and drop to reorder. Filter by status and priority.
      </p>
      <div className="flex items-center justify-center gap-2">
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Must</span>
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Should</span>
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">Could</span>
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">Won&apos;t</span>
      </div>
      <button className="mt-6 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
        + Add Scope Item
      </button>
    </div>
  );
}

function TabPlaceholder({ name, description }: { name: string; description: string }) {
  return (
    <div className="rounded-lg border border-border border-dashed p-8 text-center">
      <h3 className="font-semibold text-lg mb-2">{name}</h3>
      <p className="text-muted-foreground text-sm max-w-md mx-auto">{description}</p>
      <p className="mt-4 text-xs text-muted-foreground">Phase 2 — coming next</p>
    </div>
  );
}
