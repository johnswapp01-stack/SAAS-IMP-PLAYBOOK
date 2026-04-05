'use client';

import { useState } from 'react';

const INCIDENT_TEMPLATE = `Implementation Pro — incident report (copy and send to your admin or support)

1) Time (with timezone): 
2) Your organization / workspace name: 
3) Your email (login): 
4) What you were trying to do (1–2 sentences): 
5) What happened instead (exact error text or screenshot reference): 
6) Browser and device (e.g. Chrome on Windows, Safari on iPhone): 
7) Does it happen every time or intermittently? 
8) Link to this status page if you checked it: [paste /status URL]

Optional: Reference ID from Settings or billing if you have one.

Thank you — this structure helps us reproduce and fix issues faster.`;

export function IncidentTemplateBlock() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(INCIDENT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Report an issue</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          This template is plain language—fill it in and send it to your workspace owner or your Implementation Pro
          support channel. It does not open a ticket by itself.
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
      >
        {copied ? 'Copied to clipboard' : 'Copy incident template'}
      </button>
      <pre className="text-xs bg-muted/50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap text-muted-foreground leading-relaxed border border-border">
        {INCIDENT_TEMPLATE}
      </pre>
    </section>
  );
}
