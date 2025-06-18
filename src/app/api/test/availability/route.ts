import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a new supabase client with the service role key
// This allows us to bypass RLS policies
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      persistSession: false,
    }
  }
);

// This endpoint is for testing purposes only
// It bypasses client-side RLS policies by using server-side API calls with service role
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mentorId } = body;
    
    console.log('Server API: Creating test availability for mentor:', mentorId);
    
    if (!mentorId) {
      return NextResponse.json({ error: 'Mentor ID is required' }, { status: 400 });
    }
    
    // Create future dates for testing (tomorrow and day after)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(11, 0, 0, 0);
    
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 0, 0, 0);
    
    const dayAfterEnd = new Date(dayAfter);
    dayAfterEnd.setHours(15, 0, 0, 0);

    console.log('Server API: Attempting to create slots for dates:', 
      tomorrow.toISOString(), 'to', tomorrowEnd.toISOString(), 
      'and', dayAfter.toISOString(), 'to', dayAfterEnd.toISOString());
    
    // Insert test records using the admin client
    const { error: error1 } = await supabaseAdmin
      .from('availability')
      .insert([{
        mentor_id: mentorId,
        start_time: tomorrow.toISOString(),
        end_time: tomorrowEnd.toISOString(),
        status: 'available'
      }]);
      
    const { error: error2 } = await supabaseAdmin
      .from('availability')
      .insert([{
        mentor_id: mentorId,
        start_time: dayAfter.toISOString(),
        end_time: dayAfterEnd.toISOString(),
        status: 'available'
      }]);
    
    if (error1 || error2) {
      console.error('Server API: Error creating test slots:', error1 || error2);
      return NextResponse.json({ 
        error: 'Failed to create test slots',
        details: error1 || error2
      }, { status: 500 });
    }
    
    console.log('Server API: Successfully created test slots');
    return NextResponse.json({ 
      success: true,
      message: 'Test availability slots created successfully'
    });
  } catch (err) {
    console.error('Server API: Unexpected error in test availability endpoint:', err);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: (err as any).message
    }, { status: 500 });
  }
}