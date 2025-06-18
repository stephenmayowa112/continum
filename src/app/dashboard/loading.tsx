"use client";
import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen pt-16 flex flex-col items-center justify-center p-6 space-y-6 bg-gray-50">
      {/* Header skeleton */}
      <div className="w-3/4 h-8 bg-gray-300 rounded animate-pulse" />
      {/* Quick stats skeleton */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-300 rounded animate-pulse" />
        ))}
      </div>
      {/* Featured mentors skeleton */}
      <div className="w-full max-w-4xl space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div 
            key={i} 
            className="h-24 bg-gray-300 rounded animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}