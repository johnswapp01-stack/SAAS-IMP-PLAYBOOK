export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getResend, FROM_EMAIL } from '@/lib/email/client';
import { clientUpdateEmail } from '@/lib/email/templates';

export async function POST(req: NextRequest) {
  try {
    const supabase: any = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { clientUpdateId } = body;

    if (!clientUpdateId) {
      return NextResponse.json({ error: 'clientUpdateId is required' }, { status: 400 });
    }

    // Fetch the client update with engagement details
    const { data: update, error: fetchErr } = await supabase
      .from('client_updates')
      .select('*, engagements!inner(name, customer_name, org_id)')
      .eq('id', clientUpdateId)
      .single();

    if (fetchErr || !update) {
      return NextResponse.json({ error: 'Client update not found' }, { status: 404 });
    }

    // Verify org membership
    const { data: member } = await supabase
      .from('org_members')
      .select('id')
      .eq('org_id', update.engagements.org_id)
      .eq('user_id', user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get org name
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', update.engagements.org_id)
      .single();

    // Get sender profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Extract recipient emails
    const recipients: string[] = (update.recipients || [])
      .map((r: any) => r.email)
      .filter((e: string) => e && e.includes('@'));

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No valid recipient emails found' }, { status: 400 });
    }

    // Build the email
    const emailData = clientUpdateEmail({
      customerName: update.engagements.customer_name,
      engagementName: update.engagements.name,
      updateType: update.update_type,
      content: update.content,
      senderName: profile?.full_name || undefined,
      orgName: org?.name || undefined,
    });

    // Send via Resend
    const resend = getResend();
    const { data: sendResult, error: sendErr } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      subject: emailData.subject,
      html: emailData.html,
    });

    if (sendErr) {
      // Update status to failed
      await supabase
        .from('client_updates')
        .update({ status: 'failed' })
        .eq('id', clientUpdateId);

      console.error('Resend error:', sendErr);
      return NextResponse.json({ error: 'Failed to send email', detail: sendErr.message }, { status: 500 });
    }

    // Update client_update status to sent
    await supabase
      .from('client_updates')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', clientUpdateId);

    // Log to activity log
    await supabase.from('activity_log').insert({
      org_id: update.engagements.org_id,
      engagement_id: update.engagement_id,
      entity_type: 'client_update',
      entity_id: clientUpdateId,
      action: 'email_sent',
      user_id: user.id,
      metadata: { recipients, resend_id: sendResult?.id },
    });

    return NextResponse.json({ success: true, resendId: sendResult?.id, recipientCount: recipients.length });
  } catch (err: any) {
    console.error('Email send error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
