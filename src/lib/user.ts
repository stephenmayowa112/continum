import { supabase } from '../lib/supabaseClient';

export type UserRole = 'mentor' | 'mentee';

export async function getUserRole(userId: string): Promise<UserRole | null> {
  if (!userId) return null;
  
  // Check if user is in mentors table
  const { data: mentorData } = await supabase
    .from('mentors')
    .select('id')
    .eq('user_id', userId)
    .single();
    
  if (mentorData) return 'mentor';
  
  // If not in mentors, check mentees table
  const { data: menteeData } = await supabase
    .from('mentees')
    .select('id')
    .eq('user_id', userId)
    .single();
    
  if (menteeData) return 'mentee';
  
  // User not found in either table
  return null;
}

export async function getUserProfile(userId: string) {
  if (!userId) return null;
  
  // Try mentors table first
  const { data: mentorData } = await supabase
    .from('mentors')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (mentorData) return { ...mentorData, role: 'mentor' };
  
  // If not in mentors, check mentees table
  const { data: menteeData } = await supabase
    .from('mentees')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (menteeData) return { ...menteeData, role: 'mentee' };
  
  // User not found in either table
  return null;
}