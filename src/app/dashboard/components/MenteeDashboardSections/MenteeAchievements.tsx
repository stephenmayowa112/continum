"use client"
import React, { useState, useEffect } from 'react';
import { Mentor } from '../common/types';
import { 
  fetchUserAchievements, 
  fetchMenteeStats, 
  fetchUserSkills, 
  fetchUserGoals, 
  fetchMenteeFeedback,
  updateGoalStatus,
  Achievement,
  MenteeStats,
  Skill,
  Goal,
  MentorFeedback
} from '../../../../services/achievementService';

interface MenteeAchievementsProps {
  user: {
    id?: string;
    [key: string]: unknown;
  };
  selectedMentor?: Mentor;
}

const MenteeAchievements: React.FC<MenteeAchievementsProps> = ({ user }) => {
  // States for data from Supabase
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<MenteeStats>({
    sessionsAttended: 0,
    hoursLearned: 0,
    projectsCompleted: 0,
    skillsImproved: 0
  });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [feedback, setFeedback] = useState<MentorFeedback[]>([]);
  const [isLoading, setIsLoading] = useState({
    achievements: true,
    stats: true,
    skills: true,
    goals: true,
    feedback: true
  });

  // Get the user ID for data fetching
  const userId = (user?.id as string) || '';

  // Fetch all the data when component mounts
  useEffect(() => {
    if (!userId) return;
    
    const loadData = async () => {
      try {
        // Fetch achievements
        setIsLoading(prev => ({ ...prev, achievements: true }));
        const achievementData = await fetchUserAchievements(userId, 'mentee');
        setAchievements(achievementData);
        setIsLoading(prev => ({ ...prev, achievements: false }));

        // Fetch stats
        setIsLoading(prev => ({ ...prev, stats: true }));
        const statsData = await fetchMenteeStats(userId);
        setStats(statsData);
        setIsLoading(prev => ({ ...prev, stats: false }));

        // Fetch skills
        setIsLoading(prev => ({ ...prev, skills: true }));
        const skillsData = await fetchUserSkills(userId);
        setSkills(skillsData);
        setIsLoading(prev => ({ ...prev, skills: false }));

        // Fetch goals
        setIsLoading(prev => ({ ...prev, goals: true }));
        const goalsData = await fetchUserGoals(userId);
        setGoals(goalsData);
        setIsLoading(prev => ({ ...prev, goals: false }));

        // Fetch feedback
        setIsLoading(prev => ({ ...prev, feedback: true }));
        const feedbackData = await fetchMenteeFeedback(userId);
        setFeedback(feedbackData);
        setIsLoading(prev => ({ ...prev, feedback: false }));
      } catch (error) {
        console.error('Error loading achievement data:', error);
        setIsLoading({
          achievements: false,
          stats: false,
          skills: false,
          goals: false,
          feedback: false
        });
      }
    };

    loadData();
  }, [userId]);

  // Handler for goal checkbox changes
  const handleGoalChange = async (goalId: number, completed: boolean) => {
    try {
      // Optimistic update
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === goalId ? { ...goal, completed } : goal
        )
      );
      
      // Update in the database
      await updateGoalStatus(goalId, completed);
    } catch (error) {
      console.error('Error updating goal:', error);
      // Revert on error
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === goalId ? { ...goal, completed: !completed } : goal
        )
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Your Progress & Achievements
        </h1>
        <p className="mt-2 text-gray-600">
          Track your growth, skills development, and milestone accomplishments.
        </p>
      </div>
      
      {/* Achievements */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Achievements</h2>
        </div>
        <div className="p-6">
          {isLoading.achievements ? (
            // Loading state for achievements
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start p-4 border border-gray-200 rounded-lg">
                  <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-100 animate-pulse mr-4"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : achievements.length > 0 ? (
            <div className="space-y-4">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`flex items-start border rounded-lg p-4 ${achievement.achieved ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
                >
                  <div className="h-12 w-12 flex-shrink-0 rounded-full bg-white border border-gray-200 flex items-center justify-center text-2xl mr-4">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">{achievement.title}</h3>
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        achievement.achieved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {achievement.achieved ? 'Completed' : 'In Progress'}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                    {achievement.date && (
                      <p className="mt-2 text-xs text-gray-500">{achievement.date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">Complete tasks and sessions to earn achievements.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Your Stats</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700">
                {isLoading.stats ? (
                  <div className="h-8 bg-blue-100 rounded animate-pulse w-12 mx-auto"></div>
                ) : (
                  stats.sessionsAttended
                )}
              </div>
              <div className="text-sm text-blue-600">Sessions Attended</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700">
                {isLoading.stats ? (
                  <div className="h-8 bg-green-100 rounded animate-pulse w-12 mx-auto"></div>
                ) : (
                  stats.hoursLearned
                )}
              </div>
              <div className="text-sm text-green-600">Hours Learned</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-indigo-700">
                {isLoading.stats ? (
                  <div className="h-8 bg-indigo-100 rounded animate-pulse w-12 mx-auto"></div>
                ) : (
                  stats.projectsCompleted
                )}
              </div>
              <div className="text-sm text-indigo-600">Projects Completed</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-700">
                {isLoading.stats ? (
                  <div className="h-8 bg-purple-100 rounded animate-pulse w-12 mx-auto"></div>
                ) : (
                  stats.skillsImproved
                )}
              </div>
              <div className="text-sm text-purple-600">Skills Improved</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Skills */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Skills Progress</h2>
        </div>
        <div className="p-6">
          {isLoading.skills ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : skills.length > 0 ? (
            <div className="space-y-6">
              {skills.map(skill => (
                <div key={skill.id} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-gray-700">{skill.name}</div>
                    <div className="text-sm text-gray-500">{skill.progress}%</div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full" 
                      style={{ width: `${skill.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No skills tracked yet. They'll appear here as you progress.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Goals */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Your Learning Goals</h2>
        </div>
        <div className="p-6">
          {isLoading.goals ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <div className="h-5 w-5 bg-gray-200 animate-pulse rounded-sm mr-4"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              ))}
            </div>
          ) : goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map(goal => (
                <div 
                  key={goal.id} 
                  className="flex items-center p-4 border border-gray-200 rounded-lg"
                >
                  <input
                    type="checkbox"
                    id={`goal-${goal.id}`}
                    checked={goal.completed}
                    onChange={() => handleGoalChange(goal.id, !goal.completed)}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label 
                    htmlFor={`goal-${goal.id}`} 
                    className={`ml-4 text-sm ${goal.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}
                  >
                    {goal.title}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No goals set yet. Add goals to track your learning journey.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Mentor Feedback */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Mentor Feedback</h2>
        </div>
        <div className="p-6">
          {isLoading.feedback ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
                  <div className="flex items-center mb-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : feedback.length > 0 ? (
            <div className="space-y-6">
              {feedback.map(item => (
                <div key={item.id} className="border-b border-gray-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-gray-900">{item.mentor_name}</div>
                    <div className="text-sm text-gray-500">{item.date}</div>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{item.text}</p>
                  <div className="flex items-center">
                    <div className="text-sm text-gray-500 mr-2">Rating:</div>
                    <div className="flex">
                      {[...Array(5)].map((_, index) => (
                        <svg 
                          key={index}
                          className={`w-4 h-4 ${index < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No feedback received yet. Feedback will appear here after your sessions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenteeAchievements;