import { supabase, isSupabaseConfigured } from '../client';
import { EmergencySOS } from '../../types/society';

export async function getEmergencySOS(): Promise<EmergencySOS[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('emergency_sos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase emergency SOS fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      flatNumber: row.flat_number,
      residentName: row.resident_name,
      phone: row.phone,
      type: row.type,
      timestamp: row.timestamp || (row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'),
      status: row.status,
      respondedBy: row.responded_by || undefined,
      notes: row.notes || undefined
    }));
  } catch (err: any) {
    console.warn('Supabase query error (emergency SOS):', err?.message || err);
    return null;
  }
}
