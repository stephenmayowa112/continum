import { supabase } from '../lib/supabaseClient';
// removed unused admin client creation

export interface Mentor {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  bio?: string;
  role?: string;
  linkedin_url?: string;
  expertise?: string[];
  years_of_experience?: number;
  hourly_rate?: number;
  rating?: number;
  total_sessions?: number;
  created_at?: string;
  updated_at?: string;
}

export async function fetchMentor(userId: string): Promise<Mentor | null> {
  console.log('PROFILE SERVICE: Fetching mentor profile for user ID:', userId);
  
  try {
    // First try to find mentor by user_id
    const { data: mentor, error } = await supabase
      .from('mentors')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('PROFILE SERVICE: Error fetching mentor by user_id:', error);
      return null;
    }
    
    // If we found a mentor, return it
    if (mentor) {
      console.log('PROFILE SERVICE: Found mentor by user_id:', mentor);
      return mentor;
    }
    
    // If not found by user_id, try direct id match
    const { data: mentorById, error: idError } = await supabase
      .from('mentors')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (idError) {
      console.error('PROFILE SERVICE: Error fetching mentor by id:', idError);
      return null;
    }
    
    console.log('PROFILE SERVICE: Found mentor by direct id:', mentorById);
    return mentorById;
    
  } catch (err) {
    console.error('PROFILE SERVICE: Unexpected error in fetchMentor:', err);
    return null;
  }
}

export async function getAvailability(mentorId: string) {
  console.log('PROFILE SERVICE: Getting availability for mentor ID:', mentorId, 'type:', typeof mentorId);
  
  try {
    // First try with regular client
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('mentor_id', mentorId)
      .eq('status', 'available');

    if (error) {
      console.error('PROFILE SERVICE: Error fetching availability for mentor', mentorId, error);
      return [];
    }

    console.log('PROFILE SERVICE: Filtered results for mentor', mentorId, ':', data);
    
    // If we got data, return it
    if (data && data.length > 0) {
      return data;
    }

    // If no data was returned, try using the server endpoint instead
    try {
      const response = await fetch('/api/mentors/' + mentorId + '/availability', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const apiData = await response.json();
        console.log('PROFILE SERVICE: Data from API endpoint:', apiData);
        return apiData;
      } else {
        console.error('PROFILE SERVICE: API endpoint error:', response.status);
        return [];
      }
    } catch (apiErr) {
      console.error('PROFILE SERVICE: Error calling API endpoint:', apiErr);
      return [];
    }
  } catch (err) {
    console.error('PROFILE SERVICE: Unexpected error in getAvailability:', err);
    return [];
  }
}