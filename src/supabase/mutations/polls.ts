import { supabase, isSupabaseConfigured } from '../client';
import { CommunityPoll } from '../../types/society';

export async function createPollRecord(data: {
  title: string;
  description: string;
  options: string[];
  expiresAt: string;
}): Promise<CommunityPoll> {
  const id = `poll-${Date.now()}`;
  const now = new Date().toISOString();

  const formattedOptions = data.options.map((optText, index) => ({
    id: `opt-${index + 1}`,
    text: optText,
    votes: 0
  }));

  const newPoll: CommunityPoll = {
    id,
    title: data.title,
    description: data.description,
    options: formattedOptions,
    totalVotes: 0,
    expiresAt: data.expiresAt,
    createdAt: now,
    votedFlatNumbers: []
  };

  if (!isSupabaseConfigured) {
    return newPoll;
  }

  try {
    const row = {
      id,
      title: newPoll.title,
      description: newPoll.description,
      options: newPoll.options,
      total_votes: 0,
      expires_at: newPoll.expiresAt,
      created_at: now,
      voted_flat_numbers: []
    };

    const { error } = await supabase.from('community_polls').insert([row]);
    if (error) {
      console.warn('Supabase create poll notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (createPollRecord):', err?.message || err);
  }

  return newPoll;
}

export async function castPollVote(
  pollId: string,
  currentPoll: CommunityPoll,
  optionId: string,
  flatNumber: string
): Promise<CommunityPoll> {
  const updatedOptions = currentPoll.options.map(opt => {
    if (opt.id === optionId) {
      return {
        ...opt,
        votes: opt.votes + 1
      };
    }
    return opt;
  });

  const updatedPoll: CommunityPoll = {
    ...currentPoll,
    options: updatedOptions,
    totalVotes: currentPoll.totalVotes + 1,
    votedFlatNumbers: [...currentPoll.votedFlatNumbers, flatNumber]
  };

  if (!isSupabaseConfigured) {
    return updatedPoll;
  }

  try {
    const { error } = await supabase
      .from('community_polls')
      .update({
        options: updatedPoll.options,
        total_votes: updatedPoll.totalVotes,
        voted_flat_numbers: updatedPoll.votedFlatNumbers
      })
      .eq('id', pollId);

    if (error) {
      console.warn('Supabase cast vote notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (castPollVote):', err?.message || err);
  }

  return updatedPoll;
}
