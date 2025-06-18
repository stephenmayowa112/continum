import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  const { email, password, role } = await request.json();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return NextResponse.json({ error: error?.message || 'Invalid credentials' }, { status: 401 });
  }

  // After successful login, check for profile in mentees or mentors
  const userId = data.user.id;
  let profile = null;
  let profileType = null;
  // Try mentee first
  const { data: menteeProfile } = await supabase.from('mentees').select('*').eq('user_id', userId).single();
  if (menteeProfile) {
    profile = menteeProfile;
    profileType = 'mentee';
  } else {
    // Try mentor
    const { data: mentorProfile } = await supabase.from('mentors').select('*').eq('user_id', userId).single();
    if (mentorProfile) {
      profile = mentorProfile;
      profileType = 'mentor';
    }
  }

  // If no profile, create a default one (using role if provided, else default to mentee)
  if (!profile) {
    const defaultProfile = {
      user_id: userId,
      name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '',
      email: data.user.email,
      linkedin_url: '',
      date_of_birth: null,
      role: role || 'mentee',
    };
    if ((role || '').toLowerCase() === 'mentor') {
      const { data: mentorData, error: mentorError } = await supabase.from('mentors').insert(defaultProfile).select().single();
      if (mentorError) {
        return NextResponse.json({ error: 'Authenticated, but failed to create mentor profile.' }, { status: 500 });
      }
      profile = mentorData;
      profileType = 'mentor';
    } else {
      const { data: menteeData, error: menteeError } = await supabase.from('mentees').insert(defaultProfile).select().single();
      if (menteeError) {
        return NextResponse.json({ error: 'Authenticated, but failed to create mentee profile.' }, { status: 500 });
      }
      profile = menteeData;
      profileType = 'mentee';
    }
  }

  return NextResponse.json({ user: data.user, session: data.session, profile, profileType });
}