export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for waitlist — no auth required to join
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, company, role, teamSize, interest, source } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Check if already on waitlist
    const { data: existing } = await supabaseAdmin
      .from('waitlist')
      .select('id, status')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      if (existing.status === 'converted') {
        return NextResponse.json({ message: 'You already have an account! Log in to get started.', alreadyConverted: true });
      }
      return NextResponse.json({ message: 'You\'re already on the list! We\'ll be in touch soon.', alreadyExists: true });
    }

    const { error } = await supabaseAdmin.from('waitlist').insert({
      email: email.toLowerCase().trim(),
      name: name?.trim() || null,
      company: company?.trim() || null,
      role: role?.trim() || null,
      team_size: teamSize || null,
      interest: interest || 'general',
      source: source || 'landing_page',
    });

    if (error) {
      console.error('Waitlist insert error:', error);
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'You\'re on the list! We\'ll reach out when your spot opens up.' });
  } catch (err: any) {
    console.error('Waitlist error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// GET — admin endpoint to view waitlist stats
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is authenticated via Supabase
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const supabase: any = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { count: total } = await supabaseAdmin.from('waitlist').select('*', { count: 'exact', head: true });
    const { count: pending } = await supabaseAdmin.from('waitlist').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: invited } = await supabaseAdmin.from('waitlist').select('*', { count: 'exact', head: true }).eq('status', 'invited');
    const { count: converted } = await supabaseAdmin.from('waitlist').select('*', { count: 'exact', head: true }).eq('status', 'converted');

    return NextResponse.json({ total, pending, invited, converted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
