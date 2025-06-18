// Types for Dashboard components
export interface Mentor {
  id: string;
  name: string;
  location: string;
  role: string;
  company: string;
  sessions: number;
  reviews: number;
  experience: number;
  attendance: number;
  isAvailableASAP: boolean;
  providesCoaching: boolean;
  imageUrl: string;
  isTopRated: boolean;
  categories?: string[];
  uniqueId?: string; // Added uniqueId for distinguishing mentors in lists
  email?: string;  // Add email field for mentor contact
  bio?: string; // Add bio field stored in mentors table
}

export interface NavItemProps {
  icon: 'home' | 'compass' | 'community' | 'calendar' | 'chat' | 'achievement';
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export interface CategoryButtonProps {
  label: string;
  active?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  textSize?: string;
  padding?: string;
}

export interface MentorCardProps {
  mentor: Mentor;
}

export interface ZoomMeetingInfo {
  meetingId: string;
  meetingUrl: string;
  password: string;
  startTime: string;
}

export interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  imageUrl: string;
  unread: number;
}

export interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversations {
  [key: number]: {
    messages: ChatMessage[];
  };
}