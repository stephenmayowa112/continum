"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../../lib/auth';
import Image from 'next/image';
import { startSession, completeSession, cancelSession } from '../../../../services/sessionService';
import { getMentorReviews } from '../../../../services/reviewService';
import { toast } from 'react-toastify';
import { FaVideo, FaCalendarCheck, FaClock, FaStar, FaDownload, FaGoogle } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import { supabase } from '../../../../lib/supabaseClient';

const formatICSDate = (dateString: string) => new Date(dateString).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
const generateICSString = (session: any) => {
  const dtStamp = formatICSDate(new Date().toISOString());
  const dtStart = formatICSDate(session.start_time);
  const dtEnd = formatICSDate(session.end_time);
  return [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Roshe Mentorship//EN','BEGIN:VEVENT',
    `UID:session-${session.id}@roshe`,`DTSTAMP:${dtStamp}`,`DTSTART:${dtStart}`,`DTEND:${dtEnd}`,
    `SUMMARY:${session.title}`,`DESCRIPTION:${session.description || ''}`,`URL:${session.meeting_link || ''}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\\r\\n');
};
const generateGoogleLink = (session: any) => {
  const start = formatICSDate(session.start_time);
  const end = formatICSDate(session.end_time);
  const text = encodeURIComponent(session.title);
  const details = encodeURIComponent(session.description || '');
  const location = encodeURIComponent(session.meeting_link || '');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
};

interface MentorSessionsProps {
  mentorId: string;
}

const MentorSessions: React.FC<MentorSessionsProps> = ({ mentorId }) => {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'reviews'>('upcoming');
  const [cancelSessionId, setCancelSessionId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [filterOption, setFilterOption] = useState<'all' | 'today' | 'thisWeek' | 'thisMonth'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const sessionsPromise = fetch(`/api/sessions?mentorId=${mentorId}`).then(res => res.json()).then(data => data.sessions || []);
        const reviewsPromise = getMentorReviews(mentorId);
        
        const [sessionsResult, reviewsResult] = await Promise.allSettled([
          sessionsPromise,
          reviewsPromise
        ]);
        
        let allSessions: any[] = [];
        if (sessionsResult.status === 'fulfilled') {
          allSessions = sessionsResult.value;
        } else {
          console.error('Failed to load sessions:', sessionsResult.reason);
          toast.error('Failed to load sessions');
        }
        setSessions(allSessions);
        
        if (reviewsResult.status === 'fulfilled') {
          setReviews(reviewsResult.value);
        } else {
          console.error('Failed to load reviews:', reviewsResult.reason);
          toast.error('Failed to load mentor reviews');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error loading mentor data:', errorMessage, error);
        toast.error('Failed to load sessions and reviews');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (mentorId) {
      loadData();
    }
  }, [mentorId]);

  useEffect(() => {
    let sessionChannel: any;
    if (mentorId) {
      sessionChannel = supabase
        .channel(`mentor_sessions_${mentorId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mentoring_sessions', filter: `mentor_id=eq.${mentorId}` }, payload => {
          const newSession = (payload as any).new;
          setSessions(prev => [...prev, newSession]);
          toast.info(
            <span>
              A new session has been booked by a mentee. Check your upcoming sessions.
            </span>
          );
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mentoring_sessions', filter: `mentor_id=eq.${mentorId}` }, payload => {
          const updated = (payload as any).new;
          setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
          toast.info('A session has been updated');
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'mentoring_sessions', filter: `mentor_id=eq.${mentorId}` }, payload => {
          const deleted = (payload as any).old;
          setSessions(prev => prev.filter(s => s.id !== deleted.id));
          toast.info('A session has been removed');
        })
        .subscribe();
    }
    return () => {
      if (sessionChannel) supabase.removeChannel(sessionChannel);
    };
  }, [mentorId]);
  
  const handleCancelSession = async () => {
    if (!cancelSessionId) return;
    setIsCancelling(true);
    try {
      await cancelSession(cancelSessionId, cancellationReason);
      toast.success('Session cancelled successfully');
      setCancelSessionId(null);
      setCancellationReason('');
      const sessionsData = await fetch(`/api/sessions?mentorId=${mentorId}`).then(res => res.json()).then(data => data.sessions || []);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Failed to cancel session');
    } finally {
      setIsCancelling(false);
    }
  };
  
  const handleStartSession = async (sessionId: string, meetingLink: string) => {
    try {
      await startSession(sessionId);
      toast.success('Session started! Redirecting to meeting room...');
      if (user && meetingLink) {
        const res = await fetch('/api/video/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: meetingLink, userName: user.email || user.id })
        });
        const data = await res.json();
        if (data.token && data.appId && data.channel) {
          router.push(`/meeting/${data.channel}?token=${data.token}&appId=${data.appId}`);
        } else {
          toast.error('Could not retrieve meeting details. Please try again.');
        }
      } else {
        toast.error('User or meeting link missing, cannot start session.');
      }
      fetch(`/api/sessions?mentorId=${mentorId}`).then(res => res.json()).then(data => setSessions(data.sessions || []));
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session. Please try again.');
    }
  };
  
  const handleCompleteSession = async (sessionId: string) => {
    try {
      await completeSession(sessionId);
      toast.success('Session completed successfully');
      const sessionsData = await fetch(`/api/sessions?mentorId=${mentorId}`).then(res => res.json()).then(data => data.sessions || []);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
    }
  };

  const handleJoinSession = async (session: any) => {
    if (session.meeting_link && user) {
      try {
        toast.info('Joining session... Please wait.');
        const res = await fetch('/api/video/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: session.meeting_link, userName: user.email || user.id })
        });
        const data = await res.json();
        if (data.token && data.appId && data.channel) {
          router.push(`/meeting/${data.channel}?token=${data.token}&appId=${data.appId}`);
        } else {
          toast.error('Could not retrieve meeting details. Please try again.');
        }
      } catch (error){
        console.error('Error joining session:', error);
        toast.error('Unable to join session. Please check your connection or try again later.');
      }
    } else {
      toast.error('Meeting link is missing or user is not available. Cannot join session.');
    }
  };
  
  const filterSessions = (status: 'upcoming' | 'past') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    let filtered = sessions.filter(session => {
      if (status === 'upcoming') {
        return ['upcoming', 'active'].includes(session.status) && !session.cancelled_at;
      } else {
        return session.status === 'completed' || session.status === 'cancelled' || session.cancelled_at;
      }
    });
    
    if (filterOption !== 'all') {
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.start_time);
        if (filterOption === 'today') {
          return sessionDate >= today && sessionDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        } else if (filterOption === 'thisWeek') {
          const nextWeekStart = new Date(thisWeekStart);
          nextWeekStart.setDate(thisWeekStart.getDate() + 7);
          return sessionDate >= thisWeekStart && sessionDate < nextWeekStart;
        } else if (filterOption === 'thisMonth') {
          const nextMonthStart = new Date(thisMonthStart);
          nextMonthStart.setMonth(thisMonthStart.getMonth() + 1);
          return sessionDate >= thisMonthStart && sessionDate < nextMonthStart;
        }
        return true;
      });
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session => 
        (session.title?.toLowerCase().includes(query)) || 
        (session.mentees?.name?.toLowerCase().includes(query)) ||
        (session.description?.toLowerCase().includes(query))
      );
    }
    
    return filtered.sort((a, b) => {
      const dateA = new Date(a.start_time).getTime();
      const dateB = new Date(b.start_time).getTime();
      return sortOption === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };
  
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  };
  
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 'Duration not set';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
    if (isNaN(durationMinutes) || durationMinutes < 0) return 'Invalid duration';
    return `${durationMinutes} minutes`;
  };
  
  const renderStatus = (session: any) => {
    const now = new Date();
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);
    const isActive = now >= startTime && now <= endTime;
    
    if (session.cancelled_at) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Cancelled</span>;
    } else if (session.status === 'completed') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Completed</span>;
    } else if (isActive) {
      return <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">In Progress</span>;
    } else if (now > endTime && session.status !== 'completed') {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Pending Completion</span>;
    } else {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Upcoming</span>;
    }
  };
  
  const renderSessionActions = (session: any) => {
    const now = new Date();
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);
    const isUpcoming = now < startTime;
    const isActive = now >= startTime && now <= endTime;
    const isPast = now > endTime;
    const isCompleted = session.status === 'completed';
    
    if (session.cancelled_at) {
      return null;
    }
    
    return (
      <div className="mt-3 flex flex-wrap gap-2 items-center">
        {isActive && session.meeting_link && (
          <button 
            onClick={() => handleJoinSession(session)}
            className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors"
          >
            <FaVideo className="mr-1.5 h-3.5 w-3.5" /> Join Session
          </button>
        )}
        
        {isUpcoming && !isActive && session.meeting_link && (startTime.getTime() - now.getTime() < 10 * 60 * 1000) && (
          <button 
            onClick={() => handleStartSession(session.id, session.meeting_link)}
            className="flex items-center px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 transition-colors"
          >
            <FaVideo className="mr-1.5 h-3.5 w-3.5" /> Start Session
          </button>
        )}

        {(isActive || (isPast && !isCompleted)) && (
            <button 
              onClick={() => handleCompleteSession(session.id)}
              className="flex items-center px-3 py-1.5 bg-sky-500 text-white text-xs font-medium rounded hover:bg-sky-600 transition-colors"
            >
              <FaCalendarCheck className="mr-1.5 h-3.5 w-3.5" /> 
              {isPast && !isCompleted ? 'Mark Complete' : 'Complete Session'}
            </button>
        )}
        
        {isUpcoming && (
          <button 
            onClick={() => setCancelSessionId(session.id)}
            className="flex items-center px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium rounded hover:bg-red-200 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    );
  };
  
  const renderCancelSessionModal = () => {
    if (!cancelSessionId) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Session</h3>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to cancel this session? This action cannot be undone.
          </p>
          
          <div className="mb-4">
            <label htmlFor="cancellation-reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason (optional)
            </label>
            <textarea
              id="cancellation-reason"
              className="w-full rounded-lg border border-gray-200 p-3 focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
              placeholder="Please provide a reason for cancellation..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setCancelSessionId(null);
                setCancellationReason('');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCancelSession}
              disabled={isCancelling}
              className={`px-4 py-2 bg-red-600 text-white rounded-lg ${
                isCancelling ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'
              } transition-colors`}
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderReviews = () => {
    if (reviews.length === 0) {
      return <p className="text-center text-gray-500 py-8">No reviews yet.</p>;
    }
    return (
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">by {review.mentees?.name || 'Anonymous'}</span>
            </div>
            <p className="text-gray-700">{review.comment}</p>
            <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderSessionsList = (sessionsToRender: any[], type: 'upcoming' | 'past') => {
    if (sessionsToRender.length === 0) {
      return <p className="text-center text-gray-500 py-8">No {type} sessions found.</p>;
    }
    return (
      <div className="space-y-6">
        {sessionsToRender.map(session => (
          <div key={session.id} className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start">
              <div>
                <h3 className="text-lg font-semibold text-indigo-700 mb-1">{session.title || 'Mentoring Session'}</h3>
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <FaCalendarCheck className="mr-2 text-gray-400" />
                  <span>{formatDateTime(session.start_time)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FaClock className="mr-2 text-gray-400" />
                  <span>{calculateDuration(session.start_time, session.end_time)}</span>
                </div>
                {session.mentees && (
                  <div className="flex items-center text-sm text-gray-700 font-medium mb-2">
                     <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 overflow-hidden text-xs">
                      {session.mentees.image_url ? (
                        <Image src={session.mentees.image_url} alt={session.mentees.name || 'Mentee'} width={24} height={24} className="object-cover" />
                      ) : (session.mentees.name || 'M').charAt(0).toUpperCase()}
                    </div>
                    <span>With: {session.mentees.name || 'N/A'} ({session.mentees.email || 'N/A'})</span>
                  </div>
                )}
              </div>
              <div className="mt-3 sm:mt-0 sm:text-right">
                {renderStatus(session)}
              </div>
            </div>
            {session.description && (
              <p className="text-sm text-gray-600 mt-2 mb-3 p-3 bg-gray-50 rounded-md">{session.description}</p>
            )}
            <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
              {renderSessionActions(session)}
              <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                <button
                  onClick={() => saveAs(new Blob([generateICSString(session)], { type: 'text/calendar;charset=utf-8' }), `session-${session.id}.ics`)}
                  className="flex items-center text-xs text-gray-500 hover:text-indigo-600 transition-colors p-1.5 rounded hover:bg-indigo-50"
                  title="Download .ICS File"
                >
                  <FaDownload className="h-4 w-4 mr-1" /> ICS
                </button>
                <a
                  href={generateGoogleLink(session)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-xs text-gray-500 hover:text-indigo-600 transition-colors p-1.5 rounded hover:bg-indigo-50"
                  title="Add to Google Calendar"
                >
                  <FaGoogle className="h-3.5 w-3.5 mr-1" /> Google Calendar
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">My Sessions</h2>
        </div>

        <div className="mb-6 bg-white shadow-sm rounded-lg p-1 sm:p-1.5">
          <nav className="flex space-x-1 sm:space-x-2" aria-label="Tabs">
            {[ 
              { name: 'Upcoming', tab: 'upcoming' as const },
              { name: 'Past', tab: 'past' as const },
              { name: 'Reviews', tab: 'reviews' as const },
            ].map((tabItem) => (
              <button
                key={tabItem.name}
                onClick={() => setActiveTab(tabItem.tab)}
                className={`flex-1 whitespace-nowrap py-2.5 px-2 sm:px-4 border-b-2 font-medium text-sm rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${
                  activeTab === tabItem.tab
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                {tabItem.name}
              </button>
            ))}
          </nav>
        </div>

        {(activeTab === 'upcoming' || activeTab === 'past') && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-white p-4 rounded-lg shadow-sm">
            <div>
              <label htmlFor="filter-sessions" className="block text-xs font-medium text-gray-700 mb-1">Filter by</label>
              <select 
                id="filter-sessions" 
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value as any)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
              </select>
            </div>
            <div>
              <label htmlFor="sort-sessions" className="block text-xs font-medium text-gray-700 mb-1">Sort by</label>
              <select 
                id="sort-sessions" 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
              >
                <option value="newest">Date (Newest First)</option>
                <option value="oldest">Date (Oldest First)</option>
              </select>
            </div>
            <div>
              <label htmlFor="search-sessions" className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <input 
                type="text" 
                id="search-sessions"
                placeholder="Title, mentee, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-3 text-sm text-gray-500">Loading sessions...</p>
          </div>
        ) : (
          <>
            {activeTab === 'upcoming' && renderSessionsList(filterSessions('upcoming'), 'upcoming')}
            {activeTab === 'past' && renderSessionsList(filterSessions('past'), 'past')}
            {activeTab === 'reviews' && renderReviews()}
          </>
        )}
        {renderCancelSessionModal()}
      </div>
    </div>
  );
};

export default MentorSessions;