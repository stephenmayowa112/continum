"use client"
import React from 'react';
import { FiHome, FiCompass, FiUsers, FiCalendar, FiMessageCircle, FiAward } from 'react-icons/fi';
import { NavItemProps, CategoryButtonProps } from './types';

export const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => {
  const getIcon = () => {
    switch (icon) {
      case 'home':
        return <FiHome className={`mr-2 ${active ? 'text-blue-600' : 'text-gray-600'}`} size={20} />;
      case 'compass':
        return <FiCompass className={`mr-2 ${active ? 'text-blue-600' : 'text-gray-600'}`} size={20} />;
      case 'community':
        return <FiUsers className={`mr-2 ${active ? 'text-blue-600' : 'text-gray-600'}`} size={20} />;
      case 'calendar':
        return <FiCalendar className={`mr-2 ${active ? 'text-blue-600' : 'text-gray-600'}`} size={20} />;
      case 'chat':
        return <FiMessageCircle className={`mr-2 ${active ? 'text-blue-600' : 'text-gray-600'}`} size={20} />;
      case 'achievement':
        return <FiAward className={`mr-2 ${active ? 'text-blue-600' : 'text-gray-600'}`} size={20} />;
      default:
        return <FiHome className={`mr-2 ${active ? 'text-blue-600' : 'text-gray-600'}`} size={20} />;
    }
  };

  return (
    <div 
      className={`flex items-center px-6 pt-8 pb-2 rounded-lg cursor-pointer ${active ? 'bg-blue-100' : ''}`}
      onClick={onClick}
    >
      {getIcon()}
      <span className={`font-medium ${active ? 'text-gray-800' : 'text-gray-600'}`}>{label}</span>
    </div>
  );
};

export const CategoryButton: React.FC<CategoryButtonProps> = ({ 
  label, 
  active, 
  onClick, 
  textSize, 
  padding 
}) => {
  return (
    <button
      onClick={onClick}
      className={`${padding || 'px-2 py-1'} rounded-md ${textSize ? textSize : 'text-xs'} font-normal whitespace-nowrap ${
        active ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
};