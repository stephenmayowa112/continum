import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the user's access token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization' }, { status: 401 });
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Get event details from the request
    const { 
      summary, 
      description, 
      startDateTime, 
      endDateTime, 
      attendees = [], 
      conferenceDataVersion = 1,
      requestId
    } = await request.json();
    
    // Validate required fields
    if (!summary || !startDateTime || !endDateTime) {
      return NextResponse.json({ error: 'Missing required event fields' }, { status: 400 });
    }
    
    // Create the event using Google Calendar API directly with the user's access token
    const calendarEvent = {
      summary,
      description,
      start: {
        dateTime: startDateTime,
        timeZone: 'UTC'
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'UTC'
      },
      attendees: attendees.map((email: string) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: requestId || `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    };
    
    // Call Google Calendar API to create the event
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=${conferenceDataVersion}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calendarEvent)
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google Calendar API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const eventData = await response.json();
    
    return NextResponse.json({
      id: eventData.id,
      hangoutLink: eventData.hangoutLink,
      htmlLink: eventData.htmlLink,
      status: eventData.status,
      created: eventData.created
    });
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}