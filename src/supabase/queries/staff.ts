import { supabase, isSupabaseConfigured } from '../client';
import { StaffMember } from '../../types/society';

export async function getStaffMembers(): Promise<StaffMember[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase staff members fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      roleTitle: row.role_title,
      category: row.category,
      phone: row.phone,
      shift: row.shift,
      status: row.status,
      assignedComplaintsCount: Number(row.assigned_complaints_count || 0),
      rating: Number(row.rating || 5)
    }));
  } catch (err: any) {
    console.warn('Supabase query error (staff):', err?.message || err);
    return null;
  }
}
