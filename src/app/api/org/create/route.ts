export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { newWorkspaceTrialEndsAtIso } from '@/lib/billing/trial';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, slug } = await req.json() as { name: string; slug: string };

    // Validate inputs
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Organization name must be at least 2 characters' }, { status: 400 });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);

    if (!cleanSlug) {
      return NextResponse.json({ error: 'Invalid organization slug' }, { status: 400 });
    }

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'An organization with that name already exists. Try a different name.' }, { status: 409 });
    }

    // Create the org
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({
        name: name.trim(),
        slug: cleanSlug,
        plan: 'free',
        settings: {},
        trial_ends_at: newWorkspaceTrialEndsAtIso(),
      })
      .select()
      .single();

    if (orgErr) throw orgErr;

    // Add creator as owner
    const { error: memErr } = await supabase
      .from('org_members')
      .insert({
        org_id: org.id,
        user_id: user.id,
        role: 'owner',
        invited_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
      });

    if (memErr) throw memErr;

    return NextResponse.json({ org });
  } catch (error) {
    console.error('Org creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create organization' },
      { status: 500 }
    );
  }
}
