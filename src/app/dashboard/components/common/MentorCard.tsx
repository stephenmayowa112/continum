"use client"
import React from 'react';
import Image from 'next/image';
import { MentorCardProps } from './types';

export const MentorCard: React.FC<MentorCardProps> = ({ mentor }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
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
          <div className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded text-gray-800">
            Top Rated
          </div>
        )}
        {mentor.isAvailableASAP && (
          <div className="absolute top-2 right-2 bg-green-500 text-xs font-bold px-2 py-1 rounded text-white">
            Available ASAP
          </div>
        )}
      </div>
      
      {/* Mentor Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1">{mentor.name}</h3>
        <p className="text-sm text-gray-600 mb-1">{mentor.role} at {mentor.company}</p>
        <p className="text-xs text-gray-500 mb-3">{mentor.location}</p>
        {mentor.bio && <p className="text-sm text-gray-600 mb-3">{mentor.bio}</p>}
        
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
          aria-label={`View ${mentor.name}'s profile`}
          title={`View ${mentor.name}'s profile`}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};