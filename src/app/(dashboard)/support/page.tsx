'use client';

import Link from 'next/link';
import { useOrg } from '@/hooks/use-org';
import { SupportChat } from '@/components/support/support-chat';

export default function SupportPage() {
  const { role } = useOrg();
  const isAdmin = role === 'owner' || role === 'admin';

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Help &amp; Support</h1>
        <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
          This area is written for <strong>everyday users</strong>—not engineers. Use the assistant for “how do
          I…?” questions. It pulls from a built-in help library and explains things in plain language.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Assistant</h2>
        <SupportChat />
      </section>

      {isAdmin && (
        <section className="rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Workspace admins</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Setup checklist</strong> walks through env checks, Supabase migrations, Stripe webhooks, and
            health monitoring. <strong>Data Studio</strong> is for table documentation, previews, and exports.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admin/setup-checklist"
              className="inline-flex text-sm font-medium text-primary hover:underline"
            >
              Open setup checklist →
            </Link>
            <Link
              href="/admin/data-studio"
              className="inline-flex text-sm font-medium text-primary hover:underline"
            >
              Open Admin Data Studio →
            </Link>
          </div>
        </section>
      )}

      <section className="text-xs text-muted-foreground space-y-2 border-t border-border pt-6">
        <p>
          <strong>Human support:</strong> For security incidents, legal requests, or billing disputes, contact your
          organization owner or your Implementation Pro support channel—not only this chat.
        </p>
      </section>
    </div>
  );
}
