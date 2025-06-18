// Quick test script to validate your VideoSDK API credentials and JWT outside of Next.js
// Usage: node test-videosdk-room.js

import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Debug: ensure env vars loaded correctly
console.log('Env loaded:', {
  VIDEOSDK_API_KEY: process.env.VIDEOSDK_API_KEY,
  VIDEOSDK_SECRET_KEY: process.env.VIDEOSDK_SECRET_KEY
});

async function testRoomCreation() {
  try {
    const { VIDEOSDK_API_KEY, VIDEOSDK_SECRET_KEY } = process.env;
    if (!VIDEOSDK_API_KEY || !VIDEOSDK_SECRET_KEY) {
      throw new Error('Missing VIDEOSDK_API_KEY or VIDEOSDK_SECRET_KEY in .env.local');
    }

    // Build a valid JWT for VideoSDK v2 with standard claims
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      apiKey: VIDEOSDK_API_KEY,
      permissions: ['allow_join', 'allow_mod'],
      version: 2,
      iat: now,
      exp: now + 60 * 60, // token valid for 1 hour
    };
    const token = jwt.sign(payload, VIDEOSDK_SECRET_KEY, { algorithm: 'HS256' });

    // Call the VideoSDK API to create a room
    const res = await fetch('https://api.videosdk.live/v2/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const result = await res.json();
    console.log('Status Code:', res.status);
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error during VideoSDK room test:', err);
  }
}

testRoomCreation();
