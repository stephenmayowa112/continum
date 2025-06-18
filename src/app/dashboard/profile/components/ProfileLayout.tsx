"use client";
import React, { useState } from 'react';
import { useRouter, useSelectedLayoutSegments } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';
import { NavItem } from '../../components/common/DashboardComponents';

const navItems = [
  { icon: 'home', label: 'General', segment: 'general' },
  { icon: 'compass', label: 'Expertise', segment: 'expertise' },
  { icon: 'calendar', label: 'Availability', segment: 'availability' },
  { icon: 'community', label: 'Social Links', segment: 'social-links' },
  { icon: 'achievement', label: 'Calendar', segment: 'calendar' },
] as const;

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const segments = useSelectedLayoutSegments();
  const current = segments[segments.length - 1] || 'general';
  const router = useRouter();

  return (
    <div className="flex min-h-screen">
      {/* Mobile header with toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-30 flex items-center justify-between px-4 py-3 border-b">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-2xl">
          {sidebarOpen ? <FiX /> : <FiMenu />}
        </button>
        <span className="font-semibold text-lg">Profile</span>
      </div>
      <aside className={
        `
        transform fixed inset-y-0 left-0 z-40 w-64 bg-white border-r p-6 pt-24
        md:relative md:transform-none md:inset-auto md:flex md:pt-16
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        transition-transform duration-200 ease-in-out`
      }>
        <nav className="flex flex-col p-4 space-y-4">
          {navItems.map((item) => (
            <NavItem
              key={item.segment}
              icon={item.icon}
              label={item.label}
              active={current === item.segment}
              onClick={() => {
                setSidebarOpen(false);
                router.push(`/dashboard/profile/${item.segment}`);
              }}
            />
          ))}
        </nav>
      </aside>
      <section className="flex-1 bg-gray-50 pt-32 md:pt-24 lg:pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Back to Dashboard button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}