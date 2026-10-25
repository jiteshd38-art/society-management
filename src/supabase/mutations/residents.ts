import { supabase, isSupabaseConfigured } from '../client';
import { ResidentUser } from '../../types/society';

export async function createResidentRecord(resident: ResidentUser): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase
      .from('residents')
      .upsert({
        id: resident.id,
        name: resident.name,
        email: resident.email,
        phone: resident.phone,
        flat_number: resident.flatNumber,
        block: resident.block,
        role: resident.role,
        intercom: resident.intercom,
        vehicles: resident.vehicles,
        domestic_staff_ids: resident.domesticStaffIds
      });

    if (error) {
      console.warn('Error adding resident in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception adding resident:', err);
    return false;
  }
}

export async function removeResidentByFlat(flatNumber: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase
      .from('residents')
      .delete()
      .eq('flat_number', flatNumber);

    if (error) {
      console.warn('Error removing resident by flat in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception removing resident by flat:', err);
    return false;
  }
}
