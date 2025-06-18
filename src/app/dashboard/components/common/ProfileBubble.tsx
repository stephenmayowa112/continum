import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import { UserRole } from '../../../../lib/user';

interface ProfileBubbleProps {
  user: Record<string, unknown>;
  userRole: UserRole | null;
}

const ProfileBubble: React.FC<ProfileBubbleProps> = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  
  // Get user profile image or use default
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const userName = (user?.name as string) || 'User';
  
  // Effect to determine the best image source when user object changes
  useEffect(() => {
    const possibleImageProperties = [
      'image',
      'profile_image_url',
      'avatar_url',
      'photo_url',
      'picture',
      'profilePicture',
      'imageUrl'
    ];
    
    // Try to find a valid image URL from user object
    for (const prop of possibleImageProperties) {
      if (user && typeof user[prop] === 'string' && (user[prop] as string).length > 0) {
        setImgSrc(user[prop] as string);
        return;
      }
    }
    
    // If no valid image is found, use default
    setImgSrc('/images/mentor_pic.png');
  }, [user]);

  const handleImgError = () => {
    if (imgSrc !== '/images/mentor_pic.png') {
      setImgSrc('/images/mentor_pic.png');
    }
  };
  
  // Handle logout functionality
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };
  
  // Toggle menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(prevState => !prevState);
  };
  
  // Handle menu item clicks
  const handleMenuItemClick = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Profile Bubble */}
      <div className="relative">
        {/* Profile Image */}
        <div 
          className="w-14 h-14 rounded-full border-2 border-indigo-600 overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center bg-white"
          onClick={toggleMenu}
        >
          {imgSrc ? (
            <Image 
              src={imgSrc}
              alt={`${userName}'s profile`}
              width={56}
              height={56}
              className="w-full h-full object-cover"
              onError={handleImgError}
              priority
            />
          ) : (
            <span className="text-xl font-bold text-indigo-700">{userName.charAt(0)}</span>
          )}
        </div>
        
        {/* Menu Popup */}
        {isMenuOpen && (
          <div className="absolute bottom-16 left-0 bg-white rounded-lg shadow-xl py-2 w-48 animate-fade-in border border-gray-100">
            {/* Menu items */}
            <div className="py-1">
              <button 
                onClick={() => handleMenuItemClick('/dashboard/profile/general')}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 w-full text-left flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Edit Profile
              </button>
              <button 
                onClick={() => handleMenuItemClick('/dashboard/calendar')}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 w-full text-left flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Connect your calendar
              </button>
              <button 
                onClick={() => handleMenuItemClick('/about')}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 w-full text-left flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About Us
              </button>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-left flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileBubble;