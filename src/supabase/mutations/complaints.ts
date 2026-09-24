import { supabase, isSupabaseConfigured } from '../client';
import { Complaint, ComplaintComment } from '../../types/society';

export async function createComplaintRecord(
  data: Omit<Complaint, 'id' | 'ticketNumber' | 'status' | 'createdAt' | 'updatedAt' | 'comments'>
): Promise<Complaint> {
  const id = `cmp-${Date.now()}`;
  const now = new Date().toISOString();
  const ticketNumber = `TKT-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;

  const newComplaint: Complaint = {
    id,
    ticketNumber,
    flatNumber: data.flatNumber,
    residentName: data.residentName,
    residentPhone: data.residentPhone,
    category: data.category,
    priority: data.priority,
    title: data.title,
    description: data.description,
    status: 'open',
    createdAt: now,
    updatedAt: now,
    comments: []
  };

  if (!isSupabaseConfigured) {
    return newComplaint;
  }

  try {
    const row = {
      id: newComplaint.id,
      ticket_number: newComplaint.ticketNumber,
      flat_number: newComplaint.flatNumber,
      resident_name: newComplaint.residentName,
      resident_phone: newComplaint.residentPhone,
      category: newComplaint.category,
      priority: newComplaint.priority,
      title: newComplaint.title,
      description: newComplaint.description,
      status: newComplaint.status,
      assigned_staff_id: null,
      assigned_staff_name: null,
      resolution_notes: null,
      rating: null,
      comments: [],
      created_at: now,
      updated_at: now
    };

    const { error } = await supabase.from('complaints').insert([row]);
    if (error) {
      console.warn('Supabase create complaint notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (createComplaintRecord):', err?.message || err);
  }

  return newComplaint;
}

export async function updateComplaintState(
  id: string,
  status: Complaint['status'],
  resolutionNotes?: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const now = new Date().toISOString();
    const updateData: any = {
      status,
      updated_at: now
    };

    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = now;
    }
    if (resolutionNotes) {
      updateData.resolution_notes = resolutionNotes;
    }

    const { error } = await supabase
      .from('complaints')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.warn('Supabase update complaint status notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (updateComplaintState):', err?.message || err);
  }
}

export async function assignStaffToComplaint(
  id: string,
  staffId: string,
  staffName: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('complaints')
      .update({
        assigned_staff_id: staffId,
        assigned_staff_name: staffName,
        status: 'assigned',
        updated_at: now
      })
      .eq('id', id);

    if (error) {
      console.warn('Supabase assign staff notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (assignStaffToComplaint):', err?.message || err);
  }
}

export async function addCommentToComplaint(
  id: string,
  currentComments: ComplaintComment[],
  newComment: ComplaintComment
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const now = new Date().toISOString();
    const updatedComments = [...currentComments, newComment];

    const { error } = await supabase
      .from('complaints')
      .update({
        comments: updatedComments,
        updated_at: now
      })
      .eq('id', id);

    if (error) {
      console.warn('Supabase add comment notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (addCommentToComplaint):', err?.message || err);
  }
}

export async function rateComplaintTicket(
  id: string,
  rating: number
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await supabase
      .from('complaints')
      .update({
        rating,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.warn('Supabase rate complaint notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (rateComplaintTicket):', err?.message || err);
  }
}
