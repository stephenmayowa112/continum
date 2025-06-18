import jwt from 'jsonwebtoken';

const VIDEOSDK_API_BASE = 'https://api.videosdk.live/v2';
const API_KEY = process.env.VIDEOSDK_API_KEY;
const SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY;

interface CreateMeetingOptions {
  title: string;
  description?: string;
  startTime?: string;
  attendees?: string[];
}

export async function createVideoSDKMeeting(options: CreateMeetingOptions) {
  if (!API_KEY || !SECRET_KEY) {
    throw new Error('VideoSDK API_KEY and SECRET_KEY must be set in environment variables');
  }

  // Generate a JWT token for API authentication (per VideoSDK docs)
  const authPayload = {
    apikey: API_KEY,
    permissions: ['allow_join', 'allow_mod'],
    version: 2
  };
  const authToken = jwt.sign(authPayload, SECRET_KEY, {
    algorithm: 'HS256',
    expiresIn: '12h',
  });

  // Create a new room/meeting
  const roomRes = await fetch(`${VIDEOSDK_API_BASE}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ name: options.title }),
  });

  if (!roomRes.ok) {
    const errorText = await roomRes.text();
    console.error("VideoSDK API Error Response:", errorText); // <-- ADDED
    throw new Error(`Failed to create VideoSDK room: ${errorText}`);
  }

  const roomData = await roomRes.json();
  const roomId = roomData.roomId;

  // Generate a token for the participant
  const payload = {
    apikey: API_KEY,
    roomId,
    name: options.title,
    permissions: ['allow_join', 'allow_mod'],
  };
  const token = jwt.sign(payload, SECRET_KEY, {
    algorithm: 'HS256',
    expiresIn: '12h',
  });

  return {
    meetingId: roomId,
    meetingLink: roomId,
    token,
  };
}

/**
 * Generate a VideoSDK token for an existing room
 */
export function generateVideoSDKToken(
  roomId: string,
  name: string,
  permissions: string[] = ['allow_join']
): string {
  if (!API_KEY || !SECRET_KEY) {
    throw new Error('VideoSDK API_KEY and SECRET_KEY must be set in environment variables');
  }

  const payload = {
    apikey: API_KEY,
    roomId,
    name,
    permissions,
  };
  return jwt.sign(payload, SECRET_KEY, {
    algorithm: 'HS256',
    expiresIn: '12h',
  });
}
