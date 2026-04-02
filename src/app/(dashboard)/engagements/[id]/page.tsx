import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EngagementHeader } from '@/components/engagements/engagement-header';
import { EngagementTabs } from '@/components/engagements/engagement-tabs';
import type { Engagement } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EngagementDetailPage({ params }: Props) {
  const { id } = await params;
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
      <EngagementTabs engagementId={engagement.id} />
    </div>
  );
}
