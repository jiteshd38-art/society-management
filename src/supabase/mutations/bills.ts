import { supabase, isSupabaseConfigured } from '../client';
import { MaintenanceBill, PaymentTransaction } from '../../types/society';

export async function createBill(bill: MaintenanceBill): Promise<MaintenanceBill> {
  if (!isSupabaseConfigured) {
    return bill;
  }

  try {
    const row = {
      id: bill.id,
      flat_number: bill.flatNumber,
      resident_name: bill.residentName,
      month: bill.month,
      due_date: bill.dueDate,
      amount: bill.amount,
      paid_amount: bill.paidAmount || 0,
      remaining_amount: bill.remainingAmount !== undefined ? bill.remainingAmount : bill.amount,
      breakup: bill.breakup,
      status: bill.status,
      paid_at: bill.paidAt || null,
      payment_method: bill.paymentMethod || null,
      transaction_id: bill.transactionId || null,
      receipt_number: bill.receiptNumber || null,
      payments: bill.payments || [],
      last_emailed_at: bill.lastEmailedAt || null,
      last_emailed_to: bill.lastEmailedTo || null,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('maintenance_bills').insert([row]);
    if (error) {
      console.warn('Supabase create bill notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (createBill):', err?.message || err);
  }

  return bill;
}

export async function recordBillPayment(
  billId: string,
  updatedBill: Partial<MaintenanceBill> & {
    paidAmount: number;
    remainingAmount: number;
    status: MaintenanceBill['status'];
    paidAt: string;
    paymentMethod: MaintenanceBill['paymentMethod'];
    transactionId: string;
    receiptNumber: string;
    payments: PaymentTransaction[];
  }
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await supabase
      .from('maintenance_bills')
      .update({
        paid_amount: updatedBill.paidAmount,
        remaining_amount: updatedBill.remainingAmount,
        status: updatedBill.status,
        paid_at: updatedBill.paidAt,
        payment_method: updatedBill.paymentMethod,
        transaction_id: updatedBill.transactionId,
        receipt_number: updatedBill.receiptNumber,
        payments: updatedBill.payments
      })
      .eq('id', billId);

    if (error) {
      console.warn('Supabase update bill payment notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (recordBillPayment):', err?.message || err);
  }
}

export async function updateBillEmailInfo(
  billId: string,
  lastEmailedAt: string,
  lastEmailedTo: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await supabase
      .from('maintenance_bills')
      .update({
        last_emailed_at: lastEmailedAt,
        last_emailed_to: lastEmailedTo
      })
      .eq('id', billId);

    if (error) {
      console.warn('Supabase update bill email notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (updateBillEmailInfo):', err?.message || err);
  }
}
