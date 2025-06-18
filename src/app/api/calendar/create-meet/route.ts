import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Google Meet integration removed. Use Jitsi Meet.' },
    { status: 410 }
  );
}