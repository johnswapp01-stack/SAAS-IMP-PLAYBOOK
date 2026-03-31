import { createClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Profile */}
      <section className="rounded-lg border border-border p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Profile</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user?.email || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Name</span>
            <span>{user?.user_metadata?.full_name || '—'}</span>
          </div>
        </div>
      </section>

      {/* Organization */}
      <section className="rounded-lg border border-border p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Organization</h2>
        <p className="text-sm text-muted-foreground">
          Create or join an organization to start managing engagements with your team.
        </p>
        <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          Create Organization
        </button>
      </section>

      {/* Plan */}
      <section className="rounded-lg border border-border p-6">
        <h2 className="font-semibold text-lg mb-4">Plan</h2>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
            Free
          </span>
          <span className="text-sm text-muted-foreground">
            2 engagements · 1 user · No AI agents
          </span>
        </div>
        <button
          className="mt-4 px-4 py-2 rounded-md text-sm font-medium border border-input hover:bg-accent transition-colors"
          disabled
        >
          Upgrade — coming soon
        </button>
      </section>
    </div>
  );
}
