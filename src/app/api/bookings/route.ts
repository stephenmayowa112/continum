export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
//import { createVideoSDKMeeting } from '../../../services/videoSDKService';
import { createAgoraMeeting } from '../../../services/agoraService';
import { createAdminClient } from '../../../lib/supabaseClient';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();
    
    // Validate required fields
    const requiredFields = ['mentorId', 'userId', 'date', 'time', 'sessionType', 'slotId'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if time slot is still available in database (case-insensitive)
    const supabaseAdmin = createAdminClient();
    const { data: slot, error: slotError } = await supabaseAdmin
      .from('availability')
      .select('status')
      .eq('id', bookingData.slotId)
      .maybeSingle();
    if (slotError) {
      console.error('Error checking availability slot:', slotError);
    }
    const status = slot?.status?.trim().toLowerCase();
    // Only treat 'booked' status as unavailable
    if (status === 'booked') {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 409 }
      );
    }

    // Create Agora meeting server-side
    try {
      const { channel, token, appId } = createAgoraMeeting(bookingData.slotId);

      // Create mentoring session record
      const startISO = new Date(`${bookingData.date}T${bookingData.time}`).toISOString();
      const endDate = new Date(startISO);
      endDate.setMinutes(endDate.getMinutes() + 30);
      const endISO = endDate.toISOString();
      await supabaseAdmin.from('mentoring_sessions').insert([{ 
        mentor_id: bookingData.mentorId,
        mentee_id: bookingData.userId,
        status: 'upcoming',
        start_time: startISO,
        end_time: endISO,
        title: bookingData.sessionType,
        meeting_link: channel,
        description: bookingData.sessionType
      }]);

      // Mark the availability slot as booked and split the time period
      try {
        const slotId = bookingData.slotId;
        // Fetch the original availability period
        const { data: period, error: fetchError } = await supabaseAdmin
          .from('availability')
          .select('start_time, end_time, mentor_id')
          .eq('id', slotId)
          .single();
        if (fetchError || !period) {
          console.error('Failed to fetch original availability period:', fetchError);
        } else {
          const { start_time: periodStartStr, end_time: periodEndStr, mentor_id } = period;
          const periodStart = new Date(periodStartStr);
          const periodEnd = new Date(periodEndStr);
          const slotStart = new Date(`${bookingData.date}T${bookingData.time}`);
          const slotEnd = new Date(slotStart.getTime() + 30 * 60000);
          // Remove the original period
          await supabaseAdmin.from('availability').delete().eq('id', slotId);
          // Prepare new segments
          const inserts: Array<any> = [];
          // Pre-booking segment
          if (periodStart < slotStart) {
            inserts.push({
              mentor_id,
              start_time: periodStart.toISOString(),
              end_time: slotStart.toISOString(),
              status: 'available',
            });
          }
          // Booked segment
          inserts.push({
            mentor_id,
            start_time: slotStart.toISOString(),
            end_time: slotEnd.toISOString(),
            status: 'booked',
          });
          // Post-booking segment
          if (slotEnd < periodEnd) {
            inserts.push({
              mentor_id,
              start_time: slotEnd.toISOString(),
              end_time: periodEnd.toISOString(),
              status: 'available',
            });
          }
          // Insert new availability rows
          const { error: insertError } = await supabaseAdmin
            .from('availability')
            .insert(inserts);
          if (insertError) {
            console.error('Failed to insert split availability segments:', insertError);
          }
        }
      } catch (slotError) {
        console.error('Failed to split availability after booking:', slotError);
      }

      // Send email notification to mentor
      try {
        // Fetch mentor's email from mentors table
        const { data: mentorProfile, error: profileError } = await supabaseAdmin
          .from('mentors')
          .select('email')
          .eq('id', bookingData.mentorId)
          .single();
        if (profileError) {
          console.error('Failed to fetch mentor email:', profileError);
        } else if (mentorProfile?.email) {
          // Prepare email content
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
          const meetingUrl = `${baseUrl}/meeting/${channel}?token=${token}&appId=${appId}`;
          const emailText = `A new mentoring session has been booked.

Date & Time: ${startISO}
Join here: ${meetingUrl}`;
          // Create transporter
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });
          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: mentorProfile.email,
            subject: 'Your mentoring session has been booked',
            text: emailText,
          });
        }
      } catch (emailErr) {
        console.error('Error sending notification email:', emailErr);
      }

      // Return success response with Agora meeting credentials, using channelName for client consumption
      return NextResponse.json({
        success: true,
        message: 'Session booked successfully',
        meeting: { channel, token, appId, start_time: startISO, end_time: endISO }
      });
    } catch (error: any) {
      console.error('Error processing booking:', error.message, error.stack, error);
      return NextResponse.json(
        { error: `Failed to create booking: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/bookings:', error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}