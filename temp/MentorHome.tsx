"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight, FiCalendar } from 'react-icons/fi';
import { Mentor } from '@/app/dashboard/components/common/types';
import { UserRole } from '@/lib/user';
import { getMentorStats, MentorStats } from '@/services/profileService';
import { getMentorSessions } from '@/services/sessionService';
import { Session } from '@/types/sessions';

interface MentorHomeProps {
  user: Record<string, unknown>;
  mentors: Mentor[];
  onNavigate: (section: 'explore' | 'community' | 'calendar' | 'chat') => void;
  userRole: UserRole | null;
}

const MentorHome: React.FC<MentorHomeProps> = ({ 
  user,
  mentors = [], // Default to empty array if undefined
  onNavigate,
  userRole
}) => {
  // Add state for mentor statistics
  const [mentorStats, setMentorStats] = useState<MentorStats>({
    sessionsCompleted: 0,
    activeMentees: 0,
    rating: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);

  // Fetch mentor statistics when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      if (userRole === 'mentor' && mentors.length > 0 && mentors[0]?.id) {
        setIsLoadingStats(true);
        try {
          const mentorId = mentors[0].id;
          const stats = await getMentorStats(mentorId);
          console.log('Fetched mentor stats:', stats);
          setMentorStats(stats);
        } catch (error) {
          console.error('Error fetching mentor statistics:', error);
        } finally {
          setIsLoadingStats(false);
        }
      }
    };

    fetchStats();
  }, [userRole, mentors]);

  // Fetch recent sessions for Recent Activity
  useEffect(() => {
    if (mentors[0]?.id) {
      getMentorSessions(mentors[0].id)
        .then((sessions: Session[]) => {
          const sorted = sessions.sort((a: Session, b: Session) => 
            new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
          );
          setRecentSessions(sorted.slice(0, 5));
        })
        .catch(console.error);
    }
  }, [mentors]);

  // Featured mentors (just take the first 3 for demo)
  const featuredMentors = mentors.slice(0, 3);
  
  // Different content based on user role
  const renderRoleSpecificContent = () => {
    if (userRole === 'mentor') {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-xl font-semibold text-black mb-4">Mentor Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-black">Sessions Completed</h3>
              {isLoadingStats ? (
                <div className="animate-pulse h-8 bg-blue-100 rounded w-16 mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-black">
                  {mentorStats.sessionsCompleted}
                  {mentorStats.sessionsCompleted === 0 && 
                    <span className="text-xs font-normal text-gray-500 block mt-1">
                      No sessions completed yet
                    </span>
                  }
                </p>
              )}
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-black">Active Mentees</h3>
              {isLoadingStats ? (
                <div className="animate-pulse h-8 bg-green-100 rounded w-16 mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-black">
                  {mentorStats.activeMentees}
                  {mentorStats.activeMentees === 0 && 
                    <span className="text-xs font-normal text-gray-500 block mt-1">
                      No active mentees yet
                    </span>
                  }
                </p>
              )}
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-black">Rating</h3>
              {isLoadingStats ? (
                <div className="animate-pulse h-8 bg-purple-100 rounded w-16 mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-black">
                  {mentorStats.rating > 0 ? (
                    <>{mentorStats.rating} <span className="text-sm font-normal">/5</span></>
                  ) : (
                    <span className="text-xs font-normal text-gray-500">No ratings yet</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-6">
          <Image
            src={typeof user?.image === 'string' ? user.image : "/images/mentor_pic.png"}
            alt="User"
            width={64}
            height={64}
            className="rounded-full object-cover w-16 h-16"
          />
          <div className="ml-4">
            <h2 className="text-2xl font-semibold text-black">
              Welcome back, {typeof user?.name === 'string' ? user.name : "User"}!
              {userRole && <span className="ml-2 text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </span>}
            </h2>
            <p className="text-gray-600 mb-6">Continue where you left off</p>
            <div className="mt-4">
              <Link legacyBehavior href="/dashboard/profile/general">
                <a className="text-blue-600 font-medium hover:underline">Edit Profile</a>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Role-specific content */}
        {renderRoleSpecificContent()}
        
        {/* Quick Stats - Shown to both but with role-specific text */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-black">
              {userRole === 'mentor' ? 'Your Next Session' : 'Next Session'}
            </h3>
            <p className="text-sm text-black">Tomorrow, 3:00 PM</p>
            <button 
              className="mt-2 text-blue-600 text-sm flex items-center hover:underline"
              onClick={() => onNavigate('calendar')}
              aria-label="View calendar"
              title="View calendar"
            >
              View calendar <FiArrowRight className="ml-1" size={14} />
            </button>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-black">Community Activity</h3>
            <p className="text-sm text-black">
              {userRole === 'mentor' 
                ? '3 new questions from mentees' 
                : '3 new replies to your posts'}
            </p>
            <button 
              className="mt-2 text-green-600 text-sm flex items-center hover:underline"
              onClick={() => onNavigate('community')}
              aria-label="View discussions"
              title="View discussions"
            >
              View discussions <FiArrowRight className="ml-1" size={14} />
            </button>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-black">Messages</h3>
            <p className="text-sm text-black">
              {userRole === 'mentor' 
                ? '5 unread messages from mentees' 
                : '5 unread messages'}
            </p>
            <button 
              className="mt-2 text-purple-600 text-sm flex items-center hover:underline"
              onClick={() => onNavigate('chat')}
              aria-label="Check inbox"
              title="Check inbox"
            >
              Check inbox <FiArrowRight className="ml-1" size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Feed */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {recentSessions.length === 0 ? (
            <p className="text-gray-500">No recent activity.</p>
          ) : (
            recentSessions.map((session) => (
              <div key={session.id} className="flex p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="p-2 bg-gray-50 rounded-lg mr-4">
                  <FiCalendar className="text-blue-500" size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{session.title || `Session with ${session.mentees?.name}`}</h4>
                  <p className="text-sm text-gray-600">{new Date(session.start_time).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{session.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Featured Mentors - Only show to mentees */}
      {userRole !== 'mentor' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-black">Featured Mentors</h3>
            <button 
              className="text-blue-600 text-sm flex items-center hover:underline"
              onClick={() => onNavigate('explore')}
              aria-label="View all mentors"
              title="View all mentors"
            >
              View all mentors <FiArrowRight className="ml-1" size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMentors.map((mentor, index) => (
              <div key={index} className="flex flex-col border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                <div className="relative h-40">
                  <Image
                    src={mentor.imageUrl}
                    alt={mentor.name}
                    width={300}
                    height={160}
                    className="w-full h-40 object-cover"
                  />
                  {mentor.isTopRated && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded text-gray-800">
                      Top Rated
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-800">{mentor.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{mentor.role} at {mentor.company}</p>
                  <div className="flex space-x-2 mb-3">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {mentor.sessions} Sessions
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {mentor.experience}+ Years
                    </span>
                  </div>
                  <button 
                    className="w-full py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition text-sm"
                    aria-label={`View ${mentor.name}'s profile`}
                    title={`View ${mentor.name}'s profile`}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Mentor-specific content */}
      {userRole === 'mentor' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-black mb-6">Your Mentees</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mentors.slice(0, 3).map((mentor, index) => (
              <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                <Image
                  src={mentor.imageUrl}
                  alt="Mentee"
                  width={50}
                  height={50}
                  className="rounded-full object-cover w-12 h-12"
                />
                <div className="ml-3">
                  <h4 className="font-medium text-black">{mentor.name}</h4>
                  <p className="text-sm text-gray-700">Next session: Tomorrow</p>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="mt-4 text-blue-600 text-sm flex items-center hover:underline"
            aria-label="View all mentees"
            title="View all mentees"
          >
            View all mentees <FiArrowRight className="ml-1" size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MentorHome;
