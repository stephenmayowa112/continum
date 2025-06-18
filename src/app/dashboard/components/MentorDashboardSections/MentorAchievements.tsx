"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiAward, FiCalendar, FiUsers, FiClock, FiCheck } from 'react-icons/fi';
import { Mentor } from '../common/types';
import { 
  fetchUserAchievements, 
  fetchMentorStats, 
  fetchRecommendedGoals,
  Achievement,
  MentorStats,
  RecommendedGoal
} from '../../../../services/achievementService';

interface MentorAchievementsProps {
  user: {
    image?: string;
    name?: string;
    id?: string;
    [key: string]: unknown;
  };
  selectedMentor?: Mentor;
}

const MentorAchievements: React.FC<MentorAchievementsProps> = ({ 
  user,
  selectedMentor
}) => {
  // States for data from Supabase
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<MentorStats>({
    sessionsCompleted: 0,
    hoursMentored: 0,
    menteesHelped: 0,
    averageRating: 0,
  });
  const [recommendedGoals, setRecommendedGoals] = useState<RecommendedGoal[]>([]);
  const [isLoading, setIsLoading] = useState({
    achievements: true,
    stats: true,
    goals: true,
  });

  // Get the user ID for data fetching
  const userId = (user?.id as string) || selectedMentor?.id || '';

  // Fetch all the data when component mounts
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        // Fetch achievements
        setIsLoading(prev => ({ ...prev, achievements: true }));
        const achievementData = await fetchUserAchievements(userId, 'mentor');
        setAchievements(achievementData);
        setIsLoading(prev => ({ ...prev, achievements: false }));

        // Fetch stats
        setIsLoading(prev => ({ ...prev, stats: true }));
        const statsData = await fetchMentorStats(userId);
        setStats(statsData);
        setIsLoading(prev => ({ ...prev, stats: false }));

        // Fetch recommended goals
        setIsLoading(prev => ({ ...prev, goals: true }));
        const goalsData = await fetchRecommendedGoals('mentor');
        setRecommendedGoals(goalsData);
        setIsLoading(prev => ({ ...prev, goals: false }));
      } catch (error) {
        console.error('Error loading achievement data:', error);
        setIsLoading({
          achievements: false,
          stats: false,
          goals: false,
        });
      }
    };

    loadData();
  }, [userId]);

  // Function to render the appropriate icon based on the icon string from the database
  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'calendar':
        return <FiCalendar className="text-blue-500" size={24} />;
      case 'users':
        return <FiUsers className="text-blue-500" size={24} />;
      case 'clock':
        return <FiClock className="text-blue-500" size={24} />;
      case 'check':
        return <FiCheck className="text-blue-500" size={24} />;
      case 'award':
      default:
        return <FiAward className="text-blue-500" size={24} />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Achievement Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="relative h-48">
          {/* Banner Image */}
          <Image
            src="/images/banner.png"
            alt="Achievement Banner"
            width={1200}
            height={400}
            className="w-full h-48 object-cover object-center"
            priority
            quality={100}
          />
          
          {/* User Profile Picture */}
          <div className="absolute -bottom-12 left-6 border-4 border-white rounded-full shadow-md bg-white flex items-center justify-center">
            <Image
              src={user?.image || selectedMentor?.imageUrl || "/images/mentor_pic.png"}
              alt="Profile"
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== window.location.origin + '/images/mentor_pic.png') {
                  target.src = '/images/mentor_pic.png';
                }
              }}
            />
          </div>
        </div>
        <div className="p-6 pt-16">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {user?.name || selectedMentor?.name || "User"}
              </h2>
              <p className="text-gray-600">Achievements & Stats</p>
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <h3 className="text-2xl font-bold text-gray-800">
                {isLoading.stats ? (
                  <div className="animate-pulse h-8 bg-gray-200 rounded w-16 mx-auto"></div>
                ) : (
                  stats.sessionsCompleted
                )}
              </h3>
              <p className="text-sm text-gray-600">Sessions Completed</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <h3 className="text-2xl font-bold text-gray-800">
                {isLoading.stats ? (
                  <div className="animate-pulse h-8 bg-gray-200 rounded w-16 mx-auto"></div>
                ) : (
                  stats.hoursMentored
                )}
              </h3>
              <p className="text-sm text-gray-600">Hours Mentored</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <h3 className="text-2xl font-bold text-gray-800">
                {isLoading.stats ? (
                  <div className="animate-pulse h-8 bg-gray-200 rounded w-16 mx-auto"></div>
                ) : (
                  stats.menteesHelped
                )}
              </h3>
              <p className="text-sm text-gray-600">Mentees Helped</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <h3 className="text-2xl font-bold text-gray-800">
                {isLoading.stats ? (
                  <div className="animate-pulse h-8 bg-gray-200 rounded w-16 mx-auto"></div>
                ) : (
                  stats.averageRating.toFixed(1)
                )}
              </h3>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Achievements Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Your Achievements</h3>
        
        {isLoading.achievements ? (
          // Loading state for achievements
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start p-4 border border-gray-200 rounded-lg">
                <div className="p-3 bg-gray-100 rounded-lg mr-4 animate-pulse h-12 w-12"></div>
                <div className="flex-grow">
                  <div className="animate-pulse h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="animate-pulse h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : achievements.length > 0 ? (
          // Display actual achievements
          <div className="space-y-6">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-start p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="p-3 bg-blue-50 rounded-lg mr-4">
                  {renderIcon(achievement.icon)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    {achievement.achieved ? (
                      <div className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Achieved
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        In progress
                      </div>
                    )}
                  </div>
                  
                  {achievement.achieved ? (
                    <p className="text-xs text-gray-500 mt-2">Achieved on {achievement.date}</p>
                  ) : (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // No achievements found
          <div className="text-center py-8">
            <p className="text-gray-500">No achievements found. Start mentoring to earn achievements!</p>
          </div>
        )}
      </div>
      
      {/* Upcoming Achievement Goals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended Goals</h3>
        <p className="text-gray-600 mb-6">Complete these goals to level up your profile and increase visibility</p>
        
        {isLoading.goals ? (
          // Loading state for recommended goals
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-gray-200 p-4 rounded-lg">
                <div className="animate-pulse h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="animate-pulse h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="animate-pulse h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : recommendedGoals.length > 0 ? (
          // Display actual recommended goals
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedGoals.map((goal) => (
              <div key={goal.id} className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{goal.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                <a 
                  href={goal.action_url} 
                  className="text-sm text-blue-600 hover:underline" 
                  aria-label={goal.action_text}
                  title={goal.action_text}
                >
                  {goal.action_text}
                </a>
              </div>
            ))}
          </div>
        ) : (
          // No recommended goals found
          <div className="text-center py-8">
            <p className="text-gray-500">No recommended goals available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorAchievements;