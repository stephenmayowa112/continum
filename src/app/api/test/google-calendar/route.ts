// Test endpoint to verify Google Calendar integration
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Set refresh token from environment variable
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

export async function GET() {
  try {
    // Create Calendar API client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Get primary calendar details to verify connection
    const calResponse = await calendar.calendars.get({
      calendarId: 'primary'
    });
    
    // Get upcoming events (max 5) to verify scope access
    const eventsResponse = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    // Return success with calendar information
    return NextResponse.json({
      success: true,
      message: 'Google Calendar API connection successful',
      calendar: {
        id: calResponse.data.id,
        summary: calResponse.data.summary,
        timeZone: calResponse.data.timeZone
      },
      events: {
        count: eventsResponse.data.items?.length || 0,
        // Only return non-sensitive info about events
        sampleEvents: eventsResponse.data.items?.map(event => ({
          id: event.id,
          summary: event.summary,
          start: event.start,
          end: event.end
        }))
      }
    });
  } catch (error: unknown) {
    console.error('Error testing Google Calendar integration:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to Google Calendar API',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}