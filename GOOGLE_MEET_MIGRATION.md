# Zoom to Google Meet Migration Guide

This document outlines the steps required to migrate from Zoom API to Google Meet/Calendar API for booking mentorship sessions in your application.

## Changes Made

1. **Created new service files**:
   - `src/services/googleMeetService.ts` - Replaces the Zoom service with Google Meet/Calendar integration

2. **Updated API routes**:
   - `src/app/api/bookings/route.ts` - Now uses Google Meet instead of Zoom for meeting creation
   - `src/app/api/auth/google-calendar/route.ts` - New endpoint to initiate Google OAuth flow
   - `src/app/api/auth/callback/google-calendar/route.ts` - New endpoint to handle OAuth callback and get refresh token
   - `src/app/api/test/google-calendar/route.ts` - Test endpoint to verify Google Calendar integration

3. **Environment variables**:
   - Updated `.env.local.example` with required Google Calendar API variables
   - Removed Zoom-related variables

## Setup Instructions

### 1. Set up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API" and enable it
4. Configure OAuth consent screen:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Fill in required information (app name, user support email, developer contact)
   - Add scopes for Calendar API (`https://www.googleapis.com/auth/calendar`, `https://www.googleapis.com/auth/calendar.events`)
   - Add test users if in testing mode
5. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: Web application
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google-calendar` (and your production URL)
   - Save the Client ID and Client Secret

### 2. Get Refresh Token

1. Update your environment variables with the Google Client ID and Secret
2. Start your development server
3. Navigate to `/api/auth/google-calendar` in your browser
4. Complete the OAuth flow
5. After authorization, the callback will display your refresh token
6. Copy this refresh token to your `.env.local` file as `GOOGLE_REFRESH_TOKEN`

### 3. Update Environment Variables

Update your `.env.local` file with:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/auth/callback/google-calendar
GOOGLE_REFRESH_TOKEN=your-refresh-token
NEXT_PUBLIC_MOCK_MEET_API=false  # Set to 'true' for development/testing
```

Remove the following Zoom-related variables:
```
ZOOM_ACCOUNT_ID
ZOOM_CLIENT_ID
ZOOM_CLIENT_SECRET
NEXT_PUBLIC_MOCK_ZOOM_API
```

### 4. Verify Integration

1. Access the test endpoint at `/api/test/google-calendar`
2. If successful, you'll see your primary calendar details and upcoming events
3. If there are any errors, check your environment variables and Google Cloud configuration

## Additional Information

- The Google Calendar API creates meetings with Google Meet links automatically
- No password is needed for Google Meet meetings (unlike Zoom)
- The refresh token is long-lived but may expire if unused for extended periods
- For production, ensure your Google Cloud project is properly configured and not in testing mode

## Troubleshooting

If you encounter issues:

1. Check that all environment variables are correctly set
2. Verify Google Cloud API is enabled and OAuth consent screen is configured
3. Ensure the refresh token was obtained with the correct scopes
4. Check Google Cloud Quotas if you receive rate limit errors
5. For development, you can use `NEXT_PUBLIC_MOCK_MEET_API=true` to bypass the actual API calls