import { supabase, isSupabaseConfigured } from '../client';
import { StaffMember } from '../../types/society';

export async function updateStaffMemberStatus(
  id: string,
  newStatus: StaffMember['status']
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await supabase
      .from('staff_members')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.warn('Supabase update staff member notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (updateStaffMemberStatus):', err?.message || err);
  }
}
