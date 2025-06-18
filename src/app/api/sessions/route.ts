import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabaseClient';

export const runtime = 'nodejs';

// Create admin client at request time so env vars are picked up
export async function GET(request: import('next/server').NextRequest) {
  console.log('API/sessions GET - NODE_ENV:', process.env.NODE_ENV);
  console.log('API/sessions GET - SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('API/sessions GET - SUPABASE_SERVICE_ROLE_KEY present:', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY));
  console.log('API/sessions GET - service key snippet:', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0,5) + '...' + process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-5));
  const supabaseAdmin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const mentorId = searchParams.get('mentorId');
  const menteeId = searchParams.get('menteeId');
  try {
    if (mentorId) {
      const { data, error } = await supabaseAdmin
        .from('mentoring_sessions')
        .select(`*, mentees:mentee_id(id, name, profile_image_url)`)
        .eq('mentor_id', mentorId)
        .order('start_time', { ascending: true });
      if (error) throw error;
      return NextResponse.json({ sessions: data });
    }
    if (menteeId) {
      const { data, error } = await supabaseAdmin
        .from('mentoring_sessions')
        .select(`*, mentors:mentor_id(id, name, role, company, profile_image_url)`)
        .eq('mentee_id', menteeId)
        .order('start_time', { ascending: true });
      if (error) throw error;
      return NextResponse.json({ sessions: data });
    }
    return NextResponse.json({ error: 'Missing mentorId or menteeId' }, { status: 400 });
  } catch (err: any) {
    console.error('API sessions GET error:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

// This endpoint handles session creation with admin privileges
export async function POST(request: Request) {
  const supabaseAdmin = createAdminClient();
  try {
    const sessionData = await request.json();
    console.log('API: Creating session with data:', sessionData);

    // Validate required fields
    const requiredFields = ['mentor_id', 'mentee_id', 'status', 'start_time', 'end_time'];
    for (const field of requiredFields) {
      if (!sessionData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Check if the mentor exists by ID or user_id
    const { data: mentorExists, error: mentorCheckError } = await supabaseAdmin
      .from('mentors')
      .select('id')
      .or(`id.eq.${sessionData.mentor_id},user_id.eq.${sessionData.mentor_id}`)
      .maybeSingle();
    
    if (mentorCheckError) {
      console.error('API: Error checking mentor:', mentorCheckError);
      return NextResponse.json(
        { error: 'Error checking mentor: ' + mentorCheckError.message },
        { status: 500 }
      );
    }
    
    let mentorId = mentorExists?.id;
    
    // If mentor doesn't exist, create a mentor record
    if (!mentorExists) {
      console.log('API: Could not find mentor with ID ' + sessionData.mentor_id);
      
      // Check if a user record exists with this ID
      const { data: userExists, error: userCheckError } = await supabaseAdmin
        .from('Users')
        .select('*')
        .eq('user_id', sessionData.mentor_id)
        .maybeSingle();
        
      if (userCheckError) {
        console.error('API: Error checking user:', userCheckError);
        return NextResponse.json(
          { error: 'Error checking user: ' + userCheckError.message },
          { status: 500 }
        );
      }
      
      if (!userExists) {
        return NextResponse.json(
          { error: 'Invalid mentor_id: This mentor does not exist in the system' },
          { status: 400 }
        );
      }
      
      // Create a mentor record for this user
      console.log('API: Creating mentor record for user');
      
      const { data: newMentor, error: createMentorError } = await supabaseAdmin
        .from('mentors')
        .insert({
          user_id: sessionData.mentor_id,
          name: userExists.name || 'New Mentor',
          email: 'mentor@example.com', // Required field, but using placeholder
          role: 'Mentor', // Required field
          linkedin_url: userExists.linkedin || 'https://linkedin.com' // Required field, but using placeholder
        })
        .select()
        .single();
      
      if (createMentorError) {
        console.error('API: Error creating mentor:', createMentorError);
        return NextResponse.json(
          { error: 'Failed to create mentor record: ' + createMentorError.message },
          { status: 500 }
        );
      }
      
      console.log('API: Created new mentor record:', newMentor);
      mentorId = newMentor.id;
    }
    
    // Now check if the mentee exists
    const { data: menteeExists, error: menteeCheckError } = await supabaseAdmin
      .from('mentees')
      .select('id')
      .or(`id.eq.${sessionData.mentee_id},user_id.eq.${sessionData.mentee_id}`)
      .maybeSingle();
    
    let menteeId = menteeExists?.id;
    
    if (menteeCheckError) {
      console.error('API: Error checking mentee:', menteeCheckError);
    }
    
    // If mentee doesn't exist, create a mentee record
    if (!menteeExists) {
      console.log('API: Mentee not found, creating record');
      
      // Check if a user record exists with this ID
      const { data: userExists, error: userCheckError } = await supabaseAdmin
        .from('Users')
        .select('*')
        .eq('user_id', sessionData.mentee_id)
        .maybeSingle();
      
      if (userCheckError) {
        console.error('API: Error checking user for mentee:', userCheckError);
        return NextResponse.json(
          { error: 'Error checking user: ' + userCheckError.message },
          { status: 500 }
        );
      }
      
      // Create a mentee record
      const { data: newMentee, error: createMenteeError } = await supabaseAdmin
        .from('mentees')
        .insert({
          user_id: sessionData.mentee_id,
          name: userExists?.name || 'New Mentee',
          email: 'mentee@example.com', // Required field, but using placeholder
          role: 'Mentee', // Required field
          linkedin_url: userExists?.linkedin || 'https://linkedin.com' // Required field
        })
        .select()
        .single();
      
      if (createMenteeError) {
        console.error('API: Error creating mentee:', createMenteeError);
        return NextResponse.json(
          { error: 'Failed to create mentee record: ' + createMenteeError.message },
          { status: 500 }
        );
      }
      
      console.log('API: Created new mentee record:', newMentee);
      menteeId = newMentee.id;
    }
    
    // Map fields to the actual database schema (based on db.md documentation)
    const dbSessionData = {
      mentor_id: mentorId || sessionData.mentor_id,
      mentee_id: menteeId || sessionData.mentee_id,
      status: sessionData.status,
      start_time: sessionData.start_time,
      end_time: sessionData.end_time,
      title: sessionData.title,
      meeting_link: sessionData.meeting_link,
      description: sessionData.description
    };
    
    console.log('API: Mapped session data for DB insertion:', dbSessionData);

    // Insert session using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('mentoring_sessions')
      .insert(dbSessionData)
      .select()
      .single();

    if (error) {
      console.error('API: Error creating session:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('API: Successfully created session:', data);
    return NextResponse.json(data);
  } catch (err) {
    console.error('API: Unexpected error in sessions endpoint:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: (err as any).message },
      { status: 500 }
    );
  }
}