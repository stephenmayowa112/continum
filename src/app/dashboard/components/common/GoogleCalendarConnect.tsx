"use client"

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Define the correct table name based on user role
const getTableName = (userRole: string) => userRole === 'mentor' ? 'mentor_calendar_oauth' : 'mentee_calendar_oauth';

interface GoogleCalendarConnectProps {
  userId: string;
  userRole: 'mentor' | 'mentee';
}

export default function GoogleCalendarConnect({ userId, userRole }: GoogleCalendarConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  
  // Google OAuth parameters
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google-calendar`;
  const scope = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';
  
  useEffect(() => {
    async function checkCalendarConnection() {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        // Check if this user already has a calendar connection
        const { data, error } = await supabase
          .from(getTableName(userRole))
          .select('id, provider, expires_at')
          .eq(`${userRole}_id`, userId)
          .single();
          
        if (error) {
          if (error.code !== 'PGSQL_NO_ROWS_RETURNED') {
            console.error('Error checking calendar connection:', error);
          }
          setIsConnected(false);
          return;
        }
        
        // If we have a record and it hasn't expired, consider it connected
        if (data) {
          const expiresAt = new Date(data.expires_at);
          const isExpired = expiresAt < new Date();
          
          setIsConnected(!isExpired);
        }
      } catch (error) {
        console.error('Error checking calendar connection:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkCalendarConnection();
  }, [userId, userRole, supabase]);
  
  const handleConnect = () => {
    // Generate a random state to verify the OAuth callback
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store the state and userId in localStorage to verify later
    localStorage.setItem('calendarOAuthState', state);
    localStorage.setItem('calendarOAuthUserId', userId);
    localStorage.setItem('calendarOAuthUserRole', userRole);
    
    // Construct the OAuth URL with our application's client ID
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
    
    // Redirect to Google's OAuth page
    window.location.href = authUrl;
  };
  
  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      
      // Remove the calendar connection from the database
      const { error } = await supabase
        .from(getTableName(userRole))
        .delete()
        .eq(`${userRole}_id`, userId);
        
      if (error) {
        throw error;
      }
      
      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      alert('Failed to disconnect calendar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900">Google Calendar Integration</h3>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        Connect your Google Calendar to automatically receive meeting invites and manage your sessions.
      </p>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : isConnected ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Your Google Calendar is connected</span>
          </div>
          
          <p className="text-xs text-gray-500">
            Your sessions will automatically be added to your Google Calendar, and you'll receive notifications according to your Google Calendar settings.
          </p>
          
          <button
            onClick={handleDisconnect}
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            disabled={isLoading}
          >
            Disconnect Calendar
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Connect Google Calendar
        </button>
      )}
    </div>
  );
}