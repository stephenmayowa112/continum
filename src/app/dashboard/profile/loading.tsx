"use client";
import React from 'react';

export default function ProfileLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar skeleton */}
      <aside className="w-60 bg-white border-r p-4 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
        ))}
      </aside>
      {/* Content skeleton */}
      <section className="flex-1 p-6 pt-16 bg-gray-50">
        <div className="space-y-4 max-w-lg mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </section>
    </div>
  );
}