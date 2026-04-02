'use client';

import { useState } from 'react';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          company: company.trim() || undefined,
          role: role.trim() || undefined,
          teamSize: teamSize || undefined,
          interest: 'design_partner',
          source: 'landing_page_beta',
        }),
      });
      const data = await res.json();
      setMessage(data.message || 'Thanks! We\'ll be in touch.');
      setSubmitted(true);
    } catch {
      setMessage('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="text-3xl mb-3">{String.fromCodePoint(0x1F389)}</div>
        <p className="text-lg font-medium text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground mt-2">We review applications weekly and will reach out with next steps.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {loading ? 'Joining...' : 'Join beta'}
        </button>
      </div>

      {!showDetails && (
        <button type="button" onClick={() => setShowDetails(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          + Add your details for priority access
        </button>
      )}

      {showDetails && (
        <div className="grid grid-cols-2 gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (e.g., Impl Specialist)" className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <select value={teamSize} onChange={(e) => setTeamSize(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
            <option value="">Team size</option>
            <option value="solo">Just me</option>
            <option value="2-5">2-5</option>
            <option value="6-20">6-20</option>
            <option value="20+">20+</option>
          </select>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">No spam. We&apos;ll email you once when your spot opens.</p>
    </form>
  );
}
