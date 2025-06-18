import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  console.log('Magic-link endpoint called with email:', email);
  // Initialize admin client for supabase
  const supabaseAdmin = createAdminClient();
  // Determine redirect URL for magic link
  const origin = request.nextUrl.origin;
  const redirectTo = process.env.NEXT_PUBLIC_REDIRECT_URL || `${origin}/dashboard`;
  console.log('Redirect URL for magic link:', redirectTo);
  // Generate magiclink via supabase-js admin
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo }
  });
  console.log('generateLink result data:', data, 'error:', error);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
  // Extract the link from properties.action_link
  const actionLink = data?.properties?.action_link;
  return NextResponse.json({ link: actionLink });
}