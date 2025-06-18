"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Correct import path
import { User } from '@supabase/supabase-js';

interface UserContextType {
  user: User | null;
  loading: boolean;
}

// Create context without default value
const UserContext = createContext<UserContextType | null>(null);

// Props interface for the provider component
interface UserProviderProps {
  children: ReactNode;
}

// Provider component with createElement instead of JSX
export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get initial session
    const initializeUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
      setLoading(false);

      // Listen for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user || null);
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    initializeUser();
  }, []);

  // Use React.createElement instead of JSX
  return React.createElement(
    UserContext.Provider,
    { value: { user, loading } },
    children
  );
}

// Hook to use the auth context
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Get currently logged-in user (imperative)
export async function getUser(): Promise<User | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }
  return session?.user || null;
}