import type { SupabaseClient } from '@supabase/supabase-js';
import type { OrgRole } from '@/types';

export type AdminGateResult =
  | { ok: true; orgId: string; role: OrgRole; userId: string }
  | { ok: false; status: number; error: string };

/**
 * Owners and admins may use org-scoped admin tooling (Data Studio, backfill actions).
 */
export async function requireOrgAdmin(
  supabase: SupabaseClient,
  userId: string,
  orgId: string
): Promise<AdminGateResult> {
  const { data: row, error } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .not('accepted_at', 'is', null)
    .maybeSingle();

  if (error) {
    return { ok: false, status: 500, error: error.message };
  }
  if (!row) {
    return { ok: false, status: 403, error: 'Not a member of this organization' };
  }
  const role = row.role as OrgRole;
  if (role !== 'owner' && role !== 'admin') {
    return { ok: false, status: 403, error: 'Owner or admin access required' };
  }
  return { ok: true, orgId, role, userId };
}
