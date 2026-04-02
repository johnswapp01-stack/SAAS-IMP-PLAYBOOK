import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has at least one accepted org membership
  const { data: memberships } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .not('accepted_at', 'is', null)
    .limit(1);

  const hasOrg = !!(memberships && memberships.length > 0);

  return (
    <DashboardShell user={user} hasOrg={hasOrg}>
      {children}
    </DashboardShell>
  );
}
