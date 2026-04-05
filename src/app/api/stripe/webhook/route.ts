export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPlanByPriceId, getStripe } from '@/lib/stripe/client';
import { trialEndsAtIsoFromSubscription } from '@/lib/billing/trial';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.org_id;
        const planKey = session.metadata?.plan_key;
        if (!orgId || !planKey) break;

        const { data: org } = await supabaseAdmin.from('organizations').select('settings').eq('id', orgId).single();
        const updatedSettings = {
          ...((org?.settings as object) ?? {}),
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        };

        let trialEndsAt: string | null = null;
        const subId = session.subscription;
        if (typeof subId === 'string') {
          const subscription = await getStripe().subscriptions.retrieve(subId);
          trialEndsAt = trialEndsAtIsoFromSubscription(subscription);
        }

        await supabaseAdmin
          .from('organizations')
          .update({
            plan: planKey as 'pro' | 'team',
            settings: updatedSettings,
            trial_ends_at: trialEndsAt,
          })
          .eq('id', orgId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata?.org_id;
        if (!orgId) break;

        const priceId = subscription.items.data[0]?.price.id;
        const planKey = priceId ? getPlanByPriceId(priceId) : null;
        const trialEndsAt = trialEndsAtIsoFromSubscription(subscription);

        const patch: Record<string, unknown> = { trial_ends_at: trialEndsAt };
        if (planKey) patch.plan = planKey;

        if (subscription.cancel_at_period_end) {
          const { data: orgRow } = await supabaseAdmin.from('organizations').select('settings').eq('id', orgId).single();
          patch.settings = {
            ...((orgRow?.settings as object) ?? {}),
            cancel_at: subscription.cancel_at,
          };
        }

        await supabaseAdmin.from('organizations').update(patch).eq('id', orgId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata?.org_id;
        if (!orgId) break;
        await supabaseAdmin
          .from('organizations')
          .update({ plan: 'free', trial_ends_at: null })
          .eq('id', orgId);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        console.log('Invoice paid:', invoice.id, 'subscription:', subId, 'amount:', invoice.amount_paid);
        // Log billing event to activity_log if we can resolve the org
        if (subId) {
          const { data: orgs } = await supabaseAdmin
            .from('organizations')
            .select('id, settings')
            .filter('settings->>stripe_subscription_id', 'eq', subId)
            .limit(1);
          if (orgs && orgs.length > 0) {
            await supabaseAdmin.from('activity_log').insert({
              org_id: orgs[0].id,
              entity_type: 'billing',
              entity_id: invoice.id,
              action: 'invoice_paid',
              metadata: { amount: invoice.amount_paid, currency: invoice.currency, period_end: invoice.period_end },
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        console.error('Payment failed for customer:', invoice.customer);
        const failSubId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (failSubId) {
          const { data: orgs } = await supabaseAdmin
            .from('organizations')
            .select('id')
            .filter('settings->>stripe_subscription_id', 'eq', failSubId)
            .limit(1);
          if (orgs && orgs.length > 0) {
            await supabaseAdmin.from('activity_log').insert({
              org_id: orgs[0].id,
              entity_type: 'billing',
              entity_id: invoice.id,
              action: 'payment_failed',
              metadata: { amount: invoice.amount_due, currency: invoice.currency, attempt: invoice.attempt_count },
            });
          }
        }
        break;
      }

      default:
        console.log('Unhandled Stripe event:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
