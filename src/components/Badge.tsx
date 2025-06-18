import React from 'react';
import { FiAward, FiCheck, FiStar, FiClock, FiThumbsUp, FiTrendingUp, FiCode, FiHeart } from 'react-icons/fi';

export type BadgeType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type BadgeStatus = 'locked' | 'inProgress' | 'completed';

interface BadgeProps {
  type: BadgeType;
  status: BadgeStatus;
  title: string;
  description: string;
  progress?: number; // For 'inProgress' badges
  icon?: string;
  className?: string;
}

// Map badge types to colors
const badgeColors = {
  bronze: {
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    text: 'text-amber-800',
    progressBg: 'bg-amber-500',
  },
  silver: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-700',
    progressBg: 'bg-gray-400',
  },
  gold: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
    progressBg: 'bg-yellow-500',
  },
  platinum: {
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-800',
    progressBg: 'bg-blue-500',
  },
  diamond: {
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    text: 'text-purple-800',
    progressBg: 'bg-purple-500',
  },
};

// Map icon strings to React icons
const iconMap: Record<string, React.ReactNode> = {
  award: <FiAward size={24} />,
  star: <FiStar size={24} />,
  check: <FiCheck size={24} />,
  clock: <FiClock size={24} />,
  thumbsUp: <FiThumbsUp size={24} />,
  trending: <FiTrendingUp size={24} />,
  code: <FiCode size={24} />,
  heart: <FiHeart size={24} />,
};

const Badge: React.FC<BadgeProps> = ({
  type,
  status,
  title,
  description,
  progress = 0,
  icon = 'award',
  className = '',
}) => {
  const colors = badgeColors[type];
  
  return (
    <div 
      className={`
        relative flex flex-col p-4 rounded-lg border ${colors.border} ${colors.bg}
        ${status === 'locked' ? 'opacity-50' : 'opacity-100'}
        ${className}
      `}
    >
      <div className="flex items-center mb-2">
        <div className={`p-2 rounded-full ${colors.bg} ${colors.text} mr-3`}>
          {iconMap[icon] || <FiAward size={24} />}
        </div>
        <h3 className={`font-bold ${colors.text}`}>
          {title}
        </h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      
      {status === 'completed' && (
        <div className="flex items-center mt-2 text-green-600">
          <FiCheck className="mr-1" />
          <span className="text-sm font-medium">Achieved</span>
        </div>
      )}
      
      {status === 'inProgress' && progress > 0 && (
        <div className="w-full mt-2">
          <div className="flex justify-between mb-1 text-xs">
            <span className={`${colors.text} font-medium`}>{progress}% Complete</span>
            <span className="text-gray-500">In Progress</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${colors.progressBg} h-2 rounded-full`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {status === 'locked' && (
        <div className="flex items-center mt-2 text-gray-500">
          <span className="text-sm font-medium">Locked</span>
        </div>
      )}
    </div>
  );
};

export default Badge;