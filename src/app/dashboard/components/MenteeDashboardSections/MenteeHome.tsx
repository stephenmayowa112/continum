"use client"
import React from 'react';
import Image from 'next/image';
import { Mentor } from '../common/types';
import { UserRole } from '../../../../lib/user';

export interface MenteeHomeProps {
  user: Record<string, unknown>;
  mentors: Mentor[];
  onNavigate: (section: 'explore' | 'community' | 'calendar' | 'chat') => void;
  userRole: UserRole | null;
}

const MenteeHome: React.FC<MenteeHomeProps> = ({ 
  user, 
  mentors, 
  onNavigate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userRole
}) => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Welcome back, {(user?.name as string) || 'User'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Continue your mentorship journey with personalized guidance and support.
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => onNavigate('explore')}
          className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-left"
        >
          <div className="flex items-center mb-3">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Find Mentors</h3>
          <p className="text-gray-600 mt-1 text-sm">Discover mentors who match your career goals</p>
        </button>
        
        <button 
          onClick={() => onNavigate('calendar')}
          className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-left"
        >
          <div className="flex items-center mb-3">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Book a Session</h3>
          <p className="text-gray-600 mt-1 text-sm">Schedule your next mentoring session</p>
        </button>
        
        <button 
          onClick={() => onNavigate('community')}
          className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-left"
        >
          <div className="flex items-center mb-3">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Community</h3>
          <p className="text-gray-600 mt-1 text-sm">Connect with other mentees and mentors</p>
        </button>
        
        <button 
          onClick={() => onNavigate('chat')}
          className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-left"
        >
          <div className="flex items-center mb-3">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Messages</h3>
          <p className="text-gray-600 mt-1 text-sm">Check your conversations with mentors</p>
        </button>
      </div>
      
      {/* Upcoming Sessions */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Sessions</h2>
        </div>
        <div className="p-6">
          {mentors && mentors.length > 0 ? (
            <div className="divide-y divide-gray-100">
              <div className="py-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <span className="text-indigo-600 font-medium">
                      {mentors[0]?.name?.charAt(0) || 'M'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {mentors[0]?.name || 'Mentor Name'}
                    </h3>
                    <p className="text-xs text-gray-500">{mentors[0]?.role || 'Role'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Tomorrow, 2:00 PM</p>
                  <p className="text-xs text-gray-500">45 min session</p>
                </div>
              </div>
              
              <div className="py-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <span className="text-indigo-600 font-medium">
                      {mentors.length > 1 ? mentors[1]?.name?.charAt(0) : 'M'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {mentors.length > 1 ? mentors[1]?.name : 'Mentor Name'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {mentors.length > 1 ? mentors[1]?.role : 'Role'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Next week, Monday, 10:00 AM</p>
                  <p className="text-xs text-gray-500">60 min session</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No upcoming sessions scheduled</p>
              <button 
                onClick={() => onNavigate('calendar')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Book a Session
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Recommended Mentors */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Recommended Mentors</h2>
        </div>
        <div className="p-6">
          {mentors && mentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentors.slice(0, 3).map((mentor, index) => (
                <div key={`${mentor.id}-${index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                      {mentor.imageUrl ? (
                        <Image 
                          src={mentor.imageUrl} 
                          alt={mentor.name} 
                          className="h-12 w-12 rounded-full object-cover"
                          width={48}
                          height={48}
                        />
                      ) : (
                        <span className="text-indigo-600 font-medium text-lg">
                          {mentor.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{mentor.name}</h3>
                      <p className="text-xs text-gray-500">{mentor.role} at {mentor.company}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {mentor.categories?.map((category, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => onNavigate('explore')}
                    className="w-full mt-2 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded hover:bg-indigo-100 transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No mentors available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenteeHome;