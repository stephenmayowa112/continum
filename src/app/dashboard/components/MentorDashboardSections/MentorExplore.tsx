"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { FiSearch } from 'react-icons/fi';
import { BsLightning, BsPersonFill } from 'react-icons/bs';
import { Mentor } from '../common/types';

interface MentorExploreProps {
  mentors: Mentor[];
  onSelectMentor?: (mentorId: string) => void;
}

// Define the skill structure
interface SkillCategory {
  parent: string;
  children: string[];
}

// Define all skills data
const skillsData: SkillCategory[] = [
  { parent: "Design", children: [
    "Graphics Design", "Motion Design", "3D Design", "Product Design", 
    "Multimedia Design", "Interaction Design", "Game Design", 
    "Brand & Identity Design", "Hardware Design", "AI Design"
  ]},
  { parent: "3D Animation", children: [] },
  { parent: "2D Animation", children: [] },
  { parent: "3D Rigging", children: [] },
  { parent: "Concept Art", children: [
    "Visual Design", "Character Concept Art", "Envr. Concept Art", 
    "Digital Matte Painting", "Prop Concept Art", "Background Painting", 
    "Color Script", "Drawing", "Painting"
  ]},
  { parent: "Storyboard & Animatics", children: [] },
  { parent: "Game Animation", children: [] },
  { parent: "Texturing and Lookdev", children: [] },
  { parent: "Modelling", children: [] },
  { parent: "Vfx", children: [] },
  { parent: "Cfx", children: [
    "Cloth Simulation", "Hair Simulation", "Grooming", "Crowd Simulation"
  ]},
  { parent: "Modeling", children: [
    "Character Modeling", "Environment Modelling", "Prop Modelling", "Sculpting"
  ]},
  { parent: "Film Making", children: [
    "Acting", "Film Directing", "Film Distribution", "Cinematography", 
    "Photography", "Production Design", "Hair & Makeup", "Film Editing", "Sound Design"
  ]},
  { parent: "Architecture", children: [] },
];

const MentorExplore: React.FC<MentorExploreProps> = ({ mentors, onSelectMentor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyAvailableASAP, setShowOnlyAvailableASAP] = useState(false);
  const [showOnlyCoaching, setShowOnlyCoaching] = useState(false);
  const [activeParentSkill, setActiveParentSkill] = useState<string | null>(null);
  const [activeChildSkill, setActiveChildSkill] = useState<string | null>(null);

  // Get the children of the active parent skill
  const activeChildren = activeParentSkill 
    ? skillsData.find(skill => skill.parent === activeParentSkill)?.children || []
    : [];

  // Get the currently active skill (either parent or child)
  const activeSkill = activeChildSkill || activeParentSkill;

  // Filter mentors based on search term, active skills, and filter toggles
  const filteredMentors = mentors.filter(mentor => {
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        mentor.name.toLowerCase().includes(searchLower) || 
        mentor.role.toLowerCase().includes(searchLower) || 
        mentor.company.toLowerCase().includes(searchLower) ||
        mentor.location.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filter by active skill if one is selected
    if (activeSkill) {
      const matchesSkill = mentor.categories?.includes(activeSkill);
      if (!matchesSkill) return false;
    }

    // Filter by available ASAP toggle
    if (showOnlyAvailableASAP && !mentor.isAvailableASAP) {
      return false;
    }

    // Filter by coaching toggle
    if (showOnlyCoaching && !mentor.providesCoaching) {
      return false;
    }

    return true;
  });

  // Handle mentor selection
  const handleSelectMentor = (mentorId: string) => {
    if (onSelectMentor) {
      onSelectMentor(mentorId);
    }
  };

  // Handle parent skill selection
  const handleParentSkillClick = (parentSkill: string) => {
    if (activeParentSkill === parentSkill) {
      // If clicking the same parent skill, deselect it
      setActiveParentSkill(null);
      setActiveChildSkill(null);
    } else {
      // Select new parent skill and reset child skill
      setActiveParentSkill(parentSkill);
      setActiveChildSkill(null);
    }
  };

  // Handle child skill selection
  const handleChildSkillClick = (childSkill: string) => {
    if (activeChildSkill === childSkill) {
      // If clicking the same child skill, deselect it
      setActiveChildSkill(null);
    } else {
      // Select new child skill
      setActiveChildSkill(childSkill);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setActiveParentSkill(null);
    setActiveChildSkill(null);
    setShowOnlyAvailableASAP(false);
    setShowOnlyCoaching(false);
  };

  return (
    <>
      {/* Search and Action Buttons */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative flex-grow max-w-5xl w-full sm:w-auto">
          <FiSearch className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, role, company or location"
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm('')}
              title="Clear search"
              aria-label="Clear search input"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowOnlyAvailableASAP(!showOnlyAvailableASAP)}
            style={{ background: 'linear-gradient(90deg, #24242E 0%, #747494 100%)' }}
            className={`flex items-center text-white px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-md whitespace-nowrap`}
          >
            <BsLightning className="mr-2" size={20} />
            <span>Available ASAP</span>
          </button>
          <button 
            onClick={() => setShowOnlyCoaching(!showOnlyCoaching)}
            style={{ background: 'linear-gradient(90deg, #F0EEB4 0%, #DBA508 100%)' }}
            className={`flex items-center text-gray-800 px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-md whitespace-nowrap`}
          >
            <BsPersonFill className="mr-2" size={20} />
            <span>Coaching</span>
          </button>
        </div>
      </div>

      {/* Parent Skills Filters */}
      <div className="mb-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 hide-scrollbar">
          {skillsData.map((skill) => (
            <button 
              key={skill.parent}
              className={`px-2 py-1 text-xs ${activeParentSkill === skill.parent ? "bg-[#9898FA4D] text-indigo-700" : "text-gray-700 hover:bg-gray-50"} rounded-md font-medium transition-colors whitespace-nowrap flex-shrink-0`}
              onClick={() => handleParentSkillClick(skill.parent)}
            >
              {skill.parent}
            </button>
          ))}
          {(activeParentSkill || activeChildSkill) && (
            <button 
              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md font-medium transition-colors whitespace-nowrap flex-shrink-0"
              onClick={() => {
                setActiveParentSkill(null);
                setActiveChildSkill(null);
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Child Skills Area */}
      {activeParentSkill && activeChildren.length > 0 && (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 hide-scrollbar">
            {activeChildren.map((childSkill) => (
              <button
                key={childSkill}
                className={`px-2 py-0.5 text-xs border ${
                  activeChildSkill === childSkill
                    ? "bg-[#9898FA4D] border-indigo-200 text-indigo-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                } rounded-md transition-colors whitespace-nowrap flex-shrink-0`}
                onClick={() => handleChildSkillClick(childSkill)}
              >
                {childSkill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mentor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredMentors.length > 0 ? (
          filteredMentors.map((mentor, index) => (
            <div 
              key={`mentor-${mentor.id}-${index}`} 
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => handleSelectMentor(mentor.id)}
            >
              {/* Mentor Image with Badges */}
              <div className="relative">
                <Image
                  src={mentor.imageUrl}
                  alt={mentor.name}
                  width={500}
                  height={192}
                  className="w-full h-48 object-cover"
                />
                {mentor.isTopRated && (
                  <div className="absolute top-2 left-2 bg-white bg-opacity-85 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded shadow-sm text-gray-800">
                    Top Rated
                  </div>
                )}
                {mentor.isAvailableASAP && (
                  <div 
                    className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded text-white"
                    style={{ background: 'linear-gradient(90deg, #24242E 0%, #747494 100%)' }}
                  >
                    Available ASAP
                  </div>
                )}
                {mentor.providesCoaching && (
                  <div className="absolute bottom-2 left-2 bg-gradient-to-r from-[#F0EEB4] to-[#DBA508] text-xs font-bold px-2 py-1 rounded text-gray-800">
                    Coaching
                  </div>
                )}
              </div>
              
              {/* Mentor Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{mentor.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{mentor.role} at {mentor.company}</p>
                <p className="text-xs text-gray-500 mb-3">{mentor.location}</p>
                
                {/* Mentor Stats */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="font-medium text-gray-800 mr-1">{mentor.sessions}</span>
                    <span>Sessions</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="font-medium text-gray-800 mr-1">{mentor.reviews}</span>
                    <span>Reviews</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="font-medium text-gray-800 mr-1">{mentor.experience}</span>
                    <span>Years</span>
                  </div>
                </div>
                
                {/* Categories */}
                {mentor.categories && mentor.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {mentor.categories.slice(0, 3).map((category, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {category}
                      </span>
                    ))}
                    {mentor.categories.length > 3 && (
                      <span className="text-xs text-gray-600">+{mentor.categories.length - 3} more</span>
                    )}
                  </div>
                )}
                
                {/* Action Button */}
                <button 
                  className="w-full text-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition duration-200 text-sm mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectMentor(mentor.id);
                  }}
                >
                  View Profile
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 text-lg">No mentors found matching your search criteria.</p>
            {(searchTerm || activeParentSkill || activeChildSkill || showOnlyAvailableASAP || showOnlyCoaching) && (
              <button 
                className="mt-2 text-blue-500 hover:underline"
                onClick={clearAllFilters}
                title="Clear all filters"
                aria-label="Clear all search filters"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MentorExplore;