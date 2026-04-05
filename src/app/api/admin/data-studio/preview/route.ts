export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  DATA_STUDIO_MAX_ROWS,
  getStudioTableDef,
} from '@/lib/admin/data-studio-catalog';
import { requireOrgAdmin } from '@/lib/admin/require-admin';

interface PreviewBody {
  orgId: string;
  table: string;
  limit?: number;
  offset?: number;
  engagementId?: string | null;
  sortAscending?: boolean;
}

async function engagementBelongsToOrg(
  supabase: Awaited<ReturnType<typeof createClient>>,
  engagementId: string,
  orgId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('engagements')
    .select('id')
    .eq('id', engagementId)
    .eq('org_id', orgId)
    .maybeSingle();
  return !!data;
}

/**
 * Safe read-only preview: allowlisted tables only, org- or global-catalog scoped, capped rows.
 * Uses the user’s session so RLS still applies.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json()) as PreviewBody;
    const { orgId, table, engagementId } = body;
    if (!orgId || !table) {
      return NextResponse.json({ error: 'orgId and table are required' }, { status: 400 });
    }

    const gate = await requireOrgAdmin(supabase, user.id, orgId);
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const def = getStudioTableDef(table);
    if (!def) return NextResponse.json({ error: 'Unknown or unsupported table' }, { status: 400 });

    let limit = Number(body.limit) || 100;
    if (limit < 1) limit = 1;
    if (limit > DATA_STUDIO_MAX_ROWS) limit = DATA_STUDIO_MAX_ROWS;
    const offset = Math.max(0, Number(body.offset) || 0);
    const ascending = body.sortAscending === true;

    if (engagementId && def.hasEngagementId) {
      const ok = await engagementBelongsToOrg(supabase, engagementId, orgId);
      if (!ok) {
        return NextResponse.json({ error: 'Engagement not found in this workspace' }, { status: 400 });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (supabase as any).from(def.name).select('*');

    if (def.filterMode === 'org_id') {
      q = q.eq('org_id', orgId);
      if (engagementId && def.hasEngagementId) {
        q = q.eq('engagement_id', engagementId);
      }
    } else if (def.filterMode === 'current_org_row') {
      q = q.eq('id', orgId);
    }
    // global_catalog: no org filter

    if (def.orderColumn) {
      q = q.order(def.orderColumn, { ascending });
    }

    q = q.range(offset, offset + limit - 1);

    const { data, error } = await q;

    if (error) {
      console.error('Data Studio preview error', def.name, error);
      return NextResponse.json(
        { error: 'Could not load preview. Your role may not allow this table, or the sort column may be missing on some rows.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      rows: data ?? [],
      table: def.name,
      title: def.title,
      limit,
      offset,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Preview failed' }, { status: 500 });
  }
}
