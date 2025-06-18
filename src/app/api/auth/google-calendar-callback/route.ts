import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      persistSession: false,
    }
  }
);

export async function GET(request: NextRequest) {
  // Get authorization code from Google OAuth
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  if (!code) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${'No authorization code received'}`, request.url)
    );
  }
  
  try {
    // Parse the state parameter to get user info
    const { userId, userRole } = JSON.parse(decodeURIComponent(state || '{}'));
    
    if (!userId || !userRole) {
      throw new Error('Invalid state parameter');
    }
    
    // Exchange authorization code for tokens
    const tokenResponse = await exchangeCodeForTokens(code, request);
    const { access_token, refresh_token, expires_in } = tokenResponse;
    
    // Calculate token expiration time
    const expires_at = new Date();
    expires_at.setSeconds(expires_at.getSeconds() + expires_in);
    
    // Determine which table to use based on user role
    const tableName = userRole === 'mentor' ? 'mentor_calendar_oauth' : 'mentee_calendar_oauth';
    const roleIdField = userRole === 'mentor' ? 'mentor_id' : 'mentee_id';
    
    // Check if user already has a calendar connection
    const { data: existingConnection } = await supabaseAdmin
      .from(tableName)
      .select('id')
      .eq(roleIdField, userId)
      .maybeSingle();
    
    if (existingConnection) {
      // Update existing connection
      await supabaseAdmin
        .from(tableName)
        .update({
          access_token,
          refresh_token,
          expires_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConnection.id);
    } else {
      // Create new connection
      await supabaseAdmin
        .from(tableName)
        .insert({
          [roleIdField]: userId,
          provider: 'google',
          access_token,
          refresh_token,
          expires_at,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
    
    // Redirect back to dashboard with success message
    return NextResponse.redirect(
      new URL(`/dashboard?calendarConnected=true`, request.url)
    );
  } catch (error: any) {
    console.error('Error in Google Calendar OAuth callback:', error);
    
    // Redirect back to dashboard with error
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error.message || 'Failed to connect calendar')}`, request.url)
    );
  }
}

async function exchangeCodeForTokens(code: string, request: NextRequest) {
  const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  
  const params = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirect_uri: `${new URL(request.url).origin}/api/auth/google-calendar-callback`,
    grant_type: 'authorization_code'
  });
  
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error || 'Unknown error'}`);
  }
  
  return await response.json();
}