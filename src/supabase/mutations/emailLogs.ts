import { supabase, isSupabaseConfigured } from '../client';
import { BillEmailLog } from '../../types/society';

export async function createEmailLog(log: Omit<BillEmailLog, 'id' | 'sentAt'>): Promise<BillEmailLog> {
  const id = `elog-${Date.now()}`;
  const now = new Date().toISOString();

  const newLog: BillEmailLog = {
    ...log,
    id,
    sentAt: now
  };

  if (!isSupabaseConfigured) {
    return newLog;
  }

  try {
    const row = {
      id,
      bill_id: newLog.billId,
      flat_number: newLog.flatNumber,
      recipient_email: newLog.recipientEmail,
      recipient_name: newLog.recipientName,
      subject: newLog.subject,
      sent_at: newLog.sentAt,
      type: newLog.type,
      amount: newLog.amount,
      remaining_amount: newLog.remainingAmount,
      status: newLog.status,
      created_at: now
    };

    const { error } = await supabase.from('bill_email_logs').insert([row]);
    if (error) {
      console.warn('Supabase record email log notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (createEmailLog):', err?.message || err);
  }

  return newLog;
}
