import { supabase } from '../lib/supabaseClient';

// Types
interface SessionData {
  mentor_id: string;
  mentee_id: string;
  title: string;
  description?: string; // Client-side code uses description
  agenda?: string;      // Database uses agenda
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  meeting_link?: string;
}

// Create a new session
export async function createSession(data: SessionData) {
  try {
    // First prepare session data to match database schema
    const sessionData = {
      ...data,
      agenda: data.description, // Map description to agenda field for the database
    };
    
    // First try to use direct client (for mentors with permissions)
    const { data: session, error } = await supabase
      .from('mentoring_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (!error) {
      return session;
    }
    
    console.log('Direct session creation failed, trying API endpoint:', error);
    
    // If direct approach fails due to RLS, try using an API endpoint
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API session creation failed:', response.status, errorText);
      throw new Error(`API session creation failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    // Detailed logging of error
    console.error('Error creating session:', error);
    // Throw a native Error with error details
    throw new Error(
      `Session creation failed: ${error.message || JSON.stringify(error)}`
    );
  }
}

// Get sessions for a mentee
export async function getMenteeSessions(menteeId: string) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/sessions?menteeId=${menteeId}`;
  console.log('Fetching mentee sessions from URL:', url);
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('Error fetching mentee sessions via API:', err);
    throw new Error('Failed to fetch mentee sessions');
  }
  const json = await res.json();
  return json.sessions || [];
}

// Get sessions for a mentor
export async function getMentorSessions(mentorId: string) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/sessions?mentorId=${mentorId}`;
  console.log('Fetching mentor sessions from URL:', url);
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('Error fetching mentor sessions via API:', err);
    throw new Error('Failed to fetch mentor sessions');
  }
  const json = await res.json();
  return json.sessions || [];
}

// Get bookings for a mentor
export async function getMentorBookings(mentorId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`*`)
    .eq('mentor_id', mentorId)
    .order('booking_date', { ascending: true })
    .order('booking_time', { ascending: true });

  if (error) {
    console.error('Error fetching mentor bookings:', error);
    throw error;
  }

  return data || [];
}

// Get a specific session by ID
export async function getSessionById(sessionId: string) {
  const { data, error } = await supabase
    .from('mentoring_sessions')
    .select(`
      *,
      mentors:mentor_id(id, name, role, company, profile_image_url),
      mentees:mentee_id(id, name, profile_image_url)
    `)
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('Error fetching session:', error);
    throw error;
  }

  return data;
}

// Start a session (change status to active)
export async function startSession(sessionId: string) {
  const { data, error } = await supabase
    .from('mentoring_sessions')
    .update({ status: 'active' })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error starting session:', error);
    throw error;
  }

  return data;
}

// Complete a session
export async function completeSession(sessionId: string) {
  const { data, error } = await supabase
    .from('mentoring_sessions')
    .update({ status: 'completed' })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error completing session:', error);
    throw error;
  }

  return data;
}

// Cancel a session
export async function cancelSession(sessionId: string, reason?: string) {
  const { data, error } = await supabase
    .from('mentoring_sessions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason || null
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error cancelling session:', error);
    throw error;
  }

  return data;
}

// Update a session
export async function updateSession(sessionId: string, updates: Partial<SessionData>) {
  const { data, error } = await supabase
    .from('mentoring_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating session:', error);
    throw error;
  }

  return data;
}

// Get upcoming sessions count for a mentor
export async function getUpcomingSessionsCount(mentorId: string) {
  const { count, error } = await supabase
    .from('mentoring_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('mentor_id', mentorId)
    .eq('status', 'upcoming');

  if (error) {
    console.error('Error counting upcoming sessions:', error);
    throw error;
  }

  return count || 0;
}

// Get completed sessions count for a mentor
export async function getCompletedSessionsCount(mentorId: string) {
  const { count, error } = await supabase
    .from('mentoring_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('mentor_id', mentorId)
    .eq('status', 'completed');

  if (error) {
    console.error('Error counting completed sessions:', error);
    throw error;
  }

  return count || 0;
}