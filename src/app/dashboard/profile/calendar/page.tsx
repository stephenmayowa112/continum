"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '../../../../lib/auth';
import { getCalendarOAuth, deleteCalendarOAuth } from '../../../../services/profileService';
import { getMenteeSessions } from '../../../../services/sessionService';
import type { CalendarOAuthRecord } from '../../../../services/profileService';
import { supabase } from '../../../../lib/supabaseClient';

// Helper to format date for ICS and Google Calendar
function formatDateTime(dateStr: string) {
  const dt = new Date(dateStr);
  return dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Generate ICS content
function generateICS(session: any) {
  const uid = `session-${session.id}@roshe`;
  const dtstamp = formatDateTime(new Date().toISOString());
  const dtstart = formatDateTime(session.start_time);
  const dtend = formatDateTime(session.end_time);
  const title = session.title;
  const desc = session.description || '';
  const url = session.meeting_link || '';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Roshe Mentorship//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

// Generate Google Calendar link
function generateGoogleLink(session: any) {
  const start = formatDateTime(session.start_time);
  const end = formatDateTime(session.end_time);
  const text = encodeURIComponent(session.title);
  const details = encodeURIComponent(session.description || '');
  const location = encodeURIComponent(session.meeting_link || '');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
}

// Sync session to Google Calendar
async function syncSessionToGoogle(session: any, userId: string, userRole: 'mentee' | 'mentor') {
  const response = await fetch('/api/calendar/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session, userId, userRole })
  });
  if (!response.ok) throw new Error('Failed to sync event');
  return await response.json();
}

export default function CalendarPage() {
  const { user, loading } = useUser();
  const [record, setRecord] = useState<CalendarOAuthRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  const loadRecord = useCallback(async () => {
    if (user) {
      const rec = await getCalendarOAuth(user.id);
      setRecord(rec);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && user) {
      loadRecord();
      getMenteeSessions(user.id as string).then(setSessions);
    }
  }, [user, loading, loadRecord]);

  const handleConnect = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard/profile/calendar` }
    });
  };

  const handleDisconnect = async () => {
    if (!record) return;
    setBusy(true);
    try {
      await deleteCalendarOAuth(record.id);
      setRecord(null);
    } finally {
      setBusy(false);
    }
  };

  const downloadICS = (session: any) => {
    const content = generateICS(session);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to connect your calendar.</div>;

  return (
    <div className="mt-4 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow w-full max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Calendar Integration</h2>
        {record ? (
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Connected to Google Calendar</span>
            <button
              onClick={handleDisconnect}
              disabled={busy}
              className="px-4 py-2 bg-red-500 text-white font-medium rounded hover:bg-red-600 transition"
            >
              {busy ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="w-full py-2 text-white font-medium rounded transition"
            style={{ background: 'linear-gradient(90deg, #24242E 0%, #747494 100%)' }}
          >
            Connect Google Calendar
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow w-full max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Booked Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-600">No upcoming sessions to add to your calendar.</p>
        ) : (
          <ul className="divide-y">
            {sessions.map(session => (
              <li key={session.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{new Date(session.start_time).toLocaleString()}</p>
                  <p className="text-gray-600">{session.title}</p>
                </div>
                <div className="space-x-2">
                  {record ? (
                    <button
                      onClick={async () => {
                        try {
                          await syncSessionToGoogle(session, user.id as string, 'mentee');
                          alert('Event synced to Google Calendar');
                        } catch (e) {
                          console.error(e);
                          alert('Failed to sync event');
                        }
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Sync to Google Calendar
                    </button>
                  ) : (
                    <a
                      href={generateGoogleLink(session)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Add to Google Calendar
                    </a>
                  )}
                  <button
                    onClick={() => downloadICS(session)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add to Calendar (.ics)
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}