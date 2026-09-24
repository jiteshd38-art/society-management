import { supabase, isSupabaseConfigured } from '../client';
import { Notice } from '../../types/society';

export async function getNotices(): Promise<Notice[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('is_pinned', { ascending: false });

    if (error) {
      console.warn('Supabase notices fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      isPinned: Boolean(row.is_pinned),
      publishedDate: row.published_date,
      authorName: row.author_name,
      authorRole: row.author_role,
      targetBlocks: typeof row.target_blocks === 'string' ? JSON.parse(row.target_blocks) : (row.target_blocks || ['All'])
    }));
  } catch (err: any) {
    console.warn('Supabase query error (notices):', err?.message || err);
    return null;
  }
}
