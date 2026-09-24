import { supabase, isSupabaseConfigured } from '../client';
import { ResidentUser } from '../../types/society';

export async function getResidents(): Promise<ResidentUser[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .order('flat_number', { ascending: true });

    if (error) {
      console.warn('Supabase residents fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      flatNumber: row.flat_number,
      block: row.block,
      role: row.role,
      intercom: row.intercom,
      vehicles: typeof row.vehicles === 'string' ? JSON.parse(row.vehicles) : (row.vehicles || []),
      domesticStaffIds: row.domestic_staff_ids || []
    }));
  } catch (err: any) {
    console.warn('Supabase query error (residents):', err?.message || err);
    return null;
  }
}
