"use client";

import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: We don't include the Footer component here to remove it from the dashboard
  return (
      <div className="pt-12 pb-12 bg-white"> {/* Added white background */}
        {children}
      </div>
  );
}