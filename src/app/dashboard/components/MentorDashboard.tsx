// app/dashboard/components/MentorDashboard.tsx
"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '../../../lib/auth';
import { getUserRole, UserRole } from '../../../lib/user';
import { fetchMentorById } from '../../../lib/mentors';
import { Mentor } from './common/types';
import BaseDashboard from './common/BaseDashboard';

// Import section components
import MentorHome from './MentorDashboardSections/MentorHome';
import MentorExplore from './MentorDashboardSections/MentorExplore';
import MentorCommunity from './MentorDashboardSections/MentorCommunity';
import MentorChat from './MentorDashboardSections/MentorChat';
import MentorAchievements from './MentorDashboardSections/MentorAchievements';
import MentorSessions from './MentorDashboardSections/MentorSessions';

// Main Dashboard Component
const MentorDashboard: React.FC = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeView, setActiveView] = useState<'mentors' | 'groupMentorship'>('mentors');
  const [activeNavItem, setActiveNavItem] = useState<'home' | 'explore' | 'community' | 'calendar' | 'chat' | 'achievement'>('home');
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDevelopmentMode = process.env.NODE_ENV === 'development';

  // Check for welcome message display
  useEffect(() => {
    // Check if user is coming from signup
    const fromSignup = searchParams.get('fromSignup');
    if (fromSignup === 'true') {
      setShowWelcome(true);
      // Remove the query parameter after processing
      const url = new URL(window.location.href);
      url.searchParams.delete('fromSignup');
      router.replace(url.pathname);

      // Auto-hide welcome message after 5 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  // Fetch mentor data for the logged-in user
  useEffect(() => {
    const loadMentor = async () => {
      setIsLoading(true);
      try {
        if (user?.id) {
          const mentorData = await fetchMentorById(user.id);
          setMentor(mentorData);
        } else {
          setMentor(null);
        }
      } catch (error) {
        console.error('Error loading mentor:', error);
        setMentor(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadMentor();
  }, [user]);

  // Fetch user role when component mounts
  useEffect(() => {
    const fetchUserRole = async () => {
      // For development mode without a user, set a default role
      if (!user?.id && isDevelopmentMode) {
        console.log('Setting default user role for development');
        setUserRole('mentor');
        return;
      }

      if (user?.id) {
        try {
          const role = await getUserRole(user.id);
          setUserRole(role);
          console.log('User role:', role);
        } catch (error) {
          console.error('Error fetching user role:', error);
          if (isDevelopmentMode) {
            // Default fallback for development
            setUserRole('mentor');
          }
        }
      }
    };
    
    fetchUserRole();
  }, [user, isDevelopmentMode]);

  // Make sure we have a selected mentor when viewing booking page
  useEffect(() => {
    if (activeNavItem === 'calendar' && !selectedMentorId && mentor) {
      setSelectedMentorId(mentor.id);
    }
  }, [activeNavItem, selectedMentorId, mentor]);

  // Function to navigate between sections from the home screen
  const handleNavigate = (section: 'explore' | 'community' | 'calendar' | 'chat') => {
    switch (section) {
      case 'explore':
        setActiveNavItem('explore');
        break;
      case 'community':
        setActiveNavItem('community');
        break;
      case 'calendar':
        setActiveNavItem('calendar');
        break;
      case 'chat':
        setActiveNavItem('chat');
        break;
    }
  };

  // Render the appropriate section based on active nav item
  const renderActiveSection = () => {
    // Create a default user object that satisfies Record<string, unknown>
    const userRecord: Record<string, unknown> = user ? 
      { 
        ...(user as unknown as Record<string, unknown>), 
        role: userRole,
        // Use mentor name and profile image if available
        name: mentor?.name || (user as any).name || "User",
        image: mentor?.imageUrl || (user as any).image || "/images/mentor_pic.png"
      } : 
      { 
        name: "Development User", 
        image: "/images/mentor_pic.png", 
        role: userRole,
        id: "dev-user-id",
        email: "dev@example.com"
      };
    // Use mentor data for sections
    switch (activeNavItem) {
      case 'home':
        return (
          <MentorHome
            user={userRecord}
            mentors={mentor ? [mentor] : []}
            onNavigate={handleNavigate}
            userRole={userRole}
          />
        );
      case 'explore':
        return <MentorExplore
          mentors={mentor ? [mentor] : []}
          onSelectMentor={(mentorId) => {
            setSelectedMentorId(mentorId);
            setActiveNavItem('calendar'); // Navigate to bookings when a mentor is selected
          }}
        />;
      case 'community':
        return <MentorCommunity />;
      case 'calendar':
        return (
          <MentorSessions mentorId={mentor?.id || ''} />
        );
      case 'chat':
        return <MentorChat />;
      case 'achievement':
        return (
          <MentorAchievements
            user={userRecord}
            selectedMentor={mentor || undefined}
          />
        );
      default:
        return (
          <MentorHome
            user={userRecord}
            mentors={mentor ? [mentor] : []}
            onNavigate={handleNavigate}
            userRole={userRole}
          />
        );
    }
  };

  // Use the base dashboard component with our specific logic
  return (
    <BaseDashboard
      user={user ? {
        ...(user as unknown as Record<string, unknown>),
        // Add the mentor's name if available
        name: mentor?.name || (user as any).name || "User",
        image: mentor?.imageUrl || (user as any).image || "/images/mentor_pic.png",
        role: userRole
      } : {
        name: "Guest User", 
        image: "/images/mentor_pic.png", 
        role: userRole,
        id: "guest-user-id",
        email: "guest@example.com"
      }}
      userRole={userRole}
      showWelcome={showWelcome}
      setShowWelcome={setShowWelcome}
      activeView={activeView}
      setActiveView={setActiveView}
      activeNavItem={activeNavItem}
      setActiveNavItem={setActiveNavItem}
      renderActiveSection={renderActiveSection}
      isLoading={isLoading}
    />
  );
};

export default MentorDashboard;