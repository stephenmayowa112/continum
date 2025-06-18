"use client"
import React from 'react';
import Image from 'next/image';
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark } from 'react-icons/fi';

const MentorCommunity: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Main Content Area - Left Column */}
      <div className="flex-1">
        {/* Top Bar with Question Input */}
        <div className="flex items-center mb-6">
          <input
            type="text"
            placeholder="Got any questions? Feel free to ask!"
            className="flex-grow px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            className="ml-4 px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 hover:opacity-90"
            style={{ background: 'linear-gradient(90.15deg, #24242E 0.13%, #747494 99.87%)' }}
          >
            Ask question
          </button>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium" aria-label="Filter by Career" title="Filter by Career">
              Career
            </button>
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" aria-label="Filter by Mental Health" title="Filter by Mental Health">
              Mental Health
            </button>
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" aria-label="Filter by Leadership" title="Filter by Leadership">
              Leadership
            </button>
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" aria-label="Filter by Animation" title="Filter by Animation">
              Animation
            </button>
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" aria-label="Filter by 3D Design" title="Filter by 3D Design">
              3D Design
            </button>
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" aria-label="Filter by Industry Insights" title="Filter by Industry Insights">
              Industry Insights
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Trending</h3>
          
          {/* Discussion Thread Cards */}
          <div className="space-y-6">
            {/* Thread Card 1 */}
            <div className="border border-black rounded-lg p-5 hover:shadow-md transition-shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                How should I level up my career as a visual designer to an interaction designer, where should I start?
              </h4>
              <div className="flex items-center mb-3">
                <div className="flex -space-x-2">
                  <Image
                    src="/images/woman3.jpg"
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white w-8 h-8 object-cover"
                  />
                  <Image
                    src="/images/man2.jpg"
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white w-8 h-8 object-cover"
                  />
                  <Image
                    src="/images/woman1.jpg"
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white w-8 h-8 object-cover"
                  />
                </div>
                <button className="ml-4 text-blue-600 text-sm hover:underline">
                  View Thread
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Transitioning from a visual designer to an interaction designer is a natural progression that can enhance your career. Here are some steps to help you make this transition: 1. Understand the role: Familiarize yourself with the responsibilities of an interaction designer, which...
              </p>
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <button className="text-gray-500 hover:text-blue-600 flex items-center" aria-label="Like post" title="Like post">
                    <FiHeart className="mr-1" size={18} />
                    <span className="text-xs">24</span>
                  </button>
                  <button className="text-gray-500 hover:text-blue-600 flex items-center" aria-label="View comments" title="View comments">
                    <FiMessageCircle className="mr-1" size={18} />
                    <span className="text-xs">8</span>
                  </button>
                  <button className="text-gray-500 hover:text-blue-600 flex items-center" aria-label="Share post" title="Share post">
                    <FiShare2 className="mr-1" size={18} />
                  </button>
                  <button className="text-gray-500 hover:text-blue-600 flex items-center" aria-label="Bookmark post" title="Bookmark post">
                    <FiBookmark className="mr-1" size={18} />
                  </button>
                </div>
                <span className="text-gray-400 text-xs">1 week ago</span>
              </div>
            </div>

            {/* Thread Card 2 */}
            <div className="border border-black rounded-lg p-5 hover:shadow-md transition-shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                What&apos;s the best way to showcase my animation portfolio to attract industry attention?
              </h4>
              <div className="flex items-center mb-3">
                <div className="flex -space-x-2">
                  <Image
                    src="/images/man1.jpg"
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white w-8 h-8 object-cover"
                  />
                  <Image
                    src="/images/woman2.jpg"
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white w-8 h-8 object-cover"
                  />
                  <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                    +5
                  </div>
                </div>
                <button className="ml-4 text-blue-600 text-sm hover:underline">
                  View Thread
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Creating a standout animation portfolio is essential in this competitive industry. Focus on quality over quantity, highlight your best 3-5 pieces that demonstrate your technical skills and creative vision. Include breakdown reels that show your process from...
              </p>
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <button className="text-gray-500 hover:text-blue-600 flex items-center" aria-label="Like post" title="Like post">
                    <FiHeart className="mr-1" size={18} />
                    <span className="text-xs">42</span>
                  </button>
                  <button className="text-gray-500 hover:text-blue-600 flex items-center" aria-label="View comments" title="View comments">
                    <FiMessageCircle className="mr-1" size={18} />
                    <span className="text-xs">15</span>
                  </button>
                  <button className="text-gray-500 hover:text-blue-600 flex items-center" aria-label="Share post" title="Share post">
                    <FiShare2 className="mr-1" size={18} />
                  </button>
                  <button className="text-gray-500 hover:text-blue-600 flex items-center" aria-label="Bookmark post" title="Bookmark post">
                    <FiBookmark className="mr-1" size={18} />
                  </button>
                </div>
                <span className="text-gray-400 text-xs">2 days ago</span>
              </div>
            </div>

            {/* Thread Card 3 */}
            <div className="border border-black rounded-lg p-5 hover:shadow-md transition-shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                How to balance full-time work with continuous learning and skill development?
              </h4>
              <div className="flex items-center mb-3">
                <div className="flex -space-x-2">
                  <Image
                    src="/images/woman4.jpg"
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white w-8 h-8 object-cover"
                  />
                  <Image
                    src="/images/man3.jpg"
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white w-8 h-8 object-cover"
                  />
                </div>
                <button className="ml-4 text-blue-600 text-sm hover:underline">
                  View Thread
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Finding balance is one of the biggest challenges for professionals in creative fields. Start by setting realistic goals and creating a sustainable schedule. Consider the 80/20 rule - identify the 20% of skills that will give you 80% of the impact in your career...
              </p>
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <button className="text-gray-500 hover:text-blue-600 flex items-center" aria-label="Like post" title="Like post">
                    <FiHeart className="mr-1" size={18} />
                    <span className="text-xs">31</span>
                  </button>
                  <button className="text-gray-500 hover:text-blue-600 flex items-center" aria-label="View comments" title="View comments">
                    <FiMessageCircle className="mr-1" size={18} />
                    <span className="text-xs">12</span>
                  </button>
                  <button className="text-gray-500 hover:text-blue-600 flex items-center" aria-label="Share post" title="Share post">
                    <FiShare2 className="mr-1" size={18} />
                  </button>
                  <button className="text-gray-500 hover:text-blue-600 flex items-center" aria-label="Bookmark post" title="Bookmark post">
                    <FiBookmark className="mr-1" size={18} />
                  </button>
                </div>
                <span className="text-gray-400 text-xs">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar - Right Column */}
      <div className="w-full md:w-80 space-y-6">
        {/* Suggested Questions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Suggested for you</h3>
          <div className="space-y-4">
            <div className="border-l-2 border-blue-500 pl-3 py-1">
              <h4 className="font-medium text-gray-800 text-sm">How can I get into the animation industry?</h4>
              <div className="flex mt-2 space-x-2">
                <button 
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  aria-label="View thread about animation industry"
                  title="View thread about animation industry"
                >
                  View Thread
                </button>
                <button 
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  aria-label="Comment on animation industry thread"
                  title="Comment on animation industry thread"
                >
                  Comment
                </button>
              </div>
            </div>
            
            <div className="border-l-2 border-blue-500 pl-3 py-1">
              <h4 className="font-medium text-gray-800 text-sm">What skills are most valuable for an aspiring 3D character artist?</h4>
              <div className="flex mt-2 space-x-2">
                <button 
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  aria-label="View thread about 3D character artist skills"
                  title="View thread about 3D character artist skills"
                >
                  View Thread
                </button>
                <button 
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  aria-label="Comment on 3D character artist skills thread"
                  title="Comment on 3D character artist skills thread"
                >
                  Comment
                </button>
              </div>
            </div>
            
            <div className="border-l-2 border-blue-500 pl-3 py-1">
              <h4 className="font-medium text-gray-800 text-sm">How do you handle creative burnout as a professional animator?</h4>
              <div className="flex mt-2 space-x-2">
                <button 
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  aria-label="View thread about creative burnout"
                  title="View thread about creative burnout"
                >
                  View Thread
                </button>
                <button 
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  aria-label="Comment on creative burnout thread"
                  title="Comment on creative burnout thread"
                >
                  Comment
                </button>
              </div>
            </div>
            
            <div className="border-l-2 border-blue-500 pl-3 py-1">
              <h4 className="font-medium text-gray-800 text-sm">Which studios provide the best mentorship for junior artists?</h4>
              <div className="flex mt-2 space-x-2">
                <button 
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  aria-label="View thread about studio mentorship"
                  title="View thread about studio mentorship"
                >
                  View Thread
                </button>
                <button 
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                  aria-label="Comment on studio mentorship thread"
                  title="Comment on studio mentorship thread"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Top Contributors Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top contributors</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                src="/images/chris_lee_mentor.png"
                alt="Contributor"
                width={40}
                height={40}
                className="rounded-full object-cover w-10 h-10"
              />
              <div className="ml-3">
                <h4 className="font-medium text-gray-800 text-sm">Chris Lee</h4>
                <p className="text-xs text-gray-600">Character Animator at Pixar</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Image
                src="/images/woman1.jpg"
                alt="Contributor"
                width={40}
                height={40}
                className="rounded-full object-cover w-10 h-10"
              />
              <div className="ml-3">
                <h4 className="font-medium text-gray-800 text-sm">Jane Smith</h4>
                <p className="text-xs text-gray-600">Lead Motion Designer at Sony</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Image
                src="/images/man2.jpg"
                alt="Contributor"
                width={40}
                height={40}
                className="rounded-full object-cover w-10 h-10"
              />
              <div className="ml-3">
                <h4 className="font-medium text-gray-800 text-sm">Robert Chen</h4>
                <p className="text-xs text-gray-600">VFX Supervisor at ILM</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Image
                src="/images/woman3.jpg"
                alt="Contributor"
                width={40}
                height={40}
                className="rounded-full object-cover w-10 h-10"
              />
              <div className="ml-3">
                <h4 className="font-medium text-gray-800 text-sm">Anya Petrova</h4>
                <p className="text-xs text-gray-600">3D Artist at DreamWorks</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Image
                src="/images/man1.jpg"
                alt="Contributor"
                width={40}
                height={40}
                className="rounded-full object-cover w-10 h-10"
              />
              <div className="ml-3">
                <h4 className="font-medium text-gray-800 text-sm">Michael Johnson</h4>
                <p className="text-xs text-gray-600">Art Director at Disney</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Community Image */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <Image
            src="/images/Community_image.jpg"
            alt="Community"
            width={320}
            height={200}
            className="w-full h-auto object-cover"
          />
          <div className="p-4">
            <h4 className="font-medium text-gray-900">Join our weekly discussions</h4>
            <p className="text-sm text-gray-600 mt-1">Every Friday at 3 PM EST, our community hosts live Q&A sessions with industry experts.</p>
            <button 
              className="mt-3 w-full py-2 text-white font-medium rounded-lg transition-all duration-200 hover:opacity-90 text-sm"
              style={{ background: 'linear-gradient(90.15deg, #24242E 0.13%, #747494 99.87%)' }}
            >
              Register for next session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorCommunity;