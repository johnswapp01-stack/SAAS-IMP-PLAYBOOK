'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useOrg } from '@/hooks/use-org';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface SidebarProps {
  user: User;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: String.fromCodePoint(0x1F3E0),
    description: 'Overview & KPIs',
  },
  {
    name: 'Engagements',
    href: '/engagements',
    icon: String.fromCodePoint(0x1F4CB),
    description: 'All engagements',
  },
  {
    name: 'Operations',
    href: '/governance',
    icon: String.fromCodePoint(0x1F4CA),
    description: 'Time, cost, resources & compliance',
  },
  {
    name: 'AI Agents',
    href: '/agents',
    icon: String.fromCodePoint(0x1F916),
    description: 'Agent console & tasks',
  },
  {
    name: 'Intelligence',
    href: '/intelligence',
    icon: String.fromCodePoint(0x1F9E0),
    description: 'Self-learning & self-healing',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: String.fromCodePoint(0x2699, 0xFE0F),
    description: 'Organization & profile',
  },
  {
    name: 'Help & Support',
    href: '/support',
    icon: String.fromCodePoint(0x2753),
    description: 'Assistant, guides, and admin Data Studio',
  },
];

const planColors: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  team: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  enterprise: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { org, loading: orgLoading } = useOrg();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'User';

  const plan = org?.plan || 'free';
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border">
      {/* Org header */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-sm">
            {org?.name?.charAt(0)?.toUpperCase() || 'IP'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">
            {orgLoading ? '...' : org?.name || 'Implementation Pro'}
          </p>
          <span className={cn('inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium', planColors[plan])}>
            {planLabel} Plan
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              title={`${item.name}: ${item.description}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            title="Sign out"
          >
            {String.fromCodePoint(0x2197)}
          </button>
        </div>
      </div>
    </aside>
  );
}
