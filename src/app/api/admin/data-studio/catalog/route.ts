export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchStudioTables } from '@/lib/admin/data-studio-catalog';
import { requireOrgAdmin } from '@/lib/admin/require-admin';

/** List / search Data Studio table definitions (schema + plain-language tooltips). */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const orgId = req.nextUrl.searchParams.get('orgId');
    if (!orgId) return NextResponse.json({ error: 'orgId is required' }, { status: 400 });

    const gate = await requireOrgAdmin(supabase, user.id, orgId);
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const q = req.nextUrl.searchParams.get('q') || '';
    const tables = searchStudioTables(q);

    return NextResponse.json({ tables });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load catalog' }, { status: 500 });
  }
}
