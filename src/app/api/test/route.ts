import { NextResponse } from 'next/server';

// This is a simple test endpoint to verify API connectivity
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Test API endpoint is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    return NextResponse.json({ 
      success: true, 
      message: 'POST request received successfully',
      receivedBody: body,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in test POST endpoint:', err);
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing request',
      error: (err as any).message
    }, { status: 500 });
  }
}