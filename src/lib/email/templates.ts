// Email templates for client updates
// Each function returns { subject, html } for use with Resend

export interface ClientUpdateEmailData {
  customerName: string;
  engagementName: string;
  updateType: string;
  content: string;
  senderName?: string;
  orgName?: string;
}

export function clientUpdateEmail(data: ClientUpdateEmailData): { subject: string; html: string } {
  const typeLabels: Record<string, string> = {
    weekly_status: 'Weekly Status Update',
    milestone_reached: 'Milestone Reached',
    risk_alert: 'Risk Alert',
    go_live_countdown: 'Go-Live Countdown',
  };

  const subject = `[${data.engagementName}] ${typeLabels[data.updateType] || data.updateType}`;

  const accentColor = data.updateType === 'risk_alert' ? '#ef4444' : '#2563eb';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;">
    <tr>
      <td style="padding:24px 32px;border-bottom:3px solid ${accentColor};">
        <table width="100%">
          <tr>
            <td>
              <span style="font-size:18px;font-weight:600;color:#111827;">${data.orgName || 'Implementation Pro'}</span>
            </td>
            <td align="right">
              <span style="font-size:12px;color:#6b7280;background:#f3f4f6;padding:4px 10px;border-radius:12px;">${typeLabels[data.updateType] || data.updateType}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">${data.engagementName}</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Update for ${data.customerName}</p>
        <div style="font-size:14px;line-height:1.7;color:#374151;white-space:pre-wrap;">${escapeHtml(data.content)}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px 32px;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:13px;color:#6b7280;">
          Sent by ${data.senderName || 'your implementation team'} via Implementation Pro
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
