'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useOrg } from '@/hooks/use-org';
import { createClient } from '@/lib/supabase/client';
import * as XLSX from 'xlsx';
import type { DataStudioTableDef } from '@/lib/admin/data-studio-catalog';

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    const blob = new Blob(['(no rows)'], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    return;
  }
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadXlsx(filename: string, sheetName: string, rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ note: 'No rows' }]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31) || 'Data');
  XLSX.writeFile(wb, filename);
}

function openPrintableReport(title: string, subtitle: string, rows: Record<string, unknown>[]) {
  const keys = rows.length ? Object.keys(rows[0]) : [];
  const table =
    rows.length === 0
      ? '<p>(No rows)</p>'
      : `<table border="1" cellspacing="0" cellpadding="6"><thead><tr>${keys.map((k) => `<th>${escapeHtml(k)}</th>`).join('')}</tr></thead><tbody>${rows
          .map(
            (r) =>
              `<tr>${keys
                .map((k) => `<td>${escapeHtml(cellPreview(r[k], 500))}</td>`)
                .join('')}</tr>`
          )
          .join('')}</tbody></table>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(title)}</title>
    <style>body{font-family:sans-serif;padding:24px;} h1{font-size:18px;} p{color:#444;} table{font-size:11px;border-collapse:collapse;} th{background:#f0f0f0;}</style>
    </head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p>${table}<p>Print and choose &quot;Save as PDF&quot; in the print dialog.</p></body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cellPreview(v: unknown, max: number): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export default function DataStudioPage() {
  const { org, role, loading: orgLoading } = useOrg();
  const [search, setSearch] = useState('');
  const [tables, setTables] = useState<DataStudioTableDef[]>([]);
  const [selected, setSelected] = useState<DataStudioTableDef | null>(null);
  const [engagements, setEngagements] = useState<{ id: string; name: string }[]>([]);
  const [engagementId, setEngagementId] = useState<string>('');
  const [rowLimit, setRowLimit] = useState(100);
  const [sortOldestFirst, setSortOldestFirst] = useState(false);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [backfillMsg, setBackfillMsg] = useState<string | null>(null);
  const [backfillLoading, setBackfillLoading] = useState(false);

  const isAdmin = role === 'owner' || role === 'admin';

  const loadCatalog = useCallback(async () => {
    if (!org?.id) return;
    const res = await fetch(`/api/admin/data-studio/catalog?orgId=${encodeURIComponent(org.id)}&q=${encodeURIComponent(search)}`);
    const data = await res.json();
    if (!res.ok) return;
    setTables(data.tables || []);
  }, [org?.id, search]);

  useEffect(() => {
    if (!org?.id || !isAdmin) return;
    const t = setTimeout(loadCatalog, 200);
    return () => clearTimeout(t);
  }, [org?.id, isAdmin, loadCatalog]);

  useEffect(() => {
    if (!org?.id || !isAdmin) return;
    const supabase = createClient();
      void supabase
        .from('engagements')
        .select('id, name')
        .eq('org_id', org.id)
        .order('name', { ascending: true })
        .then(({ data }) => setEngagements((data || []) as { id: string; name: string }[]));
  }, [org?.id, isAdmin]);

  async function runPreview() {
    if (!org?.id || !selected) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const res = await fetch('/api/admin/data-studio/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: org.id,
          table: selected.name,
          limit: rowLimit,
          offset: 0,
          engagementId: selected.hasEngagementId && engagementId ? engagementId : undefined,
          sortAscending: sortOldestFirst,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPreviewError(data.error || 'Preview failed');
        setRows([]);
        return;
      }
      setRows((data.rows || []) as Record<string, unknown>[]);
    } catch {
      setPreviewError('Preview failed');
      setRows([]);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function runBackfillTrial() {
    if (!org?.id) return;
    setBackfillLoading(true);
    setBackfillMsg(null);
    try {
      const res = await fetch('/api/admin/data-studio/backfill-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: org.id }),
      });
      const data = await res.json();
      setBackfillMsg(data.message || data.error || 'Done');
    } catch {
      setBackfillMsg('Request failed');
    } finally {
      setBackfillLoading(false);
    }
  }

  if (orgLoading) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-lg space-y-2">
        <h1 className="text-2xl font-bold">Data Studio</h1>
        <p className="text-muted-foreground">Only workspace owners and admins can open Data Studio.</p>
        <Link href="/support" className="text-primary text-sm underline">
          Back to Help &amp; Support
        </Link>
      </div>
    );
  }

  const columns = rows[0] ? Object.keys(rows[0]) : [];

  const exportBase = selected ? `${selected.name}-${new Date().toISOString().slice(0, 10)}` : 'export';

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Data Studio</h1>
        <p className="text-muted-foreground text-sm mt-1 max-w-3xl">
          Explore what each database table stores (tooltips below), preview a <strong>subset</strong> of rows
          for <strong>this workspace only</strong> (and global catalogs like AI agent definitions), then export.
          For very large exports, contact your admin to run a database backup or ETL—this UI caps previews at{' '}
          {500} rows per request.
        </p>
        <Link href="/support" className="text-sm text-primary hover:underline mt-2 inline-block">
          ← Help &amp; Support
        </Link>
      </div>

      <section className="rounded-lg border border-border p-4 space-y-3">
        <h2 className="font-semibold">Trial date backfill (this workspace)</h2>
        <p className="text-xs text-muted-foreground">
          If this org was created before automatic trials, set <code className="text-[11px]">trial_ends_at</code>{' '}
          once using the same 30-day rule as new signups.
        </p>
        <button
          type="button"
          onClick={runBackfillTrial}
          disabled={backfillLoading || !org}
          className="px-3 py-2 rounded-md text-sm border border-input hover:bg-accent disabled:opacity-50"
        >
          {backfillLoading ? 'Working…' : 'Set trial end date if missing'}
        </button>
        {backfillMsg && <p className="text-xs text-muted-foreground">{backfillMsg}</p>}
      </section>

      <section className="rounded-lg border border-border p-4 space-y-4">
        <h2 className="font-semibold">1. Find a table</h2>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by table name or topic (e.g. scope, agent, time)…"
          className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <ul className="grid gap-2 sm:grid-cols-2">
          {tables.map((t) => (
            <li key={t.name}>
              <button
                type="button"
                title={t.whatItStores}
                onClick={() => {
                  setSelected(t);
                  setRows([]);
                  setPreviewError(null);
                }}
                className={`w-full text-left rounded-lg border p-3 text-sm transition-colors ${
                  selected?.name === t.name ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'
                }`}
              >
                <span className="font-medium">{t.title}</span>
                <span className="block text-[11px] text-muted-foreground font-mono mt-0.5">{t.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {selected && (
        <section className="rounded-lg border border-border p-4 space-y-4">
          <h2 className="font-semibold">2. What this table stores</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{selected.whatItStores}</p>

          <h2 className="font-semibold pt-2">3. Preview options</h2>
          <div className="flex flex-wrap gap-4 items-end">
            {selected.hasEngagementId && (
              <div>
                <label className="block text-xs font-medium mb-1">Limit to one engagement (optional)</label>
                <select
                  value={engagementId}
                  onChange={(e) => setEngagementId(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[200px]"
                >
                  <option value="">All engagements in this workspace</option>
                  {engagements.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1">Row limit</label>
              <select
                value={rowLimit}
                onChange={(e) => setRowLimit(Number(e.target.value))}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {[50, 100, 250, 500].map((n) => (
                  <option key={n} value={n}>
                    {n} rows
                  </option>
                ))}
              </select>
            </div>
            {selected.orderColumn && (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={sortOldestFirst}
                  onChange={(e) => setSortOldestFirst(e.target.checked)}
                />
                Oldest / ascending sort (default is newest first)
              </label>
            )}
            <button
              type="button"
              onClick={runPreview}
              disabled={previewLoading}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              {previewLoading ? 'Loading…' : 'Run preview'}
            </button>
          </div>

          {previewError && <p className="text-sm text-destructive">{previewError}</p>}

          <h2 className="font-semibold pt-4">4. Results &amp; export</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadCsv(`${exportBase}.csv`, rows)}
              className="px-3 py-1.5 rounded-md border text-sm hover:bg-accent"
            >
              Download CSV
            </button>
            <button
              type="button"
              onClick={() => downloadXlsx(`${exportBase}.xlsx`, selected.title, rows)}
              className="px-3 py-1.5 rounded-md border text-sm hover:bg-accent"
            >
              Download Excel
            </button>
            <button
              type="button"
              onClick={() =>
                openPrintableReport(
                  `Data Studio — ${selected.title}`,
                  `Table: ${selected.name} · Workspace: ${org?.name ?? ''} · Rows: ${rows.length} (capped export from preview)`,
                  rows
                )
              }
              className="px-3 py-1.5 rounded-md border text-sm hover:bg-accent"
            >
              Print / Save as PDF
            </button>
          </div>

          <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Google Drive:</strong> Download CSV or Excel, then upload the file to Drive manually. Direct
              “Save to Drive” needs a Google connection that is not enabled in this build.
            </p>
            <p>
              <strong>Other systems (CRM, warehouse, depot):</strong> Use CSV or Excel as the handoff format, or
              ask your IT team for an API integration—the app does not push to third parties from this screen yet.
            </p>
          </div>

          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  {columns.map((c) => (
                    <th key={c} className="text-left p-2 font-medium whitespace-nowrap" title={c}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-border/60">
                    {columns.map((c) => (
                      <td key={c} className="p-2 align-top max-w-[240px] whitespace-pre-wrap break-words" title={String(r[c] ?? '')}>
                        {cellPreview(r[c], 120)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && !previewLoading && (
              <p className="p-4 text-sm text-muted-foreground">Run a preview to see rows here.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
