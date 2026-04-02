'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { OrgProvider } from '@/hooks/use-org';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import type { User } from '@supabase/supabase-js';

interface DashboardShellProps {
  children: React.ReactNode;
  user: User;
  hasOrg: boolean;
}

export function DashboardShell({ children, user, hasOrg }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Redirect to onboarding if no org (unless already there)
  useEffect(() => {
    if (!hasOrg && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [hasOrg, pathname, router]);

  // If user has no org and is not on onboarding, show nothing while redirecting
  if (!hasOrg && pathname !== '/onboarding') {
    return null;
  }

  return (
    <OrgProvider userId={user.id}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileNav user={user} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6">{children}</div>
          </main>
        </div>
      </div>
    </OrgProvider>
  );
}
