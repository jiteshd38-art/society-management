import { supabase, isSupabaseConfigured } from '../client';
import { Visitor } from '../../types/society';

export async function createVisitor(data: Omit<Visitor, 'id' | 'createdAt'>): Promise<Visitor> {
  const id = `vis-${Date.now()}`;
  const now = new Date().toISOString();

  const newVisitor: Visitor = {
    ...data,
    id,
    createdAt: now
  };

  if (!isSupabaseConfigured) {
    return newVisitor;
  }

  try {
    const row = {
      id,
      visitor_name: data.visitorName,
      phone: data.phone,
      visitor_type: data.visitorType,
      flat_number: data.flatNumber,
      host_name: data.hostName,
      pass_code: data.passCode,
      company: data.company || null,
      purpose: data.purpose,
      vehicle_number: data.vehicleNumber || null,
      expected_date: data.expectedDate,
      status: data.status,
      check_in_time: data.checkInTime || null,
      check_out_time: data.checkOutTime || null,
      entry_gate: data.entryGate || null,
      notes: data.notes || null,
      created_at: now
    };

    const { error } = await supabase.from('visitors').insert([row]);
    if (error) {
      console.warn('Supabase insert visitor notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (createVisitor):', err?.message || err);
  }

  return newVisitor;
}

export async function updateVisitorStatus(
  id: string,
  status: Visitor['status'],
  extra: { checkInTime?: string; checkOutTime?: string; entryGate?: string; notes?: string } = {}
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const updateData: any = { status };
    if (extra.checkInTime !== undefined) updateData.check_in_time = extra.checkInTime;
    if (extra.checkOutTime !== undefined) updateData.check_out_time = extra.checkOutTime;
    if (extra.entryGate !== undefined) updateData.entry_gate = extra.entryGate;
    if (extra.notes !== undefined) updateData.notes = extra.notes;

    const { error } = await supabase
      .from('visitors')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.warn('Supabase update visitor notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (updateVisitorStatus):', err?.message || err);
  }
}
