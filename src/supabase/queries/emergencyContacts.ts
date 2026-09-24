import { supabase, isSupabaseConfigured } from '../client';
import { EmergencyContact } from '../types';

export async function getEmergencyContacts(): Promise<EmergencyContact[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Supabase emergency contacts fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      label: row.label,
      phone: row.phone,
      intercom: row.intercom,
      available: row.available
    }));
  } catch (err: any) {
    console.warn('Supabase query error (emergency contacts):', err?.message || err);
    return null;
  }
}
