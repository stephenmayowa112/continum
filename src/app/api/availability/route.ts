import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabaseClient';

export async function GET(request: Request) {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const mentorId = url.searchParams.get('mentor_id');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    if (!mentorId) {
      return NextResponse.json({ error: 'Mentor ID is required' }, { status: 400 });
    }

    // Get admin client to bypass RLS
    const supabaseAdmin = createAdminClient();
    
    // Build query to fetch availability slots
    let query = supabaseAdmin
      .from('availability')
      .select('*')
      .eq('mentor_id', mentorId)
      .eq('status', 'available');  // Only return available slots by default
      
    // Filter by date range if provided
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Filter out past dates (only fetch present and future dates)
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    query = query.gte('date', formattedToday);
    
    // Sort by date and time
    query = query.order('date').order('start_time');
    
    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching availability:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ availability: data });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Unexpected error in availability API:', error);
    } else {
      console.error('Unexpected non-Error thrown in availability API:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mentor_id, slots } = body;

    if (!mentor_id || !slots || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json(
        { error: 'Mentor ID and at least one availability slot are required' },
        { status: 400 }
      );
    }

    // Process each slot to add mentor_id
    const processedSlots = slots.map(slot => ({
      mentor_id,
      ...slot,
      status: slot.status || 'available'
    }));

    // Get admin client to bypass RLS
    const supabaseAdmin = createAdminClient();

    // Insert slots into availability table
    const { data, error } = await supabaseAdmin
      .from('availability')
      .insert(processedSlots)
      .select();

    if (error) {
      console.error('Error creating availability slots:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Unexpected error in availability API:', error);
    } else {
      console.error('Unexpected non-Error thrown in availability API:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create availability slots' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { slot_id, status, reason } = body;

    if (!slot_id || !status) {
      return NextResponse.json(
        { error: 'Slot ID and status are required' },
        { status: 400 }
      );
    }

    // Get admin client to bypass RLS
    const supabaseAdmin = createAdminClient();

    // Update slot status
    const updateData: {status: string, cancellation_reason?: string} = { status };
    if (status === 'cancelled' && reason) {
      updateData.cancellation_reason = reason;
    }

    const { data, error } = await supabaseAdmin
      .from('availability')
      .update(updateData)
      .eq('id', slot_id)
      .select();

    if (error) {
      console.error('Error updating availability slot:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Unexpected error in availability API:', error);
    } else {
      console.error('Unexpected non-Error thrown in availability API:', error);
    }
    return NextResponse.json(
      { error: 'Failed to update availability slot' },
      { status: 500 }
    );
  }
}