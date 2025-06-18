// Callback route to receive the authorization code and exchange it for tokens
import { createServerClient, CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // If there was an error during OAuth, redirect to dashboard with error
  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=calendar_oauth_failed&message=${error}`
    );
  }

  // Verify that we have the required parameters
  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=invalid_oauth_response`
    );
  }

  try {
    // Exchange the authorization code for access and refresh tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google-calendar`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', tokenData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=token_exchange_failed`
      );
    }

    // Get user info from cookies (server-side only)
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          }
        }
      }
    );

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/signin?error=not_authenticated`
      );
    }

    // Get user role and ID from the client-supplied state
    // In a production app, you should verify this with a secure method
    // For simplicity, we're using localStorage via a script in the redirected page
    
    // For now, we'll redirect to a processing page that will handle database updates
    const redirectUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/process-calendar-oauth`);
    redirectUrl.searchParams.set('access_token', tokenData.access_token);
    redirectUrl.searchParams.set('refresh_token', tokenData.refresh_token);
    redirectUrl.searchParams.set('expires_in', tokenData.expires_in);
    redirectUrl.searchParams.set('state', state);
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error processing Google Calendar OAuth callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=calendar_integration_failed`
    );
  }
}