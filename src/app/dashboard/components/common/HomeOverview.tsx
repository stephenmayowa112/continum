"use client";
import React, { useEffect, useState } from 'react';
import { useUser } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabaseClient';
import { FiArrowRight, FiCalendar, FiMessageCircle } from 'react-icons/fi';


interface SessionData {
  id: string;
  start_time: string;
  meeting_link: string;
}

export default function HomeOverview() {
  const { user } = useUser();
  const [nextSession, setNextSession] = useState<SessionData | null>(null);
  const [newBookings, setNewBookings] = useState<number>(0);
  const [unreadMsgs, setUnreadMsgs] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) return;
    // Fetch next upcoming session
    supabase.from('mentoring_sessions')
      .select('id, start_time, meeting_link')
      .eq('mentor_id', user.id)
      .eq('status', 'upcoming')
      .order('start_time', { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length) setNextSession(data[0]);
      });

    // Count new bookings in last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    supabase.from('mentoring_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('mentor_id', user.id)
      .gte('created_at', weekAgo.toISOString())
      .then(({ count }) => count && setNewBookings(count));

    // Placeholder for unread messages count
    // TODO: replace with real messages table query
    setUnreadMsgs(0);
  }, [user]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-medium text-blue-800">Your Next Session</h3>
        {nextSession ? (
          <>
            <p className="mt-2 text-gray-700">
              {new Date(nextSession.start_time).toLocaleString()}
            </p>
            <a
              href={nextSession.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center text-blue-600 hover:underline"
            >
              Join Meeting <FiArrowRight className="ml-1" />
            </a>
          </>
        ) : (
          <p className="mt-2 text-gray-700">No upcoming sessions</p>
        )}
      </div>

      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="font-medium text-green-800">Community Activity</h3>
        <p className="mt-2 text-gray-700">
          {newBookings} new booking{newBookings === 1 ? '' : 's'}
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="mt-3 inline-flex items-center text-green-600 hover:underline"
        >
          View Bookings <FiCalendar className="ml-1" />
        </button>
      </div>

      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="font-medium text-purple-800">Messages</h3>
        <p className="mt-2 text-gray-700">
          {unreadMsgs} unread message{unreadMsgs === 1 ? '' : 's'}
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="mt-3 inline-flex items-center text-purple-600 hover:underline"
        >
          View Chat <FiMessageCircle className="ml-1" />
        </button>
      </div>
    </div>
  );
}
