import { supabase, isSupabaseConfigured } from '../client';
import { Complaint } from '../../types/society';

export async function getComplaints(): Promise<Complaint[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase complaints fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      ticketNumber: row.ticket_number,
      flatNumber: row.flat_number,
      residentName: row.resident_name,
      residentPhone: row.resident_phone,
      category: row.category,
      priority: row.priority,
      title: row.title,
      description: row.description,
      status: row.status,
      assignedStaffId: row.assigned_staff_id || undefined,
      assignedStaffName: row.assigned_staff_name || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at || row.created_at,
      resolvedAt: row.resolved_at || undefined,
      resolutionNotes: row.resolution_notes || undefined,
      rating: row.rating ? Number(row.rating) : undefined,
      comments: typeof row.comments === 'string' ? JSON.parse(row.comments) : (row.comments || [])
    }));
  } catch (err: any) {
    console.warn('Supabase query error (complaints):', err?.message || err);
    return null;
  }
}
