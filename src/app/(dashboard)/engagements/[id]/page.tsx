import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { EngagementTabs } from '@/components/engagements/engagement-tabs';

interface Props {
  params: { id: string };
}

export default async function EngagementDetailPage({ params }: Props) {
  const supabase = await createClient();

  const { data: engagement, error } = await supabase
    .from('engagements')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !engagement) {
    notFound();
  }

  const healthEmoji =
    engagement.health === 'green' ? '🟢' :
    engagement.health === 'yellow' ? '🟡' : '🔴';

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/engagements" className="hover:text-foreground transition-colors">
          Engagements
        </Link>
        <span>/</span>
        <span className="text-foreground">{engagement.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {engagement.name}
            <span className="text-lg" title={`Health: ${engagement.health}`}>
              {healthEmoji}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {engagement.customer_name || 'No customer specified'}
            {engagement.target_go_live && (
              <span> · Go-live: {engagement.target_go_live}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent transition-colors">
            Edit
          </button>
          <button className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <EngagementTabs engagementId={engagement.id} />
    </div>
  );
}
