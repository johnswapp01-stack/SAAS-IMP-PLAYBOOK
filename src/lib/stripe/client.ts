import Stripe from 'stripe';

// Lazy initialization - prevents build-time throw when env var is not set.
// Stripe is only instantiated when an API route actually calls getStripe().
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    });
  }
  return _stripe;
}

// Typed convenience proxy - explicit params avoid Stripe overload resolution issues.
export const stripe = {
  checkout: {
    sessions: {
      create: (
        params: Stripe.Checkout.SessionCreateParams,
        options?: Stripe.RequestOptions,
      ) => getStripe().checkout.sessions.create(params, options),
    },
  },
  billingPortal: {
    sessions: {
      create: (
        params: Stripe.BillingPortal.SessionCreateParams,
        options?: Stripe.RequestOptions,
      ) => getStripe().billingPortal.sessions.create(params, options),
    },
  },
  webhooks: {
    // Only exposing the 3 required params - tolerance/cryptoProvider not needed for standard webhook validation.
    constructEvent: (
      payload: string | Buffer,
      header: string | string[],
      secret: string,
    ) => getStripe().webhooks.constructEvent(payload, header, secret),
  },
};

export const PLANS = {
  free: {
    name: 'Free',
    description: 'Get started with up to 2 engagements',
    price: 0,
    priceId: null,
    features: ['2 engagements', '1 user', 'All core templates', 'Basic status reports', 'Community support'],
    limits: { engagements: 2, users: 1, agentTasksPerMonth: 0 },
  },
  pro: {
    name: 'Pro',
    description: 'For solo consultants running multiple engagements',
    price: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
    features: ['Unlimited engagements', '3 users', 'All interactive templates', 'AI status report generation', '50 AI agent tasks/month', 'Email support'],
    limits: { engagements: -1, users: 3, agentTasksPerMonth: 50 },
  },
  team: {
    name: 'Team',
    description: 'For implementation teams and PS orgs',
    price: 149,
    priceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID!,
    features: ['Unlimited engagements', '25 users', 'All AI agent types', '500 AI agent tasks/month', 'Operations Automation', 'Delivery Governance', 'Priority support'],
    limits: { engagements: -1, users: 25, agentTasksPerMonth: 500 },
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanKey | null {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return 'pro';
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID) return 'team';
  return null;
}
