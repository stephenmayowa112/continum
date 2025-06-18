import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getCalendarOAuthForUser } from '../../../../services/profileService';

export async function POST(request: Request) {
  try {
    const { session, userId, userRole } = await request.json();
    const oauthRecord = await getCalendarOAuthForUser(userId, userRole === 'mentor');
    if (!oauthRecord) {
      return NextResponse.json({ error: 'No calendar OAuth record found' }, { status: 400 });
    }
    const { access_token, refresh_token, expires_at } = oauthRecord;

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oAuth2Client.setCredentials({
      access_token,
      refresh_token,
      expiry_date: new Date(expires_at).getTime(),
    });

    // Ensure token is fresh
    await oAuth2Client.getAccessToken();

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const eventBody = {
      summary: session.title,
      description: session.description || '',
      start: { dateTime: session.start_time },
      end: { dateTime: session.end_time },
      location: session.meeting_link || ''
    };

    const insertRes = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventBody
    });

    return NextResponse.json({ eventId: insertRes.data.id });
  } catch (error: any) {
    console.error('Sync to Google Calendar error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}