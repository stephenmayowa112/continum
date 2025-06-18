// filepath: src/app/api/video-sdk/token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateVideoSDKToken } from '../../../../services/videoSDKService';

export async function POST(request: NextRequest) {
  try {
    const { meetingId, userName } = await request.json();
    if (!meetingId || !userName) {
      return NextResponse.json({ error: 'Missing meetingId or userName' }, { status: 400 });
    }
    const token = generateVideoSDKToken(meetingId, userName);
    return NextResponse.json({ token });
  } catch (err: any) {
    console.error('Error generating VideoSDK token:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
