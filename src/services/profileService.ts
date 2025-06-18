import { supabase } from '../lib/supabaseClient';

// Mentor table row
interface MentorRecord {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  bio?: string;
  profile_image_url?: string;
  created_at?: string;
}

// Mentee table row
interface MenteeRecord {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  bio?: string;
  profile_image_url?: string;
  created_at?: string;
}

// Availability slot row
interface AvailabilityRecord {
  id: string;
  mentor_id: string;
  start_time: string;
  end_time: string;
  
  created_at: string;
}

// Social link row
interface SocialLinkRecord {
  id: string;
  mentor_id: string;
  platform: string;
  url: string;
  created_at: string;
}

// Calendar OAuth row
export interface CalendarOAuthRecord {
  id: string;
  mentor_id: string;
  provider: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
}

// User Calendar OAuth row (for all users)
export interface UserCalendarOAuthRecord {
  id: string;
  user_id: string;
  provider: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
}

// Expertise Tags
export async function getExpertiseTags() {
  const { data, error } = await supabase
    .from('expertise_tags')
    .select('*');
  if (error) throw error;
  return data;
}

// Mentor Expertise
export async function getMentorExpertise(mentorId: string) {
  const { data, error } = await supabase
    .from('mentor_expertise')
    .select('tag_id')
    .eq('mentor_id', mentorId);
  if (error) throw error;
  return data?.map((r) => r.tag_id);
}

export async function addMentorExpertise(mentorId: string, tagId: string) {
  const { error } = await supabase
    .from('mentor_expertise')
    .insert({ mentor_id: mentorId, tag_id: tagId });
  if (error) throw error;
}

export async function removeMentorExpertise(mentorId: string, tagId: string) {
  const { error } = await supabase
    .from('mentor_expertise')
    .delete()
    .match({ mentor_id: mentorId, tag_id: tagId });
  if (error) throw error;
}

// Availability
export async function getAvailability(mentorId: string) {
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('mentor_id', mentorId);
  if (error) throw error;
  return data;
}

export async function createAvailability(slot: Omit<AvailabilityRecord, 'id' | 'created_at'>) {
  // Always set new slot to 'available' to satisfy the CHECK constraint
  const toInsert = { ...slot, status: 'available' };
  const { data, error } = await supabase
    .from('availability')
    .insert(toInsert)
    .select()
    .single();
  
  if (error) throw error;
  return { data, error }; // Return an object with data and error properties
}

export async function updateAvailability(id: string, updates: Partial<AvailabilityRecord>) {
  const { data, error } = await supabase
    .from('availability')
    .update(updates)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAvailability(id: string) {
  const { error } = await supabase
    .from('availability')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Social Links
export async function getSocialLinks(mentorId: string) {
  const { data, error } = await supabase
    .from('mentor_social_links')
    .select('*')
    .eq('mentor_id', mentorId);
  if (error) throw error;
  return data;
}

export async function createSocialLink(link: Omit<SocialLinkRecord, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('mentor_social_links')
    .insert(link)
    .single();
  if (error) throw error;
  return data;
}

export async function updateSocialLink(id: string, updates: Partial<SocialLinkRecord>) {
  const { data, error } = await supabase
    .from('mentor_social_links')
    .update(updates)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSocialLink(id: string) {
  const { error } = await supabase
    .from('mentor_social_links')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Calendar OAuth
export async function getCalendarOAuth(mentorId: string) {
  const { data, error } = await supabase
    .from('mentor_calendar_oauth')
    .select('*')
    .eq('mentor_id', mentorId);
  if (error) throw error;
  return data?.[0] || null;
}

export async function saveCalendarOAuth(record: Omit<CalendarOAuthRecord, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('mentor_calendar_oauth')
    .upsert(record)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCalendarOAuth(id: string) {
  const { error } = await supabase
    .from('mentor_calendar_oauth')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Core Mentor Profile
export async function getMentorProfileByUser(userId: string) {
  const { data, error } = await supabase
    .from('mentors')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) {
    console.warn('No mentor profile found, creating new one for user:', userId, error);
    // Create a new mentor record with minimal fields
    const insertRes = await supabase
      .from('mentors')
      .insert({ user_id: userId, name: '' })
      .single();
    if (insertRes.error) throw insertRes.error;
    return insertRes.data;
  }
  return data;
}

export async function updateMentorProfile(userId: string, updates: Partial<MentorRecord>) {
  // Update profile by user_id instead of direct mentor id
  const { data, error } = await supabase
    .from('mentors')
    .update(updates)
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
}

// Core Mentee Profile
export async function getMenteeProfileByUser(userId: string) {
  const { data, error } = await supabase
    .from('mentees')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) {
    console.warn('No mentee profile found, creating new one for user:', userId, error);
    // Create a new mentee record with minimal fields
    const insertRes = await supabase
      .from('mentees')
      .insert({ user_id: userId, name: '' })
      .single();
    if (insertRes.error) throw insertRes.error;
    return insertRes.data;
  }
  return data;
}

export async function updateMenteeProfile(userId: string, updates: Partial<MenteeRecord>) {
  // Update profile by user_id instead of direct mentee id
  const { data, error } = await supabase
    .from('mentees')
    .update(updates)
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
}

// Mentor Statistics
export interface MentorStats {
  sessionsCompleted: number;
  activeMentees: number;
  rating: number;
}

// User Calendar OAuth functions
export async function getUserCalendarOAuth(userId: string) {
  const { data, error } = await supabase
    .from('user_calendar_oauth')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data?.[0] || null;
}

export async function saveUserCalendarOAuth(record: Omit<UserCalendarOAuthRecord, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('user_calendar_oauth')
    .upsert(record)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteUserCalendarOAuth(userId: string) {
  const { error } = await supabase
    .from('user_calendar_oauth')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

// Helper function to get calendar OAuth tokens for any user type
export async function getCalendarOAuthForUser(userId: string, isMentor: boolean = false) {
  if (isMentor) {
    // Try to find mentor record first
    const mentor = await getMentorProfileByUser(userId);
    if (mentor) {
      const mentorOAuth = await getCalendarOAuth(mentor.id);
      if (mentorOAuth) return mentorOAuth;
    }
  }
  
  // Fall back to user-level OAuth
  return await getUserCalendarOAuth(userId);
}

export async function getMentorStats(mentorId: string): Promise<MentorStats> {
  try {
    // Check if the tables exist first
    const { error: tablesError } = await supabase
      .from('mentoring_sessions')
      .select('count')
      .limit(1);

    // If tables don't exist, return placeholder data
    if (tablesError) {
      console.log('Tables not found, using placeholder data:', tablesError);
      return {
        sessionsCompleted: 0,
        activeMentees: 0,
        rating: 0
      };
    }
    
    // Get sessions completed
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('mentoring_sessions')
      .select('count')
      .eq('mentor_id', mentorId)
      .eq('status', 'completed')
      .single();
      
    if (sessionsError) console.error('Error fetching sessions:', sessionsError);
    
    // Get active mentees (mentees with at least one active or upcoming session)
    const { data: menteesData, error: menteesError } = await supabase
      .from('mentoring_sessions')
      .select('mentee_id')
      .eq('mentor_id', mentorId)
      .in('status', ['upcoming', 'active'])
      .is('cancelled_at', null);
      
    if (menteesError) console.error('Error fetching mentees:', menteesError);
    
    // Get unique mentee count
    const uniqueMentees = menteesData ? [...new Set(menteesData.map(item => item.mentee_id))] : [];
    
    // Get average rating
    const { data: ratingsData, error: ratingsError } = await supabase
      .from('mentor_reviews')
      .select('rating')
      .eq('mentor_id', mentorId);
      
    if (ratingsError) console.error('Error fetching ratings:', ratingsError);
    
    // Calculate average rating
    const ratings = ratingsData || [];
    const averageRating = ratings.length 
      ? Number((ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length).toFixed(1))
      : 0;
    
    return {
      sessionsCompleted: sessionsData?.count || 0,
      activeMentees: uniqueMentees.length || 0,
      rating: averageRating || 0
    };
  } catch (error) {
    console.error('Error fetching mentor statistics:', error);
    // Return default values if there's an error
    return {
      sessionsCompleted: 0,
      activeMentees: 0,
      rating: 0
    };
  }
}
