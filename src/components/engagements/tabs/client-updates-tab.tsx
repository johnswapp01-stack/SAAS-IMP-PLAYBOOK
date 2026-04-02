'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { ClientUpdate, ClientUpdateType, ClientUpdateStatus } from '@/types';

interface ClientUpdatesTabProps {
  engagementId: string;
}

const typeLabels: Record<ClientUpdateType, { label: string; icon: string }> = {
  weekly_status: { label: 'Weekly Status', icon: '📊' },
  milestone_reached: { label: 'Milestone', icon: '🏁' },
  risk_alert: { label: 'Risk Alert', icon: '⚠️' },
  go_live_countdown: { label: 'Go-Live Countdown', icon: '🚀' },
};

const statusColors: Record<ClientUpdateStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  approved: 'bg-blue-100 text-blue-700',
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export function ClientUpdatesTab({ engagementId }: ClientUpdatesTabProps) {
  const [updates, setUpdates] = useState<ClientUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  // Form state
  const [updateType, setUpdateType] = useState<ClientUpdateType>('weekly_status');
  const [content, setContent] = useState('');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchUpdates = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('client_updates')
      .select('*')
      .eq('engagement_id', engagementId)
      .order('created_at', { ascending: false });
    setUpdates((data || []) as unknown as ClientUpdate[]);
    setLoading(false);
  }, [engagementId]);

  useEffect(() => { fetchUpdates(); }, [fetchUpdates]);

  function resetForm() {
    setUpdateType('weekly_status'); setContent(''); setRecipientEmails('');
    setEditingId(null); setShowForm(false);
  }

  function startNew(type: ClientUpdateType = 'weekly_status') {
    const templates: Record<ClientUpdateType, string> = {
      weekly_status: `Hi team,\n\nHere's your weekly implementation update:\n\n**What was accomplished this week:**\n- \n\n**What's planned for next week:**\n- \n\n**Blockers / Risks:**\n- None\n\n**Overall Health:** Green\n\nLet me know if you have questions.\n\n[YOUR SIGN-OFF]`,
      milestone_reached: `Hi team,\n\nGreat news — we've reached a milestone.\n\n**Milestone:** \n**Completed:** ${new Date().toLocaleDateString()}\n\n**What this means:**\n- \n\n**Next steps:**\n- \n\n[YOUR SIGN-OFF]`,
      risk_alert: `Hi team,\n\nI want to flag a risk on our implementation.\n\n**Risk:** \n**Severity:** \n**Impact if unaddressed:** \n\n**Recommended action:**\n- \n\n**Timeline to resolve:** \n\nLet's discuss this in our next check-in, or sooner if needed.\n\n[YOUR SIGN-OFF]`,
      go_live_countdown: `Hi team,\n\nGo-live countdown update:\n\n**Days to go-live:** \n**Readiness:** \n\n**Open items:**\n- \n\n**Sign-offs needed:**\n- \n\n[YOUR SIGN-OFF]`,
    };
    setUpdateType(type);
    setContent(templates[type]);
    setRecipientEmails('');
    setEditingId(null); setShowForm(true);
  }

  function startEdit(u: ClientUpdate) {
    setUpdateType(u.update_type);
    setContent(u.content);
    setRecipientEmails((u.recipients || []).map((r: any) => r.email || '').filter(Boolean).join(', '));
    setEditingId(u.id); setShowForm(true);
  }

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const recipients = recipientEmails.split(',').map((e) => e.trim()).filter(Boolean).map((email) => ({ email }));

    const payload: any = {
      update_type: updateType,
      content: content.trim(),
      recipients,
    };

    if (editingId) {
      await supabase.from('client_updates').update(payload).eq('id', editingId);
    } else {
      const { data: eng } = await supabase.from('engagements').select('org_id').eq('id', engagementId).single();
      payload.org_id = eng?.org_id;
      payload.engagement_id = engagementId;
      payload.status = 'draft';
      payload.generated_by = 'manual';
      await supabase.from('client_updates').insert(payload);
    }
    resetForm(); setSaving(false); fetchUpdates();
  }

  async function handleStatusChange(id: string, newStatus: ClientUpdateStatus) {
    const supabase = createClient();
    const update: any = { status: newStatus };
    if (newStatus === 'sent') {
      update.sent_at = new Date().toISOString();
    }
    await supabase.from('client_updates').update(update).eq('id', id);
    fetchUpdates();
  }

  async function handleSendEmail(id: string) {
    setSendingId(id);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientUpdateId: id }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(`Send failed: ${result.error || 'Unknown error'}`);
      }
      fetchUpdates();
    } catch (err) {
      alert('Failed to send email. Check that RESEND_API_KEY is configured.');
    } finally {
      setSendingId(null);
    }
  }

  const viewing = viewingId ? updates.find((u) => u.id === viewingId) : null;

  if (loading) {
    return <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Client Updates</h3>
          <p className="text-xs text-muted-foreground">Draft, review, and track client-facing communications.</p>
        </div>
        <div className="flex gap-1">
          {(Object.keys(typeLabels) as ClientUpdateType[]).map((t) => (
            <button key={t} onClick={() => startNew(t)} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent" title={typeLabels[t].label}>
              {typeLabels[t].icon}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Update Type</label>
              <select value={updateType} onChange={(e) => setUpdateType(e.target.value as ClientUpdateType)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {(Object.keys(typeLabels) as ClientUpdateType[]).map((t) => <option key={t} value={t}>{typeLabels[t].label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Recipients (comma-separated emails)</label>
              <input value={recipientEmails} onChange={(e) => setRecipientEmails(e.target.value)} placeholder="rachel@acme.com, david@acme.com" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content *</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving || !content.trim()} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update Draft' : 'Save Draft'}
            </button>
          </div>
        </div>
      )}

      {/* Detail view */}
      {viewing && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span>{typeLabels[viewing.update_type]?.icon}</span>
              <span className="font-medium text-sm">{typeLabels[viewing.update_type]?.label}</span>
              <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', statusColors[viewing.status])}>{viewing.status}</span>
            </div>
            <button onClick={() => setViewingId(null)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm border-t border-border pt-3">
            {viewing.content}
          </div>
          {viewing.recipients.length > 0 && (
            <div className="mt-3 text-xs text-muted-foreground border-t border-border pt-2">
              Recipients: {viewing.recipients.map((r: any) => r.email).join(', ')}
            </div>
          )}
        </div>
      )}

      {updates.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">{String.fromCodePoint(0x1F4E8)}</div>
          <h3 className="font-semibold mb-1">No client updates yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Draft status updates, milestone announcements, and risk alerts to keep your client informed. Each update goes through a draft/approve/send workflow.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {updates.map((u) => (
            <div key={u.id} className="rounded-lg border border-border bg-card p-3 flex items-center gap-3 group hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => setViewingId(u.id === viewingId ? null : u.id)}>
              <span className="text-lg shrink-0">{typeLabels[u.update_type]?.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{typeLabels[u.update_type]?.label}</span>
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', statusColors[u.status])}>{u.status}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{u.content.slice(0, 100).replace(/\n/g, ' ')}...</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(u.created_at).toLocaleDateString()}
                  {u.sent_at && ` · Sent ${new Date(u.sent_at).toLocaleDateString()}`}
                  {u.recipients.length > 0 && ` · ${u.recipients.length} recipient${u.recipients.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
                {u.status === 'draft' && (
                  <button onClick={() => handleStatusChange(u.id, 'approved')} className="px-2 py-1 text-xs rounded border border-blue-200 text-blue-700 hover:bg-blue-50">Approve</button>
                )}
                {u.status === 'approved' && (
                  <button onClick={() => handleSendEmail(u.id)} disabled={sendingId === u.id} className="px-2 py-1 text-xs rounded border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50">
                    {sendingId === u.id ? 'Sending...' : 'Send Email'}
                  </button>
                )}
                {u.status === 'draft' && (
                  <button onClick={() => startEdit(u)} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">Edit</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
