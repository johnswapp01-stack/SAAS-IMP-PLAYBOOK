export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAnthropicClient } from '@/lib/ai/client';
import { buildHelpLibraryContext } from '@/lib/support/retrieve-context';

const SUPPORT_MODEL = 'claude-sonnet-4-20250514';
const MAX_OUT = 1200;

const SUPPORT_SYSTEM = `You are the friendly in-app assistant for Implementation Pro, a SaaS for managing customer software implementations.

Rules:
- Write for non-technical readers: short sentences, no jargon unless you define it in one line (e.g. “MoSCoW = priority labels: Must, Should, Could, Won’t”).
- Use numbered steps when describing clicks (1. Open… 2. Tap…).
- Ground answers in the HELP LIBRARY text when it is relevant. If the library does not cover the question, say what you can in general terms and suggest opening Settings, Engagements, or Operations as appropriate.
- Never invent pricing numbers unless they appear in the HELP LIBRARY; you may say “see Settings → Plan & Billing for your workspace.”
- If the user reports a bug, outage, or billing dispute, tell them clearly to escalate to their org admin or human support—you cannot fix accounts.
- Do not ask for passwords, API keys, or secrets. Gently refuse if they paste them.
- Tone: calm, respectful, concise. No corporate fluff.`;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message } = (await req.json()) as { message?: string };
    const trimmed = (message || '').trim();
    if (!trimmed) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (trimmed.length > 4000) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 });
    }

    const helpLibrary = await buildHelpLibraryContext(trimmed);
    const userBlock = `HELP LIBRARY (trust this for product facts):\n${helpLibrary}\n\nUSER QUESTION:\n${trimmed}`;

    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: SUPPORT_MODEL,
      max_tokens: MAX_OUT,
      system: SUPPORT_SYSTEM,
      messages: [{ role: 'user', content: userBlock }],
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('\n\n');

    return NextResponse.json({ reply: text.trim() || 'Sorry, I could not generate a reply. Please try again.' });
  } catch (e) {
    console.error('Support chat error:', e);
    const msg = e instanceof Error ? e.message : 'Chat failed';
    if (msg.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        {
          reply:
            'The assistant is not configured yet (missing API key on the server). Your admin can enable AI help in server settings.',
        },
        { status: 200 }
      );
    }
    return NextResponse.json({ error: 'Assistant unavailable' }, { status: 500 });
  }
}
