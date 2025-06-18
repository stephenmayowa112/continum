"use client";
import { useState, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import type { Session } from '@supabase/supabase-js';

interface SupabaseProviderProps {
  initialSession: Session | null;
  children: ReactNode;
}

export default function SupabaseProvider({ initialSession, children }: SupabaseProviderProps) {
  const [supabaseClient] = useState(() => createClientComponentClient());
  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={initialSession}>
      {children}
    </SessionContextProvider>
  );
}
