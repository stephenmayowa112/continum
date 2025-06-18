"use client"

import { useState, useEffect } from 'react';
import type { Mentor } from '../../../../../services/profileService';

interface MentorStatsProps {
  mentor: Mentor | null;
}

export default function MentorStats({ mentor }: MentorStatsProps) {
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    averageRating: 0,
    totalHours: 0,
  });
  
  useEffect(() => {
    if (mentor) {
      
      setStats({
        totalSessions: mentor.total_sessions || 0,
        completedSessions: Math.floor((mentor.total_sessions || 0) * 0.8), // 80% of total as completed
        upcomingSessions: Math.floor((mentor.total_sessions || 0) * 0.2), // 20% of total as upcoming
        averageRating: mentor.rating || 0,
        totalHours: (mentor.total_sessions || 0) * 1, // Assuming 1 hour per session
      });
    }
  }, [mentor]);
  
  if (!mentor) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
        <p className="text-gray-500">Please complete your mentor profile first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Sessions */}
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.totalSessions}</p>
          <p className="text-sm text-gray-600 mt-1">Total Sessions</p>
        </div>
        
        {/* Completed Sessions */}
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-green-600">{stats.completedSessions}</p>
          <p className="text-sm text-gray-600 mt-1">Completed</p>
        </div>
        
        {/* Upcoming Sessions */}
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-purple-600">{stats.upcomingSessions}</p>
          <p className="text-sm text-gray-600 mt-1">Upcoming</p>
        </div>
        
        {/* Average Rating */}
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <p className="text-3xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</p>
          <p className="text-sm text-gray-600 mt-1">Avg. Rating</p>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Update Availability
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
            View Schedule
          </button>
        </div>
      </div>
    </div>
  );
}