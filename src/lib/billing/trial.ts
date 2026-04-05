import type Stripe from 'stripe';

/** Calendar days for a new workspace on Free (Settings trial banner). */
export const DEFAULT_WORKSPACE_TRIAL_DAYS = 30;

/** ISO timestamp when a newly created org’s workspace trial ends (UTC). */
export function newWorkspaceTrialEndsAtIso(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + DEFAULT_WORKSPACE_TRIAL_DAYS);
  return d.toISOString();
}

/**
 * Stripe is source of truth while a subscription is trialing; otherwise no trial end in DB.
 */
export function trialEndsAtIsoFromSubscription(sub: Stripe.Subscription): string | null {
  if (sub.status === 'trialing' && sub.trial_end != null) {
    return new Date(sub.trial_end * 1000).toISOString();
  }
  return null;
}
