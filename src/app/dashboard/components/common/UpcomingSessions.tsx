"use client"
import React, { useEffect, useState } from 'react';
import { useUser } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabaseClient';

interface SessionData {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: string;
  start_time: string;
  end_time: string;
  title: string;
  meeting_link: string;
  description: string;
  created_at: string;
  mentor?: {
    name: string;
    email: string;
    profile_image_url?: string;
  };
  mentee?: {
    name: string;
    email: string;
    profile_image_url?: string;
  };
}

interface UpcomingSessionsProps {
  userRole: 'mentor' | 'mentee';
}

const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({ userRole }) => {
  const { user, loading } = useUser();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatICSDate = (dateString: string) => new Date(dateString).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const generateICSString = (session: SessionData) => {
    const dtStamp = formatICSDate(new Date().toISOString());
    const dtStart = formatICSDate(session.start_time);
    const dtEnd = formatICSDate(session.end_time);
    return [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Roshe Mentorship//EN','BEGIN:VEVENT',
      `UID:session-${session.id}@roshe`,`DTSTAMP:${dtStamp}`,`DTSTART:${dtStart}`,`DTEND:${dtEnd}`,
      `SUMMARY:${session.title}`,`DESCRIPTION:${session.description}`,`URL:${session.meeting_link}`,
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
  };

  const generateGoogleLink = (session: SessionData) => {
    const start = formatICSDate(session.start_time);
    const end = formatICSDate(session.end_time);
    const text = encodeURIComponent(session.title);
    const details = encodeURIComponent(session.description);
    const location = encodeURIComponent(session.meeting_link);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  useEffect(() => {
    if (!user?.id || loading) return;

    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        
        // Create appropriate filter based on user role
        const filterField = userRole === 'mentor' ? 'mentor_id' : 'mentee_id';
        
        // Fetch sessions with joined mentor/mentee info
        const { data, error } = await supabase
          .from('mentoring_sessions')
          .select(`
            *,
            mentor:mentor_id(id, name, email, profile_image_url),
            mentee:mentee_id(id, name, email, profile_image_url)
          `)
          .eq(filterField, user.id)
          .eq('status', 'upcoming')
          .order('start_time', { ascending: true });
        
        if (error) throw error;
        setSessions(data || []);
      } catch (err) {
        console.error('Error fetching sessions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessions();
    
    // Set up real-time subscription for session updates
    const channel = supabase
      .channel(`sessions_${user.id}_${userRole}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'mentoring_sessions',
        filter: `${userRole === 'mentor' ? 'mentor_id' : 'mentee_id'}.eq.${user.id}`
      }, payload => {
        // Handle different event types
        if (payload.eventType === 'INSERT') {
          setSessions(prev => [...prev, payload.new as SessionData].sort(
            (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          ));
        } else if (payload.eventType === 'UPDATE') {
          setSessions(prev => prev.map(session => 
            session.id === payload.new.id ? {...session, ...payload.new} : session
          ));
        } else if (payload.eventType === 'DELETE') {
          setSessions(prev => prev.filter(session => session.id !== payload.old.id));
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loading, userRole]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-20 bg-gray-100 rounded mb-4"></div>
          <div className="h-20 bg-gray-100 rounded mb-4"></div>
        </div>
      </div>
    );
  }
  
  if (sessions.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Sessions</h3>
        <p className="text-gray-500">
          {userRole === 'mentor' 
            ? "You don't have any upcoming mentoring sessions scheduled."
            : "You haven't booked any upcoming mentoring sessions yet."}
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <h3 className="text-lg font-semibold p-4 border-b">Your Upcoming Sessions</h3>
      
      <ul className="divide-y divide-gray-100">
        {sessions.map(session => {
          const otherPerson = userRole === 'mentor' ? session.mentee : session.mentor;
          return (
            <li key={session.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{session.title}</h4>
                  <p className="text-sm text-gray-500">
                    {userRole === 'mentor' ? 'With' : 'Mentor'}: {otherPerson?.name || 'Unknown'}
                  </p>
                  <div className="mt-2 text-sm">
                    <div><span className="text-gray-500">Date:</span> {formatDate(session.start_time)}</div>
                    <div><span className="text-gray-500">Time:</span> {formatTime(session.start_time)} - {formatTime(session.end_time)}</div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  {session.meeting_link && (
                    <a 
                      href={session.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      Join Meeting
                    </a>
                  )}
                  <div className="space-x-1">
                    <a
                      href={generateGoogleLink(session)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-green-500 text-white hover:bg-green-600"
                    >
                      Add to Google Calendar
                    </a>
                    <a
                      href={`data:text/calendar;charset=utf-8,${encodeURIComponent(generateICSString(session))}`}
                      download={`session-${session.id}.ics`}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Add to Calendar (.ics)
                    </a>
                  </div>
                  <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {session.status}
                  </span>
                </div>
              </div>
              
              {session.description && (
                <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                  <p className="font-medium text-gray-500">Session Agenda:</p>
                  <p className="mt-1">{session.description}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UpcomingSessions;