'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import type { User } from '@supabase/supabase-js';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: String.fromCodePoint(0x1F3E0),
    description: 'Overview and KPIs across engagements',
  },
  {
    name: 'Engagements',
    href: '/engagements',
    icon: String.fromCodePoint(0x1F4CB),
    description: 'All customer implementation projects',
  },
  {
    name: 'Operations',
    href: '/governance',
    icon: String.fromCodePoint(0x1F4CA),
    description: 'Time, cost, resources, and compliance',
  },
  {
    name: 'AI Agents',
    href: '/agents',
    icon: String.fromCodePoint(0x1F916),
    description: 'Run and review AI-assisted tasks',
  },
  {
    name: 'Intelligence',
    href: '/intelligence',
    icon: String.fromCodePoint(0x1F9E0),
    description: 'Learning and system health signals',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: String.fromCodePoint(0x2699, 0xFE0F),
    description: 'Organization, usage, and billing',
  },
  {
    name: 'Help & Support',
    href: '/support',
    icon: String.fromCodePoint(0x2753),
    description: 'Assistant and admin reporting tools',
  },
];

export function MobileNav({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { org } = useOrg();

  const displayName =
    user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="md:hidden border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">IP</span>
          </div>
          <span className="font-semibold text-sm">{org?.name || 'Implementation Pro'}</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="17" y2="6" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="14" x2="17" y2="14" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-3 py-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={`${item.name}: ${item.description}`}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-start gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <span className="text-base leading-none pt-0.5">{item.icon}</span>
                <span className="min-w-0">
                  <span className="block">{item.name}</span>
                  <span className="block text-[11px] font-normal text-muted-foreground leading-snug mt-0.5">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
          <div className="border-t border-border mt-2 pt-2">
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{displayName}</span>
              <button
                onClick={handleSignOut}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
