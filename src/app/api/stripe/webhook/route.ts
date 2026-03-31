export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPlanByPriceId } from '@/lib/stripe/client';
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
        await supabaseAdmin.from('organizations').update({ plan: planKey as 'pro' | 'team', settings: updatedSettings }).eq('id', orgId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata?.org_id;
        if (!orgId) break;

        const priceId = subscription.items.data[0]?.price.id;
        const planKey = priceId ? getPlanByPriceId(priceId) : null;
        if (planKey) {
          await supabaseAdmin.from('organizations').update({ plan: planKey }).eq('id', orgId);
        }

        if (subscription.cancel_at_period_end) {
          const { data: org } = await supabaseAdmin.from('organizations').select('settings').eq('id', orgId).single();
          await supabaseAdmin.from('organizations').update({ settings: { ...((org?.settings as object) ?? {}), cancel_at: subscription.cancel_at } }).eq('id', orgId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata?.org_id;
        if (!orgId) break;
        await supabaseAdmin.from('organizations').update({ plan: 'free' }).eq('id', orgId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error('Payment failed for customer:', invoice.customer);
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
