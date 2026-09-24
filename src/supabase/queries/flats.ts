import { supabase, isSupabaseConfigured } from '../client';
import { FlatRecord } from '../../types/society';

export async function getFlats(): Promise<FlatRecord[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('flats')
      .select('*')
      .order('flat_number', { ascending: true });

    if (error) {
      console.warn('Supabase flats fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      flatNumber: row.flat_number,
      block: row.block,
      floor: Number(row.floor),
      ownerName: row.owner_name,
      occupantType: row.occupant_type,
      contact: row.contact,
      intercom: row.intercom,
      membersCount: Number(row.members_count),
      maintenanceDue: Number(row.maintenance_due || 0)
    }));
  } catch (err: any) {
    console.warn('Supabase query error (flats):', err?.message || err);
    return null;
  }
}
