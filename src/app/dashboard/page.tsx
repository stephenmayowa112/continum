"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MentorDashboard from './components/MentorDashboard';
import MenteeDashboard from './components/MenteeDashboard';
import { useUser } from '../../lib/auth';
import { getUserRole } from '../../lib/user';
import { supabase } from '../../lib/supabaseClient';

export default function DashboardPage() {
  // Development mode flag - set to true to bypass authentication in local development
  const isDevelopmentMode = process.env.NODE_ENV === 'development';
  const [bypassAuth, setBypassAuth] = useState(false);
  const [userRole, setUserRole] = useState<'mentor' | 'mentee' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  
  // Set Supabase session from URL hash if present
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(() => {
          window.location.hash = '';
          window.location.reload();
        });
      }
    }

    // For development, allow bypassing authentication after confirming,
    // but ONLY if the user is not already logged in
    if (isDevelopmentMode && !bypassAuth && !user && !userLoading) {
      const shouldBypass = window.confirm(
        'You are not logged in. Would you like to bypass authentication to view the dashboard? (Development mode only)'
      );
      setBypassAuth(shouldBypass);
      
      if (shouldBypass) {
        // Default to mentee dashboard in development mode
        setUserRole('mentee');
        setIsLoading(false);
      } else {
        // User declined the bypass, redirect to sign in
        router.replace('/signIn');
      }
    }
  }, [isDevelopmentMode, bypassAuth, router, user, userLoading]);

  // Fetch user role when user data is available
  useEffect(() => {
    const fetchRole = async () => {
      if (!userLoading) {
        if (user?.id) {
          try {
            const role = await getUserRole(user.id);
            setUserRole(role);
          } catch (error) {
            console.error('Error fetching user role:', error);
          } finally {
            setIsLoading(false);
          }
        } else if (isDevelopmentMode && bypassAuth) {
          // In development mode with bypass enabled, we've already set the role
          // No need to do anything here, just make sure we don't redirect
          setIsLoading(false);
        } else if (!bypassAuth) {
          // No user, not bypassing auth, redirect to sign in
          router.replace('/signIn');
        }
      }
    };

    fetchRole();
  }, [userLoading, user, router, bypassAuth, isDevelopmentMode]);

  // Show loading state while checking authentication and user role
  if ((userLoading || isLoading) && !(isDevelopmentMode && bypassAuth)) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Render the appropriate dashboard based on user role
  return (
    <main className="min-h-screen">
      {userRole === 'mentor' ? (
        <MentorDashboard />
      ) : (
        <MenteeDashboard />
      )}
    </main>
  );
}