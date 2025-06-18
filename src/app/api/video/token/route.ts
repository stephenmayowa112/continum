// filepath: src/app/api/video/token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAgoraMeeting } from '../../../../services/agoraService';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export async function POST(request: NextRequest) {
  try {
    const { meetingId, userName } = await request.json();
    if (!meetingId || !userName) {
      return NextResponse.json({ error: 'Missing meetingId or userName' }, { status: 400 });
    }
    
    // With Agora, we'll use the existing meetingId as the channel name
    // and generate a new token for this user to join the channel
    const { token, appId, channel } = createAgoraMeeting(meetingId);
    
    return NextResponse.json({ token, appId, channel: channel || meetingId });
  } catch (err: any) {
    console.error('Error generating Agora token:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const channel = url.searchParams.get('channel');
    if (!channel) {
      return NextResponse.json({ error: 'Missing channel query param' }, { status: 400 });
    }
    const APP_ID = process.env.AGORA_APP_ID;
    const APP_CERT = process.env.AGORA_APP_CERTIFICATE;
    if (!APP_ID || !APP_CERT) {
      throw new Error('AGORA_APP_ID and AGORA_APP_CERTIFICATE must be set');
    }
    const now = Math.floor(Date.now() / 1000);
    const expire = now + 60 * 60; // 1 hour
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERT,
      channel,
      0,
      RtcRole.PUBLISHER,
      expire
    );
    return NextResponse.json({ token, appId: APP_ID, channel });
  } catch (err: any) {
    console.error('Error generating Agora token (GET):', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
