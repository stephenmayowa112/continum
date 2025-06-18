"use client";

import { useUser } from '../../../lib/auth';
import { Tab } from '@headlessui/react';
import { useState } from 'react';
import Link from 'next/link';
import ProfileInfo from './general/page';
import ExpertiseSettings from './expertise/page';
import VisibilitySettings from './social-links/page';
import UpcomingSessions from '../components/common/UpcomingSessions';

export default function MentorProfilePage() {
  const { user, loading } = useUser();
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your profile settings</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mentor Profile</h1>
        
        <div>
          <Link
            href="/dashboard/profile/availability"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          >
            Manage Availability
          </Link>
        </div>
      </div>
      
      {/* Display upcoming sessions for the mentor */}
      <div className="mb-8">
        <UpcomingSessions userRole="mentor" />
      </div>
      
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
          <Tab 
            className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
              ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
            }
          >
            Profile Information
          </Tab>
          <Tab
            className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
              ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
            }
          >
            Expertise & Skills
          </Tab>
          <Tab
            className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
              ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
            }
          >
            Visibility Settings
          </Tab>
        </Tab.List>
        
        <Tab.Panel>
          <ProfileInfo />
        </Tab.Panel>
        
        <Tab.Panel>
          <ExpertiseSettings />
        </Tab.Panel>
        
        <Tab.Panel>
          <VisibilitySettings />
        </Tab.Panel>
      </Tab.Group>
    </main>
  );
}