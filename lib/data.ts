import { supabase } from './supabaseClient';

// Fetch all mentor profiles from the 'mentors' table
export const fetchMentors = async () => {
  const { data, error } = await supabase.from('mentors').select('*');
  if (error) {
    console.error('Error fetching mentors:', error.message);
    return [];
  }
  return data;
};
