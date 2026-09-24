import { supabase, isSupabaseConfigured } from '../client';
import { Notice } from '../../types/society';

export async function createNoticeRecord(
  data: Omit<Notice, 'id' | 'publishedDate'>
): Promise<Notice> {
  const id = `not-${Date.now()}`;
  const today = new Date().toISOString().split('T')[0];

  const newNotice: Notice = {
    ...data,
    id,
    publishedDate: today
  };

  if (!isSupabaseConfigured) {
    return newNotice;
  }

  try {
    const row = {
      id: newNotice.id,
      title: newNotice.title,
      content: newNotice.content,
      category: newNotice.category,
      is_pinned: newNotice.isPinned,
      published_date: newNotice.publishedDate,
      author_name: newNotice.authorName,
      author_role: newNotice.authorRole,
      target_blocks: newNotice.targetBlocks,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('notices').insert([row]);
    if (error) {
      console.warn('Supabase create notice notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (createNoticeRecord):', err?.message || err);
  }

  return newNotice;
}

export async function deleteNoticeRecord(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase delete notice notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (deleteNoticeRecord):', err?.message || err);
  }
}

export async function togglePinNoticeRecord(id: string, currentPinned: boolean): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await supabase
      .from('notices')
      .update({ is_pinned: !currentPinned })
      .eq('id', id);

    if (error) {
      console.warn('Supabase toggle pin notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (togglePinNoticeRecord):', err?.message || err);
  }
}
