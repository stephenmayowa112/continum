"use client"

import { Tab } from '@headlessui/react'
import { useEffect, useState } from "react";
import { useUser } from "../../../lib/auth";
import { fetchMentor, type Mentor } from "../../../../services/profileService";
import MentorAvailability from '../../dashboard/components/MentorDashboardSections/MentorAvailability';
import MentorStats from '../../dashboard/components/MentorDashboardSections/MentorStats';
import MentorSessions from '../../dashboard/components/MentorDashboardSections/MentorSessions';
import MentorProfile from '../../dashboard/components/MentorDashboardSections/MentorProfile';
import UpcomingSessions from "../components/common/UpcomingSessions";
import GoogleCalendarConnect from "../components/common/GoogleCalendarConnect";
import HomeOverview from "../components/common/HomeOverview";

export default function MentorDashboard() {
  const { user, loading } = useUser();
  const [mentorProfile, setMentorProfile] = useState<Mentor | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  useEffect(() => {
    const loadMentorProfile = async () => {
      if (user) {
        try {
          const profile = await fetchMentor(user.id);
          setMentorProfile(profile);
        } catch (error) {
          console.error('Error loading mentor profile:', error);
        }
      }
    };
    
    if (!loading && user) {
      loadMentorProfile();
    }
  }, [user, loading]);
  
  if (loading) {
    return <div className="h-full w-full flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <div>Please log in to view your dashboard</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Mentor Dashboard</h1>
      
      {/* Dashboard Tabs */}
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
          <Tab 
            className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
              ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
            }
          >
            Overview
          </Tab>
          <Tab
            className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
              ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}` 
            }
          >
            My Schedule
          </Tab>
          <Tab
            className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
              ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}` 
            }
          >
            My Sessions
          </Tab>
          <Tab
            className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
              ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}` 
            }
          >
            My Profile
          </Tab>
          <Tab
            className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
              ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}` 
            }
          >
            Settings
          </Tab>
        </Tab.List>
        
        <Tab.Panel>
          {/* Overview Tab */}
          <div className="space-y-8">
            {/* Key dashboard cards */}
            <HomeOverview />
            {/* Overall mentor stats */}
            <MentorStats mentor={mentorProfile} />
            {/* Upcoming sessions list */}
            <UpcomingSessions userRole="mentor" />
          </div>
        </Tab.Panel>
        
        <Tab.Panel>
          {/* My Schedule Tab */}
          <MentorAvailability mentor={mentorProfile} />
        </Tab.Panel>
        
        <Tab.Panel>
          {/* My Sessions Tab */}
          <MentorSessions mentorId={mentorProfile?.id || user.id} />
        </Tab.Panel>
        
        <Tab.Panel>
          {/* My Profile Tab */}
          <MentorProfile mentor={mentorProfile} />
        </Tab.Panel>

        <Tab.Panel>
          {/* Settings Tab - Google Calendar integration and other settings */}
          <div className="space-y-8 max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-800">Account Settings</h2>
            
            <div className="space-y-6">
              <GoogleCalendarConnect 
                userId={mentorProfile?.id || user.id} 
                userRole="mentor" 
              />
              
              {/* Additional settings sections can be added here */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  Configure how you receive notifications about upcoming sessions and booking requests.
                </p>
                {/* Notification settings would go here */}
                <p className="text-gray-500 text-sm italic">Coming soon</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">Session Preferences</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  Configure your preferred session settings.
                </p>
                {/* Session preferences would go here */}
                <p className="text-gray-500 text-sm italic">Coming soon</p>
              </div>
            </div>
          </div>
        </Tab.Panel>
      </Tab.Group>
    </main>
  );
}