import { supabase, isSupabaseConfigured } from '../client';
import { MaintenanceBill } from '../../types/society';

export async function getBills(): Promise<MaintenanceBill[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('maintenance_bills')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase bills fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      flatNumber: row.flat_number,
      residentName: row.resident_name,
      month: row.month,
      dueDate: row.due_date,
      amount: Number(row.amount),
      paidAmount: Number(row.paid_amount || 0),
      remainingAmount: Number(row.remaining_amount !== undefined ? row.remaining_amount : row.amount - (row.paid_amount || 0)),
      breakup: typeof row.breakup === 'string' ? JSON.parse(row.breakup) : (row.breakup || {
        maintenanceFee: Number(row.amount),
        sinkingFund: 0,
        waterCharges: 0,
        parkingCharges: 0,
        penalty: 0
      }),
      status: row.status,
      paidAt: row.paid_at || undefined,
      paymentMethod: row.payment_method || undefined,
      transactionId: row.transaction_id || undefined,
      receiptNumber: row.receipt_number || undefined,
      payments: typeof row.payments === 'string' ? JSON.parse(row.payments) : (row.payments || []),
      lastEmailedAt: row.last_emailed_at || undefined,
      lastEmailedTo: row.last_emailed_to || undefined
    }));
  } catch (err: any) {
    console.warn('Supabase query error (bills):', err?.message || err);
    return null;
  }
}
