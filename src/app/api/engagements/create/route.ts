export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface CreateEngagementBody {
  name: string;
  customer_name: string;
  description?: string;
  target_go_live?: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current org membership
    const { data: membership, error: memErr } = await supabase
      .from('org_members')
      .select('org_id, role')
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .order('accepted_at', { ascending: false })
      .limit(1)
      .single();

    if (memErr || !membership) {
      return NextResponse.json(
        { error: 'No organization found. Please create or join an organization first.' },
        { status: 403 }
      );
    }

    // Only owners, admins, and members can create engagements (not viewers)
    if (membership.role === 'viewer') {
      return NextResponse.json(
        { error: 'Viewers cannot create engagements. Ask an admin to upgrade your role.' },
        { status: 403 }
      );
    }

    // Plan limit enforcement
    const { data: orgData } = await supabase
      .from('organizations')
      .select('plan')
      .eq('id', membership.org_id)
      .single();

    const plan = orgData?.plan || 'free';

    const planLimits: Record<string, { engagements: number; users: number }> = {
      free: { engagements: 2, users: 1 },
      pro: { engagements: -1, users: 3 },
      team: { engagements: -1, users: 25 },
      enterprise: { engagements: -1, users: -1 },
    };

    const limits = planLimits[plan] || planLimits.free;

    if (limits.engagements > 0) {
      const { count } = await supabase
        .from('engagements')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', membership.org_id)
        .neq('status', 'complete');

      if ((count || 0) >= limits.engagements) {
        return NextResponse.json(
          {
            error: `Your ${plan} plan allows ${limits.engagements} active engagement${limits.engagements !== 1 ? 's' : ''}. Upgrade your plan to create more.`,
            code: 'PLAN_LIMIT_REACHED',
          },
          { status: 403 }
        );
      }
    }

    const body = (await req.json()) as CreateEngagementBody;

    // Validate required fields
    if (!body.name || body.name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Engagement name must be at least 2 characters.' },
        { status: 400 }
      );
    }

    if (!body.customer_name || body.customer_name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Customer name must be at least 2 characters.' },
        { status: 400 }
      );
    }

    // Validate go-live date if provided
    if (body.target_go_live) {
      const goLiveDate = new Date(body.target_go_live);
      if (isNaN(goLiveDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid go-live date format.' },
          { status: 400 }
        );
      }
    }

    // Create the engagement
    const { data: engagement, error: createErr } = await supabase
      .from('engagements')
      .insert({
        org_id: membership.org_id,
        name: body.name.trim(),
        customer_name: body.customer_name.trim(),
        description: body.description?.trim() || null,
        status: 'kickoff',
        health: 'green',
        owner_id: user.id,
        start_date: new Date().toISOString().split('T')[0],
        target_go_live: body.target_go_live || null,
        tags: [],
      })
      .select()
      .single();

    if (createErr) throw createErr;

    return NextResponse.json({ engagement });
  } catch (error) {
    console.error('Engagement creation error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create engagement',
      },
      { status: 500 }
    );
  }
}
