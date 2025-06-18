"use client"
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getMenteeSessions, cancelSession, completeSession } from '../../../../services/sessionService';
import { hasReviewedSession } from '../../../../services/reviewService';
import SessionReview from '../../../../components/SessionReview';
import { toast } from 'react-toastify';
import { FaVideo, FaPhoneAlt, FaCalendarCheck, FaClock, FaStar } from 'react-icons/fa';

interface MenteeSessionsProps {
  menteeId: string;
}

const MenteeSessions: React.FC<MenteeSessionsProps> = ({ menteeId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancelSessionId, setCancelSessionId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  const [sessionStatusMap, setSessionStatusMap] = useState<Record<string, boolean>>({});
  
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const sessionsData = await getMenteeSessions(menteeId);
      setSessions(sessionsData);
      const reviewStatusMap: Record<string, boolean> = {};
      for (const session of sessionsData) {
        if (session.status === 'completed') {
          const reviewed = await hasReviewedSession(menteeId, session.id);
          reviewStatusMap[session.id] = reviewed;
        }
      }
      setSessionStatusMap(reviewStatusMap);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [menteeId]);
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);
  
  const handleCancelSession = async () => {
    if (!cancelSessionId) return;
    
    setIsCancelling(true);
    try {
      await cancelSession(cancelSessionId, cancellationReason);
      toast.success('Session cancelled successfully');
      setCancelSessionId(null);
      setCancellationReason('');
      loadSessions();
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Failed to cancel session');
    } finally {
      setIsCancelling(false);
    }
  };
  
  const handleJoinSession = (session: any) => {
    if (session.meeting_link) {
      window.open(session.meeting_link, '_blank');
    } else {
      toast.info('This session has no meeting link. Please contact support.');
    }
  };
  
  const handleCompleteSession = async (sessionId: string) => {
    try {
      await completeSession(sessionId);
      toast.success('Session marked as completed');
      loadSessions();
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to mark session as completed');
    }
  };
  
  const handleReviewSubmitted = () => {
    toast.success('Thank you for your review!');
    setReviewSessionId(null);
    loadSessions();
  };
  
  const filterSessions = (status: 'upcoming' | 'past') => {
    if (status === 'upcoming') {
      return sessions.filter(session => 
        ['upcoming', 'active'].includes(session.status) && !session.cancelled_at
      );
    } else {
      return sessions.filter(session => 
        session.status === 'completed' || session.status === 'cancelled' || session.cancelled_at
      );
    }
  };
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${formattedDate} at ${formattedTime}`;
  };
  
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
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
    } else {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Upcoming</span>;
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
      <div className="mt-2 space-x-2">
        {isActive && (
          <>
            <button 
              onClick={() => handleJoinSession(session)}
              className="px-4 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
            >
              Join Session
            </button>
            <button 
              onClick={() => handleCompleteSession(session.id)}
              className="px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Mark Complete
            </button>
          </>
        )}
        
        {isUpcoming && (
          <>
            {startTime.getTime() - now.getTime() < 10 * 60 * 1000 && (
              <button 
                onClick={() => handleJoinSession(session)}
                className="px-4 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
              >
                Join Early
              </button>
            )}
            <button 
              onClick={() => setCancelSessionId(session.id)}
              className="px-4 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
        
        {isPast && !isCompleted && (
          <button 
            onClick={() => handleCompleteSession(session.id)}
            className="px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            Mark Complete
          </button>
        )}
        
        {isCompleted && !sessionStatusMap[session.id] && (
          <button 
            onClick={() => setReviewSessionId(session.id)}
            className="px-4 py-1 bg-yellow-100 text-yellow-600 text-sm rounded hover:bg-yellow-200 transition-colors flex items-center gap-1"
          >
            <FaStar /> Leave Review
          </button>
        )}
        
        {isCompleted && sessionStatusMap[session.id] && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <FaStar /> Reviewed
          </span>
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
  
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FaCalendarCheck className="text-gray-400 text-2xl" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">No sessions found</h3>
      <p className="text-gray-500 mt-2">
        {activeTab === 'upcoming'
          ? "You don't have any upcoming sessions. Book a session with a mentor to get started."
          : "You don't have any past sessions."}
      </p>
    </div>
  );
  
  return (
    <div className="space-y-6">
      {renderCancelSessionModal()}
      
      {/* Session review modal */}
      {reviewSessionId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Leave a Review</h3>
              <button
                onClick={() => setReviewSessionId(null)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close review modal"
                title="Close review modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {reviewSessionId && sessions.find(s => s.id === reviewSessionId) && (
              <SessionReview
                sessionId={reviewSessionId}
                mentorId={sessions.find(s => s.id === reviewSessionId).mentor_id}
                menteeId={menteeId}
                mentorName={sessions.find(s => s.id === reviewSessionId).mentors?.name || 'Mentor'}
                onReviewSubmitted={handleReviewSubmitted}
              />
            )}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 px-6 text-center focus:outline-none ${
              activeTab === 'upcoming'
                ? 'border-b-2 border-indigo-500 text-indigo-700 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Sessions
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center focus:outline-none ${
              activeTab === 'past'
                ? 'border-b-2 border-indigo-500 text-indigo-700 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('past')}
          >
            Past Sessions
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-3 text-gray-500">Loading sessions...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filterSessions(activeTab).length === 0 ? (
                renderEmptyState()
              ) : (
                filterSessions(activeTab).map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                        {session.mentors?.profile_image_url ? (
                          <Image
                            src={session.mentors.profile_image_url}
                            alt={session.mentors?.name || 'Mentor'}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-indigo-600 font-medium text-lg">
                            {(session.mentors?.name?.charAt(0) || 'M').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {session.title || `Session with ${session.mentors?.name || 'Mentor'}`}
                          </h3>
                          {renderStatus(session)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {session.mentors?.name || 'Mentor'} {session.mentors?.role ? `(${session.mentors.role})` : ''}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          <div className="flex items-center text-xs text-gray-600">
                            <FaClock className="mr-1 text-gray-400" />
                            {formatDateTime(session.start_time)}
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <span className="mr-1">Duration:</span>
                            {calculateDuration(session.start_time, session.end_time)}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-600 mt-1">
                          {session.meeting_link ? (
                            <>
                              {session.title?.includes('Video') ? (
                                <FaVideo className="mr-1 text-gray-400" />
                              ) : (
                                <FaPhoneAlt className="mr-1 text-gray-400" />
                              )}
                              <span>Online meeting available</span>
                            </>
                          ) : (
                            <span>No meeting link</span>
                          )}
                        </div>
                        
                        {session.description && (
                          <p className="text-xs text-gray-600 mt-2 border-t border-gray-100 pt-2">
                            {session.description}
                          </p>
                        )}
                        
                        {renderSessionActions(session)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenteeSessions;