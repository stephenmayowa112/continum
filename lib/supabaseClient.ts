import { createClient } from '@supabase/supabase-js';

if (
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== 'string' ||
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'string'
) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Create an admin client for server-side operations that need to bypass RLS
// This should only be used in server contexts (API routes)
export const createAdminClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey) {
    console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations will fail.');
    return supabase; // Return regular client if no service key
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};
