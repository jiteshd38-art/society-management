import { supabase, isSupabaseConfigured } from '../client';
import { BillEmailLog } from '../../types/society';

export async function getEmailLogs(): Promise<BillEmailLog[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('bill_email_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase email logs fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      billId: row.bill_id,
      flatNumber: row.flat_number,
      recipientEmail: row.recipient_email,
      recipientName: row.recipient_name,
      subject: row.subject,
      sentAt: row.sent_at,
      type: row.type,
      amount: Number(row.amount || 0),
      remainingAmount: Number(row.remaining_amount || 0),
      status: row.status
    }));
  } catch (err: any) {
    console.warn('Supabase query error (email logs):', err?.message || err);
    return null;
  }
}
