import { supabase, isSupabaseConfigured } from '../client';
import { DomesticWorker } from '../../types/society';

export async function toggleDomesticWorkerStatus(
  id: string,
  currentInside: boolean
): Promise<{ isInside: boolean; lastPunch: string }> {
  const newInside = !currentInside;
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const punchText = `${timeString} (${newInside ? 'In' : 'Out'})`;

  if (!isSupabaseConfigured) {
    return { isInside: newInside, lastPunch: punchText };
  }

  try {
    const { error } = await supabase
      .from('domestic_workers')
      .update({
        is_inside: newInside,
        last_punch: punchText
      })
      .eq('id', id);

    if (error) {
      console.warn('Supabase update domestic worker notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (toggleDomesticWorkerStatus):', err?.message || err);
  }

  return { isInside: newInside, lastPunch: punchText };
}
