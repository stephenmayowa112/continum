import { supabase } from './supabaseClient';
import { Mentor } from '../src/app/dashboard/components/common/types';

/**
 * Interface for raw mentor data from the database
 */
interface MentorRecord {
  id: string;
  user_id?: string;
  name?: string;
  location?: string;
  specialization?: string;
  role?: string;
  company?: string;
  sessions_completed?: number;
  reviews_count?: number;
  years_experience?: number;
  attendance_rate?: number;
  is_available_asap?: boolean;
  provides_coaching?: boolean;
  profile_image_url?: string;
  is_top_rated?: boolean;
  categories?: string[];
  email?: string;
}

/**
 * Interface for raw session data from the database
 */
interface SessionRecord {
  id: string;
  user_id: string;
  mentor_id: string;
  date: string;
  time: string;
  session_type: string;
  meeting_url?: string;
  mentor?: MentorRecord;
}

/**
 * Interface for session data with mentor information
 */
interface SessionWithMentor extends Mentor {
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  meetingUrl?: string;
  uniqueId?: string;
}

/**
 * Fetch all mentors from the Supabase database
 * @returns Array of mentor objects
 */
export async function fetchAllMentors(): Promise<Mentor[]> {
  try {
    const { data, error } = await supabase
      .from('mentors')
      .select('*');
    
    if (error) {
      console.error('Error fetching mentors:', error);
      return [];
    }

    // Map the database fields to the Mentor interface
    return data.map((mentor: MentorRecord) => ({
      id: mentor.user_id || mentor.id,
      name: mentor.name || 'Anonymous',
      location: mentor.location || 'Unknown',
      role: mentor.specialization || mentor.role || 'Mentor',
      company: mentor.company || 'Independent',
      sessions: mentor.sessions_completed || 0,
      reviews: mentor.reviews_count || 0,
      experience: mentor.years_experience || 0,
      attendance: mentor.attendance_rate || 98,
      isAvailableASAP: mentor.is_available_asap || false,
      providesCoaching: mentor.provides_coaching || false,
      imageUrl: mentor.profile_image_url || "/images/mentor_pic.png", // Default image
      isTopRated: mentor.is_top_rated || false,
      categories: mentor.categories || [],
    }));
  } catch (err) {
    console.error('Unexpected error when fetching mentors:', err);
    return [];
  }
}

/**
 * Fetch a mentor by their user ID
 * @param id The user ID of the mentor
 * @returns Mentor object or null if not found
 */
export async function fetchMentorById(id: string): Promise<Mentor | null> {
  try {
    const { data, error } = await supabase
      .from('mentors')
      .select('*')
      .eq('user_id', id)
      .single();
    
    if (error || !data) {
      console.error('Error fetching mentor:', error);
      return null;
    }

    return {
      id: data.user_id || data.id,
      name: data.name || 'Anonymous',
      location: data.location || 'Unknown',
      role: data.specialization || data.role || 'Mentor',
      company: data.company || 'Independent',
      sessions: data.sessions_completed || 0,
      reviews: data.reviews_count || 0,
      experience: data.years_experience || 0,
      attendance: data.attendance_rate || 98,
      isAvailableASAP: data.is_available_asap || false,
      providesCoaching: data.provides_coaching || false,
      imageUrl: data.profile_image_url || "/images/mentor_pic.png", // Default image
      isTopRated: data.is_top_rated || false,
      categories: data.categories || [],
    };
  } catch (err) {
    console.error('Unexpected error when fetching mentor by ID:', err);
    return null;
  }
}

/**
 * Fetch booked sessions for a mentee by user ID
 * @param userId The user ID of the mentee
 * @returns Array of session objects (with mentor info)
 */
export async function fetchBookedSessionsByUser(userId: string): Promise<SessionWithMentor[]> {
  try {
    // Adjust table/column names as needed
    const { data, error } = await supabase
      .from('sessions')
      .select(`*, mentor:mentor_id(*)`)
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching booked sessions:', error);
      return [];
    }

    // Map sessions to include mentor info for display
    return data.map((session: SessionRecord, idx: number) => ({
      id: session.id,
      uniqueId: `${session.id}-${idx}`,
      name: session.mentor?.name || 'Mentor',
      location: session.mentor?.location || '',
      role: session.mentor?.role || '',
      company: session.mentor?.company || '',
      sessions: session.mentor?.sessions_completed || 0,
      reviews: session.mentor?.reviews_count || 0,
      experience: session.mentor?.years_experience || 0,
      attendance: session.mentor?.attendance_rate || 98,
      isAvailableASAP: session.mentor?.is_available_asap || false,
      providesCoaching: session.mentor?.provides_coaching || false,
      imageUrl: session.mentor?.profile_image_url || '/images/mentor_pic.png',
      isTopRated: session.mentor?.is_top_rated || false,
      categories: session.mentor?.categories || [],
      sessionDate: session.date,
      sessionTime: session.time,
      sessionType: session.session_type,
      meetingUrl: session.meeting_url,
    }));
  } catch (err) {
    console.error('Unexpected error when fetching booked sessions:', err);
    return [];
  }
}