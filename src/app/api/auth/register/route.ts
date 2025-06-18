import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { sendMentorSignupEmail } from '../../../../services/emailService';

// Helper function to retry operations
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000,
  retryOn?: (error: any) => boolean
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0 || (retryOn && !retryOn(error))) {
      throw error;
    }
    console.log(`Operation failed, retrying in ${delay}ms... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(operation, retries - 1, delay * 1.5, retryOn);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, linkedin, dob, role = 'mentee' } = await request.json();
    
    console.log('Starting registration for:', email);

    // Try to sign up the user
    const { data, error } = await withRetry(
      () => supabase.auth.signUp({ email, password }),
      2,
      1000,
      (err) => err.code === 'UND_ERR_CONNECT_TIMEOUT' // Only retry on timeout errors
    );

    // Check if the user already exists or there was a different error
    let authUserId;
    let isNewAuthUser = false;
    
    if (error) {
      // If the error is "User already registered", we need to use signInWithPassword to get the user ID
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        console.log('User already exists, checking credentials');
        // We can't get existing user ID without credentials, so just continue with profile check
        // We'll check if profiles exist for this email
      } else {
        // If it's any other error, return it
        console.error('Auth signup error:', error);
        return NextResponse.json({ 
          error: error.message || 'Sign-up failed',
          details: error.cause ? String(error.cause) : undefined
        }, { status: 400 });
      }
    } else if (data.user) {
      // New user created successfully
      authUserId = data.user.id;
      isNewAuthUser = true;
      console.log('User created successfully:', authUserId);
    }

    // Parse DOB to ISO date string (YYYY-MM-DD)
    let isoDob = '';
    if (dob.includes('-')) {
      isoDob = dob;
    } else if (dob.includes('/')) {
      const [day, month, year] = dob.split('/');
      isoDob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      return NextResponse.json({ error: 'Invalid date of birth format.' }, { status: 400 });
    }
    if (!isoDob || isNaN(Date.parse(isoDob))) {
      return NextResponse.json({ error: 'Invalid date of birth format.' }, { status: 400 });
    }

    // Check if profile exists in either table using email
    if (role === 'mentee') {
      // Check if user already has a mentee profile with this email
      const { data: existingMentee } = await supabase.from('mentees').select('id, user_id').eq('email', email).single();
      if (existingMentee) {
        return NextResponse.json({ error: 'An account with this email already exists. Please log in or reset your password.' }, { status: 400 });
      }
      
      // Check if user has a mentor profile with this email (they can't be both)
      const { data: existingMentor } = await supabase.from('mentors').select('id').eq('email', email).single();
      if (existingMentor) {
        return NextResponse.json({ error: 'You already have a mentor account. You cannot register as a mentee.' }, { status: 400 });
      }
    } else if (role === 'mentor') {
      // Check if user already has a mentor profile with this email
      const { data: existingMentor } = await supabase.from('mentors').select('id, user_id').eq('email', email).single();
      if (existingMentor) {
        return NextResponse.json({ error: 'An account with this email already exists. Please log in or reset your password.' }, { status: 400 });
      }
      
      // Check if user has a mentee profile with this email (they can't be both)
      const { data: existingMentee } = await supabase.from('mentees').select('id').eq('email', email).single();
      if (existingMentee) {
        return NextResponse.json({ error: 'You already have a mentee account. You cannot register as a mentor.' }, { status: 400 });
      }
    }

    // If this is an existing auth user but we don't have their ID, we need to create profile without user_id
    // The login endpoint will handle linking it after successful login
    
    // Create profile data
    const profileData: Record<string, any> = {
      user_id: authUserId,
      name,
      email,
      linkedin_url: linkedin,
      date_of_birth: isoDob,
      role,
      // bio will be conditionally added below
      bio: role === 'mentor' ? `New mentor joined on ${new Date().toISOString().split('T')[0]}` : undefined
    };
    
    // Insert into correct table based on role
    if (role === 'mentee') {
      const menteeResult = await withRetry(
        () => supabase.from('mentees')
          .insert(profileData) as unknown as Promise<{ data: any; error: any }>,
        2,
        1000
      );
      const menteeError = menteeResult.error;
      if (menteeError) {
        console.error('Mentee profile insert error:', menteeError);
        return NextResponse.json({ error: menteeError.message }, { status: 500 });
      }
    } else {
      const profileResult = await withRetry(
        () => supabase.from('mentors')
          .insert(profileData) as unknown as Promise<{ data: any; error: any }>,
        2,
        1000
      );
      const profileError = profileResult.error;
      if (profileError) {
        console.error('Profile insert error:', profileError);
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
      // Send welcome email to new mentor
      try {
        await sendMentorSignupEmail({
          to_email: email,
          to_name: name,
          message: profileData.bio || ''
        });
        console.log('Mentor signup email sent to:', email);
      } catch (emailErr) {
        console.error('Failed to send mentor signup email:', emailErr);
      }
    }
    
    console.log('Registration complete for:', email);
    return NextResponse.json({ 
      user: { id: authUserId, email }, 
      session: data?.session || null, 
      isNewAuthUser,
      message: isNewAuthUser 
        ? 'Registration successful! You can now log in.' 
        : 'Profile created successfully. Please log in with your credentials.'
    });
  } catch (err) {
    console.error('Unexpected registration error:', err);
    return NextResponse.json({ 
      error: 'Registration failed',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}