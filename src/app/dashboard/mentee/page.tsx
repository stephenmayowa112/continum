"use client"

import { Tab } from '@headlessui/react';
import { useEffect, useState } from "react";
import { useUser } from "../../../lib/auth";
import { fetchAllMentors } from "../../../lib/mentors";
import MenteeSessions from './MenteeSessions';
import MenteeBookings from '../components/MenteeDashboardSections/MenteeBookings';
import MenteeAchievements from '../components/MenteeDashboardSections/MenteeAchievements';
import { Mentor } from '../components/common/types';

export default function MenteeDashboard() {
  const { user, loading } = useUser();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      // Fetch all mentors
      const loadMentors = async () => {
        const allMentors = await fetchAllMentors();
        setMentors(allMentors);
      };
      loadMentors();
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
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Mentee Dashboard</h1>
      
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
            Find a Mentor
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
            Settings
          </Tab>
        </Tab.List>
        
        <Tab.Panel>
          {/* Overview Tab */}
          <div className="space-y-8">
            {/* Progress & stats overview */}
            <MenteeAchievements user={user as unknown as { id?: string }} />
            {/* Recently added upcoming sessions section */}
            <MenteeSessions menteeId={String(user.id)} />
          </div>
        </Tab.Panel>
        
        <Tab.Panel>
          {/* Find a Mentor Tab */}
          <MenteeBookings 
            mentors={mentors} 
            selectedMentorId={selectedMentorId} 
            setSelectedMentorId={setSelectedMentorId} 
            user={user as unknown as Record<string, unknown>}
          />
        </Tab.Panel>
        
        <Tab.Panel>
          {/* My Sessions Tab */}
          <div className="space-y-8">
            <MenteeSessions menteeId={String(user.id)} />
          </div>
        </Tab.Panel>
        
        <Tab.Panel>
          {/* Settings Tab */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
              <p className="mt-2">Configure your mentee account settings here.</p>
            </div>
          </div>
        </Tab.Panel>
      </Tab.Group>
    </main>
  );
}