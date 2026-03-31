export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS, type PlanKey } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { planKey, orgId } = await req.json() as { planKey: PlanKey; orgId: string };
    if (planKey === 'free') return NextResponse.json({ error: 'Free plan does not require checkout' }, { status: 400 });

    const plan = PLANS[planKey];
    if (!plan.priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const { data: org } = await supabase.from('organizations').select('settings').eq('id', orgId).single();
    const existingCustomerId = (org?.settings as Record<string, string>)?.stripe_customer_id;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: existingCustomerId || undefined,
      customer_email: existingCustomerId ? undefined : user.email,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?billing=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?billing=cancelled`,
      metadata: { org_id: orgId, user_id: user.id, plan_key: planKey },
      subscription_data: { metadata: { org_id: orgId, plan_key: planKey } },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
