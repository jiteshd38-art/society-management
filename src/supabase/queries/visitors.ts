import { supabase, isSupabaseConfigured } from '../client';
import { Visitor } from '../../types/society';

export async function getVisitors(): Promise<Visitor[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase visitors fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      visitorName: row.visitor_name,
      phone: row.phone,
      visitorType: row.visitor_type,
      flatNumber: row.flat_number,
      hostName: row.host_name,
      passCode: row.pass_code,
      company: row.company || undefined,
      purpose: row.purpose,
      vehicleNumber: row.vehicle_number || undefined,
      expectedDate: row.expected_date,
      status: row.status,
      checkInTime: row.check_in_time || undefined,
      checkOutTime: row.check_out_time || undefined,
      entryGate: row.entry_gate || undefined,
      notes: row.notes || undefined,
      createdAt: row.created_at
    }));
  } catch (err: any) {
    console.warn('Supabase query error (visitors):', err?.message || err);
    return null;
  }
}
