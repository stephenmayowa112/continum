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

export async function POST(request: NextRequest) {
  try {
    const { userId, userRole } = await request.json();
    
    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Missing user ID or role' }, { status: 400 });
    }
    
    // Determine which table to query based on user role
    const tableName = userRole === 'mentor' ? 'mentor_calendar_oauth' : 'mentee_calendar_oauth';
    const roleIdField = userRole === 'mentor' ? 'mentor_id' : 'mentee_id';
    
    // Get the tokens
    const { data: tokens, error } = await supabaseAdmin
      .from(tableName)
      .select('access_token, refresh_token, expires_at')
      .eq(roleIdField, userId)
      .single();
    
    if (error) {
      console.error('Error fetching calendar tokens:', error);
      return NextResponse.json({ error: 'Failed to fetch calendar tokens' }, { status: 500 });
    }
    
    if (!tokens) {
      return NextResponse.json({ error: 'No calendar connection found' }, { status: 404 });
    }
    
    // Check if token is expired and needs refreshing
    const expiresAt = new Date(tokens.expires_at);
    const now = new Date();
    
    if (expiresAt <= now) {
      // Token is expired, refresh it
      const refreshedTokens = await refreshAccessToken(tokens.refresh_token);
      
      // Calculate new expiration
      const newExpiresAt = new Date();
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + refreshedTokens.expires_in);
      
      // Update tokens in database
      await supabaseAdmin
        .from(tableName)
        .update({
          access_token: refreshedTokens.access_token,
          refresh_token: refreshedTokens.refresh_token || tokens.refresh_token,
          expires_at: newExpiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq(roleIdField, userId);
      
      // Return the refreshed tokens
      return NextResponse.json({
        access_token: refreshedTokens.access_token,
        expires_at: newExpiresAt.toISOString()
      });
    }
    
    // Return the current valid token
    return NextResponse.json({
      access_token: tokens.access_token,
      expires_at: tokens.expires_at
    });
  } catch (error: any) {
    console.error('Error in get-user-tokens endpoint:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function refreshAccessToken(refresh_token: string) {
  const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    refresh_token,
    grant_type: 'refresh_token'
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
    throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error || 'Unknown error'}`);
  }
  
  return await response.json();
}