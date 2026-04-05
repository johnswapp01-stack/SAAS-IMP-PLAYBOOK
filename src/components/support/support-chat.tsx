'use client';

import { useState, useRef, useEffect } from 'react';

const STARTERS = [
  'What is an engagement?',
  'How do AI agent limits work?',
  'Where do I change my plan or billing?',
  'What is MoSCoW in the Scope tab?',
  'What should I not paste in this chat?',
];

export function SupportChat() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setMessages((m) => [...m, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || 'Something went wrong. Try again in a moment.';
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'Could not reach the assistant. Check your connection and try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col max-h-[min(70vh,640px)]">
      <div className="p-3 border-b border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Tap a starter question or type your own. Answers use simple language and your product help library—not
          live account data.
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={loading}
              className="text-[11px] px-2 py-1 rounded-md bg-background border border-input hover:bg-accent disabled:opacity-50 text-left max-w-full"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Ask anything about using Implementation Pro. For billing tied to your invoice, your workspace owner may
            need to open Settings.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.text.split('\n').map((line, j) => (
                <p key={j} className={j > 0 ? 'mt-2' : ''}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <p className="text-xs text-muted-foreground animate-pulse">Assistant is thinking…</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="p-3 border-t border-border flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label className="sr-only" htmlFor="support-input">
          Your question
        </label>
        <input
          id="support-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: How do I add people to my workspace?"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
