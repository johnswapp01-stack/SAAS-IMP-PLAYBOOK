import type { EngagementStatus } from '@/types';

/** Shown in-app to reinforce category: implementation management vs generic PM. */
export const IMPLEMENTATION_POSITIONING_LINE =
  'This product is for SaaS implementation delivery (scope, go-live, governance)—not a generic task board.';

export interface EngagementNextStep {
  title: string;
  description: string;
  /** Path relative to app root, includes engagement id */
  href: string;
}

/**
 * Suggested next actions by lifecycle phase. Links use `?tab=`; EngagementTabs syncs the tab from the query string.
 */
export function getNextStepsForEngagement(
  engagementId: string,
  status: EngagementStatus
): EngagementNextStep[] {
  const base = `/engagements/${engagementId}`;

  switch (status) {
    case 'kickoff':
      return [
        {
          title: 'Run the kickoff checklist',
          description: 'Structured items so discovery and alignment happen before build work piles up.',
          href: `${base}?tab=kickoff`,
        },
        {
          title: 'Add stakeholders',
          description: 'Who decides, who needs updates, and how they want to hear from you.',
          href: `${base}?tab=stakeholders`,
        },
      ];
    case 'in_progress':
      return [
        {
          title: 'Review scope (MoSCoW)',
          description: 'Keep must-haves visible so trade-offs stay explicit, not implied.',
          href: `${base}?tab=scope`,
        },
        {
          title: 'Log decisions',
          description: 'Capture agreements while they are fresh—reduces rework and disputes later.',
          href: `${base}?tab=decisions`,
        },
      ];
    case 'uat':
      return [
        {
          title: 'Go-live checklist',
          description: 'Gate customer-facing cutover with a consistent readiness list.',
          href: `${base}?tab=golive`,
        },
        {
          title: 'Review risks',
          description: 'Surface what could still block launch while you still have room to act.',
          href: `${base}?tab=risks`,
        },
      ];
    case 'go_live':
      return [
        {
          title: 'Client updates',
          description: 'Send a clear milestone or countdown update from approved content.',
          href: `${base}?tab=updates`,
        },
        {
          title: 'Capture lessons learned',
          description: 'Short notes now compound into a better playbook on the next engagement.',
          href: `${base}?tab=lessons`,
        },
      ];
    case 'on_hold':
      return [
        {
          title: 'Document the pause',
          description: 'Record what stopped work and what will restart it so the team stays aligned.',
          href: `${base}?tab=decisions`,
        },
      ];
    case 'complete':
      return [
        {
          title: 'Finish lessons learned',
          description: 'Close the loop so the next implementation starts smarter.',
          href: `${base}?tab=lessons`,
        },
      ];
    default:
      return [];
  }
}
