"use client"
import React, { ReactNode, Suspense } from 'react';
import { NavItem } from './DashboardComponents';
import { UserRole } from '../../../../lib/user';
import ProfileBubble from './ProfileBubble';

// Welcome message component
const WelcomeMessage: React.FC<{
  showWelcome: boolean;
  setShowWelcome: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ showWelcome }) => {
  if (!showWelcome) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-md z-50 animate-fade-in">
      <span className="font-bold">Welcome to your dashboard!</span>
      <p>Your account has been successfully created.</p>
    </div>
  );
};

// Define props for the base dashboard
export type BaseDashboardProps = {
  user: Record<string, unknown>;
  userRole: UserRole | null;
  showWelcome: boolean;
  setShowWelcome: React.Dispatch<React.SetStateAction<boolean>>;
  activeView: 'mentors' | 'groupMentorship';
  setActiveView: React.Dispatch<React.SetStateAction<'mentors' | 'groupMentorship'>>;
  activeNavItem: 'home' | 'explore' | 'community' | 'calendar' | 'chat' | 'achievement';
  setActiveNavItem: React.Dispatch<React.SetStateAction<'home' | 'explore' | 'community' | 'calendar' | 'chat' | 'achievement'>>;
  renderActiveSection: () => ReactNode;
  isLoading?: boolean;
};

// Base Dashboard component that abstracts the common UI structure
const BaseDashboard: React.FC<BaseDashboardProps> = ({
  user,
  userRole,
  showWelcome,
  setShowWelcome,
  activeView,
  setActiveView,
  activeNavItem,
  setActiveNavItem,
  renderActiveSection,
  isLoading = false
}) => {
  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden">
      {/* Welcome Message */}
      <Suspense fallback={<div>Loading...</div>}>
        <WelcomeMessage setShowWelcome={setShowWelcome} showWelcome={showWelcome} />
      </Suspense>

      {/* Profile Bubble */}
      <ProfileBubble user={user} userRole={userRole} />

      {/* Sidebar */}
      <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center pt-8 pb-4">
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => setActiveView('groupMentorship')}
            className={`rotate-180 writing-mode-vertical-rl transform origin-center cursor-pointer px-4 py-2 rounded transition-colors ${
              activeView === 'groupMentorship'
                ? 'bg-indigo-100 text-indigo-700 font-semibold'
                : 'text-gray-500 hover:text-gray-700 font-medium hover:bg-gray-100'
            }`}
            style={{ writingMode: 'vertical-rl' }}
          >
            Group Mentorship
          </button>
          <button
            onClick={() => setActiveView('mentors')}
            className={`rotate-180 writing-mode-vertical-rl transform origin-center cursor-pointer px-4 py-2 rounded transition-colors ${
              activeView === 'mentors'
                ? 'bg-indigo-100 text-indigo-700 font-semibold'
                : 'text-gray-500 hover:text-gray-700 font-medium hover:bg-gray-100'
            }`}
            style={{ writingMode: 'vertical-rl' }}
          >
            Mentors
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-x-hidden">
        {activeView === 'mentors' ? (
          <>
            {/* Navigation */}
            <div className="flex items-center mb-8 overflow-x-auto">
              <div className="flex flex-wrap space-x-2">
                <NavItem 
                  icon="home" 
                  label="Home" 
                  active={activeNavItem === 'home'} 
                  onClick={() => setActiveNavItem('home')}
                />
                <NavItem 
                  icon="compass" 
                  label="Explore" 
                  active={activeNavItem === 'explore'} 
                  onClick={() => setActiveNavItem('explore')}
                />
                <NavItem 
                  icon="community" 
                  label="Community" 
                  active={activeNavItem === 'community'} 
                  onClick={() => setActiveNavItem('community')}
                />
                <NavItem 
                  icon="calendar" 
                  label="Bookings" 
                  active={activeNavItem === 'calendar'} 
                  onClick={() => setActiveNavItem('calendar')}
                />
                <NavItem 
                  icon="chat" 
                  label="Chat" 
                  active={activeNavItem === 'chat'} 
                  onClick={() => setActiveNavItem('chat')}
                />
                <NavItem 
                  icon="achievement" 
                  label="Achievements" 
                  active={activeNavItem === 'achievement'} 
                  onClick={() => setActiveNavItem('achievement')}
                />
              </div>
            </div>

            {/* Render the active section */}
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-6 py-1">
                    <div className="h-2 bg-slate-200 rounded"></div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                        <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                      </div>
                      <div className="h-2 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              renderActiveSection()
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Group Mentorship</h2>
            <p className="text-gray-600 mb-6 text-center max-w-2xl">
              Group mentorship is coming soon! Join interactive sessions with industry professionals and peers.
              Learn together, share experiences, and build connections in a collaborative environment.
            </p>
            <button
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={() => setActiveView('mentors')}
            >
              Back to Individual Mentorship
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseDashboard;