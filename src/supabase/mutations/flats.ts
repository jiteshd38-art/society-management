import { supabase, isSupabaseConfigured } from '../client';
import { FlatRecord } from '../../types/society';

export async function assignResidentToFlat(
  flatNumber: string,
  data: {
    residentName: string;
    role: 'Owner' | 'Tenant';
    contact: string;
    intercom: string;
    membersCount: number;
  }
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase
      .from('flats')
      .update({
        owner_name: data.residentName,
        occupant_type: data.role,
        contact: data.contact,
        intercom: data.intercom,
        members_count: data.membersCount,
      })
      .eq('flat_number', flatNumber);

    if (error) {
      console.warn('Error assigning resident to flat in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception assigning resident to flat:', err);
    return false;
  }
}

export async function vacateFlat(flatNumber: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase
      .from('flats')
      .update({
        owner_name: 'Vacant (Unassigned)',
        occupant_type: 'Vacant',
        contact: '',
        members_count: 0,
      })
      .eq('flat_number', flatNumber);

    if (error) {
      console.warn('Error vacating flat in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception vacating flat:', err);
    return false;
  }
}

export async function createFlat(flat: FlatRecord): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { error } = await supabase
      .from('flats')
      .upsert({
        flat_number: flat.flatNumber,
        block: flat.block,
        floor: flat.floor,
        owner_name: flat.ownerName,
        occupant_type: flat.occupantType,
        contact: flat.contact,
        intercom: flat.intercom,
        members_count: flat.membersCount,
        maintenance_due: flat.maintenanceDue
      });

    if (error) {
      console.warn('Error creating flat in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception creating flat:', err);
    return false;
  }
}
