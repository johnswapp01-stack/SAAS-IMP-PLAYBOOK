'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils';
import type { LessonLearned, LessonCategory, ImpactLevel } from '@/types';

const categoryConfig: Record<LessonCategory, { label: string; color: string }> = {
  process: { label: 'Process', color: 'bg-blue-100 text-blue-700' },
  communication: { label: 'Communication', color: 'bg-purple-100 text-purple-700' },
  technical: { label: 'Technical', color: 'bg-gray-100 text-gray-700' },
  scope: { label: 'Scope', color: 'bg-yellow-100 text-yellow-700' },
  timeline: { label: 'Timeline', color: 'bg-orange-100 text-orange-700' },
};

const impactColors: Record<ImpactLevel, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

interface LessonsTabProps {
  engagementId: string;
}

export function LessonsTab({ engagementId }: LessonsTabProps) {
  const { org } = useOrg();
  const [items, setItems] = useState<LessonLearned[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [finding, setFinding] = useState('');
  const [category, setCategory] = useState<LessonCategory>('process');
  const [impact, setImpact] = useState<ImpactLevel>('medium');
  const [recommendation, setRecommendation] = useState('');
  const [owner, setOwner] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!org) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('lessons_learned')
      .select('*')
      .eq('engagement_id', engagementId)
      .eq('org_id', org.id)
      .order('created_at', { ascending: false });
    setItems((data as LessonLearned[]) || []);
    setLoading(false);
  }, [engagementId, org]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function resetForm() {
    setFinding(''); setCategory('process'); setImpact('medium');
    setRecommendation(''); setOwner('');
    setEditingId(null); setShowForm(false);
  }

  function startEdit(l: LessonLearned) {
    setFinding(l.finding); setCategory(l.category); setImpact(l.impact);
    setRecommendation(l.recommendation || ''); setOwner(l.owner || '');
    setEditingId(l.id); setShowForm(true);
  }

  async function handleSave() {
    if (!org || !finding.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      engagement_id: engagementId,
      org_id: org.id,
      finding: finding.trim(),
      category,
      impact,
      recommendation: recommendation.trim() || null,
      owner: owner.trim() || null,
    };
    if (editingId) {
      await supabase.from('lessons_learned').update(payload).eq('id', editingId);
    } else {
      await supabase.from('lessons_learned').insert(payload);
    }
    resetForm(); setSaving(false); fetchItems();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from('lessons_learned').delete().eq('id', id);
    fetchItems();
  }

  if (loading) {
    return <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{items.length} lesson{items.length !== 1 ? 's' : ''} captured</p>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          + Add Lesson
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Finding *</label>
            <textarea value={finding} onChange={(e) => setFinding(e.target.value)} placeholder="What happened? What did we learn?" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Recommendation</label>
            <textarea value={recommendation} onChange={(e) => setRecommendation(e.target.value)} placeholder="What should we do differently next time?" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as LessonCategory)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {(Object.keys(categoryConfig) as LessonCategory[]).map((c) => <option key={c} value={c}>{categoryConfig[c].label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Impact</label>
              <select value={impact} onChange={(e) => setImpact(e.target.value as ImpactLevel)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Owner</label>
              <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Who owns this action" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-accent">Cancel</button>
            <button onClick={handleSave} disabled={saving || !finding.trim()} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-lg border border-border border-dashed p-8 text-center">
          <div className="text-3xl mb-2">💡</div>
          <p className="text-muted-foreground text-sm">No lessons captured yet. Document what went well and what to improve.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((l) => (
            <div key={l.id} className="rounded-lg border border-border bg-card p-4 group hover:border-border/80 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium flex-1">{l.finding}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                  <button onClick={() => startEdit(l)} className="px-2 py-1 text-xs rounded border border-input hover:bg-accent">Edit</button>
                  <button onClick={() => handleDelete(l.id)} className="px-2 py-1 text-xs rounded border border-destructive/50 text-destructive hover:bg-destructive/10">Delete</button>
                </div>
              </div>
              {l.recommendation && (
                <p className="text-xs text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Recommendation:</span> {l.recommendation}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className={cn('px-2 py-0.5 rounded font-medium', categoryConfig[l.category].color)}>{categoryConfig[l.category].label}</span>
                <span className={cn('px-2 py-0.5 rounded font-medium', impactColors[l.impact])}>{l.impact.charAt(0).toUpperCase() + l.impact.slice(1)} Impact</span>
                {l.owner && <span className="text-muted-foreground">Owner: {l.owner}</span>}
                <span className="text-muted-foreground">{new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
