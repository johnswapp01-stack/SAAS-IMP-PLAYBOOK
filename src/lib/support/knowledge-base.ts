/**
 * Lightweight support knowledge (retrieval-augmented generation without a vector DB).
 * Articles are matched by simple keyword overlap against the user message.
 */

export interface SupportArticle {
  id: string;
  title: string;
  keywords: string[];
  body: string;
}

export const SUPPORT_ARTICLES: SupportArticle[] = [
  {
    id: 'what-is-engagement',
    title: 'What is an engagement?',
    keywords: ['engagement', 'project', 'customer', 'implementation', 'start'],
    body: `An engagement is one customer’s implementation: one place to track scope, people, checklists, go-live, and reports. Open Engagements to see the list, then pick a name to open its tabs (Scope, Stakeholders, Kickoff checklist, and more).`,
  },
  {
    id: 'scope-moscow',
    title: 'What is Scope / MoSCoW?',
    keywords: ['scope', 'moscow', 'must', 'should', 'could', 'priority', 'requirement'],
    body: `MoSCoW sorts requirements into Must have, Should have, Could have, and Won’t (this time). It keeps scope conversations honest: what ships vs what waits. Use the Scope tab inside an engagement.`,
  },
  {
    id: 'raci',
    title: 'What is RACI?',
    keywords: ['raci', 'responsible', 'accountable', 'consulted', 'informed', 'roles'],
    body: `RACI says who is Responsible (does the work), Accountable (approves), Consulted (gives input), and Informed (kept up to date). It reduces “I thought someone else owned that” problems.`,
  },
  {
    id: 'ai-agents',
    title: 'AI agents and limits',
    keywords: ['agent', 'ai', 'task', 'limit', 'run', 'pro', 'team', 'execute'],
    body: `AI agents help draft documents, reports, and analysis using your engagement context. Free plan does not run agents. Pro and Team include monthly completed-task limits shown under Settings → Plan & Billing and Workspace usage. If you hit the limit, upgrade or wait until next month.`,
  },
  {
    id: 'billing',
    title: 'Billing and trials',
    keywords: ['billing', 'plan', 'stripe', 'pay', 'invoice', 'trial', 'upgrade'],
    body: `Owners and admins can change plans under Settings → Plan & Billing. Upsell uses Stripe Checkout; managing payment methods uses the Stripe portal. A trial end date, when set, appears as a banner on Settings.`,
  },
  {
    id: 'operations',
    title: 'Operations (time, budget, compliance)',
    keywords: ['operations', 'time', 'budget', 'compliance', 'hours', 'governance'],
    body: `Operations groups time entries, budget, resources, and compliance so you can steer delivery beyond the task list. Open Operations in the main menu.`,
  },
  {
    id: 'data-studio',
    title: 'Data Studio (admins)',
    keywords: ['export', 'report', 'csv', 'excel', 'data', 'table', 'admin'],
    body: `Owners and admins can use Data Studio under Help & Support area (Admin Data Studio): search tables, read what each stores, preview a subset of rows, and download CSV or Excel. This only shows data your workspace is allowed to see.`,
  },
  {
    id: 'privacy',
    title: 'What should I avoid pasting in chat?',
    keywords: ['password', 'secret', 'private', 'security', 'paste', 'safe'],
    body: `Do not paste passwords, API keys, full customer contracts, or government IDs into the assistant. Share only what you are comfortable having processed by the AI service your organization uses. For account-specific billing problems, contact your administrator or support channel.`,
  },
];

const STOPWORDS = new Set(['the', 'a', 'an', 'to', 'for', 'of', 'and', 'or', 'is', 'in', 'it', 'my', 'how', 'what', 'why', 'when', 'where', 'do', 'i', 'we', 'you', 'on', 'with']);

function tokenize(msg: string): string[] {
  return msg
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/** Pick top articles by keyword and token overlap; always include a short platform hint. */
export function retrieveSupportContext(userMessage: string, maxArticles = 4): string {
  const lower = userMessage.toLowerCase();
  const tokens = tokenize(userMessage);

  const scored = SUPPORT_ARTICLES.map((a) => {
    let score = 0;
    for (const k of a.keywords) {
      if (lower.includes(k)) score += 3;
    }
    for (const t of tokens) {
      if (a.keywords.some((k) => k.includes(t) || t.includes(k))) score += 1;
      if (a.title.toLowerCase().includes(t)) score += 1;
      if (a.body.toLowerCase().includes(t)) score += 0.25;
    }
    return { a, score };
  })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, maxArticles);

  const blocks = scored.map(({ a }) => `### ${a.title}\n${a.body}`);

  const intro = `Implementation Pro helps teams run SaaS implementations (not generic to-do lists). Use short questions; answers below are from the product help library.`;

  if (blocks.length === 0) {
    return `${intro}\n\n(No specific help article matched—answer using general product knowledge and plain language.)`;
  }
  return `${intro}\n\n${blocks.join('\n\n')}`;
}
