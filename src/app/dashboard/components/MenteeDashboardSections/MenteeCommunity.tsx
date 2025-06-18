"use client"
import React from 'react';
import Image from 'next/image';

const MenteeCommunity: React.FC = () => {
  const communityEvents = [
    {
      id: 1,
      title: "3D Animation Workshop",
      date: "May 10, 2025",
      time: "2:00 PM - 4:00 PM",
      host: "Chris Lee",
      attendees: 24,
      imageUrl: "/images/Community_image.jpg",
      category: "Workshop",
    },
    {
      id: 2,
      title: "Character Rigging Q&A Session",
      date: "May 15, 2025",
      time: "3:00 PM - 4:30 PM",
      host: "David Johnson",
      attendees: 18,
      imageUrl: "/images/3D.png",
      category: "Q&A",
    },
    {
      id: 3,
      title: "Career Paths in Animation",
      date: "May 22, 2025",
      time: "5:00 PM - 6:30 PM",
      host: "Sarah Williams",
      attendees: 35,
      imageUrl: "/images/3Di.png",
      category: "Webinar",
    }
  ];

  const discussionTopics = [
    {
      id: 1,
      title: "Best software for beginners?",
      author: "Alex Chen",
      replies: 24,
      views: 156,
      lastActivity: "2 hours ago",
      tags: ["Software", "Beginners"]
    },
    {
      id: 2,
      title: "Portfolio review thread - May 2025",
      author: "Moderator",
      replies: 42,
      views: 310,
      lastActivity: "6 hours ago",
      tags: ["Portfolio", "Feedback"]
    },
    {
      id: 3,
      title: "Animation principles discussion",
      author: "Jordan Smith",
      replies: 18,
      views: 95,
      lastActivity: "1 day ago",
      tags: ["Animation", "Principles"]
    },
    {
      id: 4,
      title: "Studio hiring thread - 2025",
      author: "Moderator",
      replies: 56,
      views: 420,
      lastActivity: "2 days ago",
      tags: ["Jobs", "Opportunities"]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Community Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Community
        </h1>
        <p className="mt-2 text-gray-600">
          Connect with fellow mentees and industry professionals, join events, and participate in discussions.
        </p>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Community Events</h2>
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
            View All Events
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityEvents.map(event => (
              <div key={event.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 overflow-hidden relative">
                  <Image 
                    src={event.imageUrl} 
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    priority={event.id === 1}
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <span className="px-2 py-1 bg-indigo-100 text-xs rounded-full text-indigo-800 font-medium">
                      {event.category}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {event.date}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Time:</span> {event.time}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Host:</span> {event.host}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Attendees:</span> {event.attendees}
                    </p>
                  </div>
                  <button className="w-full py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded hover:bg-indigo-100 transition-colors">
                    Join Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Discussion Board */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Discussion Board</h2>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-gray-100 text-gray-800 text-sm rounded-lg hover:bg-gray-200 transition-colors">
              My Topics
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
              New Topic
            </button>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Replies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {discussionTopics.map(topic => (
                <tr key={topic.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">{topic.title}</div>
                      <div className="flex flex-wrap gap-1">
                        {topic.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {topic.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {topic.replies}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {topic.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {topic.lastActivity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
          <button className="text-indigo-600 font-medium text-sm hover:text-indigo-800">
            View All Topics
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenteeCommunity;