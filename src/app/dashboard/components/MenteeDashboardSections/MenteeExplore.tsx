"use client"
import React, { useState } from 'react';
import { Mentor } from '../common/types';
import { CategoryButton } from '../common/DashboardComponents';
import Image from 'next/image';

interface MenteeExploreProps {
  mentors: Mentor[];
  onSelectMentor: (mentorId: string) => void;
}

const MenteeExplore: React.FC<MenteeExploreProps> = ({ mentors, onSelectMentor }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Extract unique categories from all mentors
  const allCategories = [...new Set(mentors.flatMap(mentor => mentor.categories || []))];
  
  // Filter mentors based on active category and search term
  const filteredMentors = mentors.filter(mentor => {
    const matchesCategory = activeCategory === 'All' || mentor.categories?.includes(activeCategory);
    const matchesSearch = searchTerm === '' || 
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      mentor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search mentors by name, role, or company..."
              className="py-3 pl-10 pr-4 block w-full rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <CategoryButton 
            label="All" 
            active={activeCategory === 'All'} 
            onClick={() => setActiveCategory('All')}
            textSize="text-sm"
            padding="px-4 py-2"
          />
          
          {allCategories.map((category) => (
            <CategoryButton
              key={category}
              label={category}
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              textSize="text-sm"
              padding="px-4 py-2"
            />
          ))}
        </div>
      </div>
      
      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.length > 0 ? (
          filteredMentors.map((mentor) => (
            <div 
              key={mentor.id} 
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mr-4 overflow-hidden relative">
                    {mentor.imageUrl ? (
                      <Image 
                        src={mentor.imageUrl} 
                        alt={mentor.name} 
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-indigo-600 font-medium text-2xl">
                        {mentor.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                    <p className="text-sm text-gray-600">{mentor.role} at {mentor.company}</p>
                    <p className="text-sm text-gray-600">{mentor.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">{mentor.sessions}</span> sessions
                  </div>
                  <div>
                    <span className="font-medium">{mentor.reviews}</span> reviews
                  </div>
                  <div>
                    <span className="font-medium">{mentor.experience}</span> years
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.categories?.map((category, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-2 mb-4">
                  {mentor.isAvailableASAP && (
                    <span className="px-2 py-1 bg-green-100 text-xs rounded-full text-green-800 font-medium">
                      Available ASAP
                    </span>
                  )}
                  {mentor.providesCoaching && (
                    <span className="px-2 py-1 bg-blue-100 text-xs rounded-full text-blue-800 font-medium">
                      Provides Coaching
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => onSelectMentor(mentor.id)}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View Profile & Book
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">No mentors found matching your criteria.</p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenteeExplore;