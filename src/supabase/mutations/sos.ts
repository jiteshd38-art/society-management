import { supabase, isSupabaseConfigured } from '../client';
import { EmergencySOS } from '../../types/society';

export async function createEmergencySOS(data: {
  type: EmergencySOS['type'];
  flatNumber: string;
  residentName: string;
  phone: string;
  notes?: string;
}): Promise<EmergencySOS> {
  const id = `sos-${Date.now()}`;
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const newSOS: EmergencySOS = {
    id,
    type: data.type,
    flatNumber: data.flatNumber,
    residentName: data.residentName,
    phone: data.phone,
    timestamp: now,
    status: 'active',
    notes: data.notes
  };

  if (!isSupabaseConfigured) {
    return newSOS;
  }

  try {
    const row = {
      id,
      flat_number: newSOS.flatNumber,
      resident_name: newSOS.residentName,
      phone: newSOS.phone,
      type: newSOS.type,
      timestamp: newSOS.timestamp,
      status: 'active',
      responded_by: null,
      notes: newSOS.notes || null,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('emergency_sos').insert([row]);
    if (error) {
      console.warn('Supabase create emergency SOS notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (createEmergencySOS):', err?.message || err);
  }

  return newSOS;
}

export async function resolveEmergencySOS(
  id: string,
  responderName: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await supabase
      .from('emergency_sos')
      .update({
        status: 'resolved',
        responded_by: responderName,
        resolved_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.warn('Supabase resolve emergency SOS notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (resolveEmergencySOS):', err?.message || err);
  }
}
