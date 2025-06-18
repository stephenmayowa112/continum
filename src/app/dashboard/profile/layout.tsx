"use client";
import React from 'react';
import ProfileLayout from './components/ProfileLayout';

export default function ProfileLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProfileLayout>
      {children}
    </ProfileLayout>
  );
}