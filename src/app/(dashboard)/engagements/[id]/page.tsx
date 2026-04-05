import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EngagementHeader } from '@/components/engagements/engagement-header';
import { EngagementTabs } from '@/components/engagements/engagement-tabs';
import type { Engagement } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function EngagementDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab: tabFromUrl } = await searchParams;
  const supabase = await createClient();

  const { data: engagement, error } = await supabase
    .from('engagements')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !engagement) {
    notFound();
  }

  return (
    <div>
      <EngagementHeader engagement={engagement as Engagement} />
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted mt-4" aria-hidden />}>
        <EngagementTabs engagementId={engagement.id} initialTab={tabFromUrl} />
      </Suspense>
    </div>
  );
}
