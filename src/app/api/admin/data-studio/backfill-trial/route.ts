export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { newWorkspaceTrialEndsAtIso } from '@/lib/billing/trial';
import { requireOrgAdmin } from '@/lib/admin/require-admin';

/**
 * One-click backfill: set trial_ends_at on the current org when it is null
 * (same end date as new org signup — 30 calendar days from “now” in UTC).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orgId } = (await req.json()) as { orgId?: string };
    if (!orgId) return NextResponse.json({ error: 'orgId is required' }, { status: 400 });

    const gate = await requireOrgAdmin(supabase, user.id, orgId);
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const { data: org, error: fetchErr } = await supabase
      .from('organizations')
      .select('id, trial_ends_at')
      .eq('id', orgId)
      .single();

    if (fetchErr || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    if (org.trial_ends_at) {
      return NextResponse.json({
        updated: false,
        message: 'This workspace already has a trial end date. No change made.',
        trial_ends_at: org.trial_ends_at,
      });
    }

    const trialEndsAt = newWorkspaceTrialEndsAtIso();
    const { error: updErr } = await supabase
      .from('organizations')
      .update({ trial_ends_at: trialEndsAt })
      .eq('id', orgId);

    if (updErr) {
      console.error(updErr);
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    return NextResponse.json({
      updated: true,
      trial_ends_at: trialEndsAt,
      message: 'Trial end date set for this workspace. Refresh Settings to see the banner.',
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 });
  }
}
