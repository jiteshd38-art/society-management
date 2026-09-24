import { supabase, isSupabaseConfigured } from '../client';
import { DomesticWorker } from '../../types/society';

export async function getDomesticWorkers(): Promise<DomesticWorker[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('domestic_workers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase domestic workers fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      phone: row.phone,
      passId: row.pass_id,
      flatsAssigned: typeof row.flats_assigned === 'string' ? JSON.parse(row.flats_assigned) : (row.flats_assigned || []),
      isInside: Boolean(row.is_inside),
      lastPunch: row.last_punch || '',
      verified: Boolean(row.verified)
    }));
  } catch (err: any) {
    console.warn('Supabase query error (domestic workers):', err?.message || err);
    return null;
  }
}
