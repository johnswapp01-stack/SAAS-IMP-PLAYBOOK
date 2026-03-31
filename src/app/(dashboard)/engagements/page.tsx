import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

const healthColors = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusLabels: Record<string, string> = {
  kickoff: 'Kickoff',
  in_progress: 'In Progress',
  uat: 'UAT',
  go_live: 'Go-Live',
  complete: 'Complete',
  on_hold: 'On Hold',
};

export default async function EngagementsPage() {
  const supabase = await createClient();

  const { data: engagements, error } = await supabase
    .from('engagements')
    .select('*')
    .order('updated_at', { ascending: false });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Engagements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {engagements?.length ?? 0} total engagements
          </p>
        </div>
        <Link
          href="/engagements/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + New Engagement
        </Link>
      </div>

      {/* View toggle — placeholder for kanban/timeline */}
      <div className="flex items-center gap-2 mb-4">
        <button className="px-3 py-1.5 text-sm rounded-md bg-primary/10 text-primary font-medium">
          Table
        </button>
        <button className="px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:bg-accent transition-colors">
          Kanban
        </button>
        <button className="px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:bg-accent transition-colors">
          Timeline
        </button>
      </div>

      {/* Table */}
      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load engagements. Make sure Supabase is configured and the
          migrations have been applied.
        </div>
      ) : !engagements || engagements.length === 0 ? (
        <div className="rounded-lg border border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No engagements yet. Create your first one to get started.
          </p>
          <Link
            href="/engagements/new"
            className="inline-flex bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            + New Engagement
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Health
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Go-Live
                </th>
              </tr>
            </thead>
            <tbody>
              {engagements.map((eng) => (
                <tr
                  key={eng.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <Link
                      href={`/engagements/${eng.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {eng.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {eng.customer_name || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                      {statusLabels[eng.status] || eng.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        healthColors[eng.health as keyof typeof healthColors] || ''
                      }`}
                    >
                      {eng.health === 'green' ? '🟢' : eng.health === 'yellow' ? '🟡' : '🔴'}{' '}
                      {eng.health?.charAt(0).toUpperCase() + eng.health?.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {eng.target_go_live || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
