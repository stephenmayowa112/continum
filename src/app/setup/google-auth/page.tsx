'use client';

import { useState } from 'react';

export default function GoogleAuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  const startGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/google-calendar');
      const data = await response.json();
      
      if (data.authUrl) {
        // Redirect to Google's authorization page
        window.location.href = data.authUrl;
      } else {
        console.error('No auth URL returned');
        alert('Failed to start Google authorization. Check the console for details.');
      }
    } catch (error) {
      console.error('Error starting Google auth:', error);
      alert('An error occurred. Check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Google Calendar Integration Setup</h1>
          
          <p className="mb-6 text-gray-600">
            To enable Google Calendar integration, you need to authorize Roshe Mentorship 
            to access your Google Calendar. Click the button below to start the process.
          </p>
          
          <div className="mb-8 bg-blue-50 p-4 rounded-md text-sm text-blue-700">
            <p className="font-medium">Instructions:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-left">
              <li>Click the button below to start the authorization process</li>
              <li>Sign in with your Google account</li>
              <li>Grant the requested permissions</li>
              <li>Copy the refresh token that appears</li>
              <li>Add the token to your .env.local file</li>
            </ol>
          </div>
          
          <button
            onClick={startGoogleAuth}
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-md text-white font-medium
                      ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
          >
            {isLoading ? 'Starting Authorization...' : 'Authorize Google Calendar'}
          </button>
          
          <p className="mt-4 text-xs text-gray-500">
            Note: You will be redirected to Google to authorize access. Your data will remain secure.
          </p>
        </div>
      </div>
    </div>
  );
}