import { MaintenanceBill } from '../types/society';

export interface SendGmailOptions {
  accessToken: string;
  recipientEmail: string;
  subject: string;
  bodyText: string;
  ccEmail?: string;
  bill: MaintenanceBill;
}

/**
 * Base64URL encode a Unicode string compliant with RFC 4648 §5
 */
export function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate a beautifully formatted HTML email for Palm Heights Maintenance
 */
export function generateBillHtml(
  bill: MaintenanceBill,
  customNote: string,
  remainingDue: number,
  paidAmount: number
): string {
  const isPaid = bill.status === 'paid' || remainingDue <= 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #047857; color: #ffffff; padding: 24px 28px; }
    .header h1 { margin: 0 0 4px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
    .header p { margin: 0; font-size: 13px; color: #a7f3d0; }
    .content { padding: 28px; }
    .note-box { background: #f1f5f9; border-left: 4px solid #059669; padding: 14px 18px; border-radius: 6px; font-size: 14px; line-height: 1.6; margin-bottom: 24px; white-space: pre-wrap; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-paid { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .badge-partial { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .badge-pending { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .table th { background: #f8fafc; text-align: left; padding: 10px 14px; font-size: 12px; color: #475569; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    .table td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    .table td.amount { text-align: right; font-family: monospace; font-weight: 600; }
    .table tr.total td { font-weight: 700; border-top: 2px solid #e2e8f0; font-size: 14px; }
    .due-card { background: ${isPaid ? '#ecfdf5' : '#fffbeb'}; border: 1px solid ${isPaid ? '#a7f3d0' : '#fde68a'}; border-radius: 12px; padding: 18px; margin-bottom: 24px; text-align: center; }
    .due-card-title { font-size: 12px; text-transform: uppercase; font-weight: 700; color: ${isPaid ? '#065f46' : '#92400e'}; letter-spacing: 0.05em; }
    .due-card-amount { font-size: 28px; font-weight: 900; font-family: monospace; color: ${isPaid ? '#047857' : '#b45309'}; margin: 6px 0; }
    .due-card-sub { font-size: 12px; color: #64748b; }
    .payment-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; font-size: 12px; }
    .payment-box h3 { margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #0f172a; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; padding: 20px 28px; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Palm Heights Co-operative Housing Society Ltd.</h1>
      <p>Official Society Maintenance Statement • Registration: BOM/HSG/2021-998</p>
    </div>

    <div class="content">
      <div class="note-box">${customNote}</div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <span style="font-size: 16px; font-weight: 800; color: #0f172a;">Flat ${bill.flatNumber}</span>
          <span style="font-size: 13px; color: #64748b; margin-left: 8px;">(${bill.residentName})</span>
        </div>
        <div>
          <span class="badge ${isPaid ? 'badge-paid' : remainingDue < bill.amount ? 'badge-partial' : 'badge-pending'}">
            ${isPaid ? 'Settled' : remainingDue < bill.amount ? 'Partially Paid' : 'Pending Payment'}
          </span>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Billing Item</th>
            <th style="text-align: right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Base Society Maintenance Fee</td>
            <td class="amount">₹${bill.breakup.maintenanceFee.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Sinking & Capital Reserve Fund</td>
            <td class="amount">₹${bill.breakup.sinkingFund.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Water Meter Charges</td>
            <td class="amount">₹${bill.breakup.waterCharges.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Assigned Parking Slot Fee</td>
            <td class="amount">₹${bill.breakup.parkingCharges.toLocaleString('en-IN')}</td>
          </tr>
          ${bill.breakup.penalty > 0 ? `
          <tr style="color: #dc2626;">
            <td>Late Payment Penalty</td>
            <td class="amount">+₹${bill.breakup.penalty.toLocaleString('en-IN')}</td>
          </tr>` : ''}
          <tr class="total">
            <td>Total Invoiced (${bill.month})</td>
            <td class="amount">₹${bill.amount.toLocaleString('en-IN')}</td>
          </tr>
          <tr style="color: #047857; font-weight: 600;">
            <td>Paid So Far (Installments)</td>
            <td class="amount">₹${paidAmount.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <div class="due-card">
        <div class="due-card-title">${isPaid ? 'Balance Cleared' : 'Remaining Due Balance'}</div>
        <div class="due-card-amount">₹${remainingDue.toLocaleString('en-IN')}</div>
        <div class="due-card-sub">${isPaid ? 'All dues for this period have been fully settled.' : `Due on or before ${bill.dueDate}`}</div>
      </div>

      ${!isPaid ? `
      <div class="payment-box">
        <h3>Payment Coordinates:</h3>
        <p style="margin: 4px 0;"><strong>Instant UPI VPA:</strong> <code style="background: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1; font-family: monospace;">society.palmheights@icici</code></p>
        <p style="margin: 4px 0;"><strong>Bank Account:</strong> Palm Heights Residency Ltd • ICICI Bank • A/C: 98120048190 • IFSC: ICIC0001092</p>
        <p style="margin: 4px 0; color: #64748b;">You can also pay full or partial amounts via the society web app.</p>
      </div>` : ''}

      <p style="font-size: 13px; color: #475569; margin-top: 20px;">
        For questions or disputes regarding this statement, please contact the Management Committee at <a href="mailto:accounts@palmheights.residency.org" style="color: #059669;">accounts@palmheights.residency.org</a>.
      </p>
    </div>

    <div class="footer">
      Palm Heights Co-operative Housing Society Ltd. • Sector 19, Palm Avenue, Mumbai 400076<br>
      This is an automated statement sent via Google Workspace Gmail API on behalf of Society Management.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Sends a real email via the Gmail REST API (users.messages.send)
 */
export async function sendEmailViaGmail({
  accessToken,
  recipientEmail,
  subject,
  bodyText,
  ccEmail,
  bill
}: SendGmailOptions): Promise<{ id: string; threadId: string }> {
  const paidAmount = bill.paidAmount !== undefined ? bill.paidAmount : (bill.status === 'paid' ? bill.amount : 0);
  const remainingDue = bill.remainingAmount !== undefined ? bill.remainingAmount : Math.max(0, bill.amount - paidAmount);

  const htmlContent = generateBillHtml(bill, bodyText, remainingDue, paidAmount);

  // Construct RFC 2822 MIME message
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Encode subject in RFC 2047 if needed, or clean string
  const cleanSubject = subject.replace(/[\r\n]+/g, ' ');

  const headers = [
    `To: ${recipientEmail}`,
    `Subject: ${cleanSubject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`
  ];

  if (ccEmail) {
    headers.push(`Cc: ${ccEmail}`);
  }

  const rawMime = [
    headers.join('\r\n'),
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    bodyText,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlContent,
    '',
    `--${boundary}--`
  ].join('\r\n');

  const encodedMessage = base64UrlEncode(rawMime);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: encodedMessage
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error?.message || `Gmail API returned HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result;
}
