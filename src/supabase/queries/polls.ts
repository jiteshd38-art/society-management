import { supabase, isSupabaseConfigured } from '../client';
import { CommunityPoll } from '../../types/society';

export async function getPolls(): Promise<CommunityPoll[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('community_polls')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase polls fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title || row.question || '',
      description: row.description || '',
      options: typeof row.options === 'string' ? JSON.parse(row.options) : (row.options || []),
      totalVotes: Number(row.total_votes || 0),
      expiresAt: row.expires_at,
      createdAt: row.created_at || new Date().toISOString(),
      votedFlatNumbers: typeof row.voted_flat_numbers === 'string' ? JSON.parse(row.voted_flat_numbers) : (row.voted_flat_numbers || [])
    }));
  } catch (err: any) {
    console.warn('Supabase query error (polls):', err?.message || err);
    return null;
  }
}
