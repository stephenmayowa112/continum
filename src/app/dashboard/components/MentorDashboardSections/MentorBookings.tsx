"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { BsLinkedin, BsGlobe } from 'react-icons/bs';
import { Mentor } from '../common/types';
import dynamic from 'next/dynamic';

// Dynamically load Agora meeting component on client only
const AgoraMeeting = dynamic(() => import('../../../../components/AgoraMeeting'), { ssr: false });
import axios from 'axios';

interface MentorBookingsProps {
  mentors: Mentor[];
  selectedMentorId: string | null;
  setSelectedMentorId: React.Dispatch<React.SetStateAction<string | null>>;
  user: Record<string, unknown>; // Replacing 'any' with a more specific type
}

const MentorBookings: React.FC<MentorBookingsProps> = ({ 
  mentors, 
  selectedMentorId, 
  setSelectedMentorId,
  user 
}) => {
  // State for booking functionality
  const [selectedDate, setSelectedDate] = useState<string>('18 Jan');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<'Mentorship' | 'Coaching'>('Mentorship');
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [showMeetingRoom, setShowMeetingRoom] = useState(false);
  const [meetingId, setMeetingId] = useState<string>('');
  const [meetingToken, setMeetingToken] = useState<string>('');
  const [appId, setAppId] = useState<string>('');

  // Get the selected mentor
  const selectedMentor = selectedMentorId
    ? mentors.find(mentor => mentor.id === selectedMentorId) || mentors[0]
    : mentors[0];

  // Sample dates and time slots
  const availableDates = [
    { day: 'Mon', date: '18 Jan', slots: 12 },
    { day: 'Wed', date: '20 Jan', slots: 8 },
    { day: 'Fri', date: '22 Jan', slots: 10 },
    { day: 'Mon', date: '25 Jan', slots: 12 },
    { day: 'Wed', date: '27 Jan', slots: 6 },
  ];

  const timeSlots = ['6:00pm', '8:00pm', '9:00pm', '10:00pm'];

  // Function to handle booking a session
  const handleBookSession = async () => {
    if (!selectedMentor || !selectedTime || !user) {
      setBookingError('Please select a time slot or log in to book a session');
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      // Call the API to create a Zoom meeting and save the booking
      const response = await axios.post('/api/bookings', {
        mentorId: selectedMentor.id,
        mentorName: selectedMentor.name,
        mentorEmail: `${selectedMentor.name.toLowerCase().replace(/\s+/g, '.')}@example.com`, // Placeholder email
        userId: user.id,
        userEmail: user.email,
        date: selectedDate,
        time: selectedTime,
        sessionType: sessionType
      });      // On success, set the Agora meeting info and show inline meeting
      const meeting = response.data.meeting;
      setMeetingId(meeting.channel || meeting.meetingId);
      setMeetingToken(meeting.token);
      setAppId(meeting.appId);
      setBookingSuccess(true);
      setShowMeetingRoom(true);
    } catch (error: unknown) {
      console.error('Booking error:', error);
      const errorResponse = error as { response?: { data?: { error?: string } } };
      setBookingError(errorResponse.response?.data?.error || 'Failed to book session. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Main Booking Content - Left Column */}
      <div className="flex-1">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="relative h-48">
            {/* Banner Image */}
            <Image
              src="/images/banner.png"
              alt="Mentor Banner"
              width={1200}
              height={400}
              className="w-full h-48 object-cover object-center"
              priority
              quality={100}
            />
            
            {/* Mentor Profile Picture */}
            <div className="absolute -bottom-12 left-6 border-4 border-white rounded-full shadow-md">
              <Image
                src={selectedMentor?.imageUrl || "/images/mentor_pic.png"}
                alt={selectedMentor?.name || "Mentor Profile"}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
          </div>
          <div className="p-6 pt-16">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">{selectedMentor?.name || "Mentor Name"}</h2>
                <p className="text-gray-600">{selectedMentor?.role || "Role"} at {selectedMentor?.company || "Company"}</p>
              </div>
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  className="text-blue-600 hover:text-blue-800"
                  title="LinkedIn Profile"
                  aria-label="View LinkedIn Profile"
                >
                  <BsLinkedin size={24} />
                </a>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-gray-800"
                  title="Personal Website"
                  aria-label="Visit Personal Website"
                >
                  <BsGlobe size={24} />
                </a>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mt-6">
              <button
                className="pb-2 px-4 -mb-px border-b-2 border-blue-500 text-blue-600"
                aria-label="Overview tab"
                title="Overview tab"
              >
                Overview
              </button>
              <button
                className="pb-2 px-4 -mb-px text-gray-600 hover:text-gray-800"
                aria-label="Reviews tab"
                title="Reviews tab"
              >
                Reviews
              </button>
              <button
                className="pb-2 px-4 -mb-px text-gray-600 hover:text-gray-800"
                aria-label="Group Mentorship tab"
                title="Group Mentorship tab"
              >
                Group Mentorship
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="py-4">
              <p className="text-gray-700">
                {selectedMentor?.name || "The mentor"} is a highly experienced {selectedMentor?.role || "professional"} with {selectedMentor?.experience || "several"}+ years of experience at {selectedMentor?.company || "their company"}. 
                They specialize in their field and provide valuable insights to mentees.
              </p>
            </div>
          </div>
        </div>
        
        {/* Booking Calendar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Sessions</h3>
          <p className="text-gray-600 mb-6">Book 1:1 sessions from the options based on your needs</p>
          
          {/* Session Type Toggle */}
          <div className="flex space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded-lg border ${
                sessionType === 'Mentorship' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSessionType('Mentorship')}
            >
              Mentorship session
            </button>
            <button
              className={`px-4 py-2 rounded-lg border ${
                sessionType === 'Coaching' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSessionType('Coaching')}
              disabled={!selectedMentor?.providesCoaching}
            >
              Coaching session
            </button>
          </div>
          
          {/* Calendar Dates */}
          <div className="relative mb-6">
            <div className="flex items-center">
              <button 
                className="absolute left-0 bg-white p-2 rounded-full shadow-md z-10"
                title="Previous dates"
                aria-label="View previous dates"
              >
                <FiArrowLeft className="text-gray-600" />
              </button>
              <div className="flex-1 overflow-x-auto py-2 px-8">
                <div className="flex space-x-4">
                  {availableDates.map((date, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 text-center p-3 rounded-lg cursor-pointer ${
                        selectedDate === date.date ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedDate(date.date)}
                    >
                      <p className="text-gray-500 text-sm font-medium">{date.day}</p>
                      <p className="text-gray-800 font-semibold">{date.date}</p>
                      <p className="text-xs text-gray-500 mt-1">{date.slots} slots</p>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                className="absolute right-0 bg-white p-2 rounded-full shadow-md z-10"
                title="Next dates"
                aria-label="View next dates"
              >
                <FiArrowRight className="text-gray-600" />
              </button>
            </div>
            <div className="text-right mt-2">
              <a 
                href="#" 
                className="text-blue-600 text-sm flex items-center justify-end hover:underline"
                title="View all available dates"
                aria-label="View all available dates"
              >
                View all <FiArrowRight className="ml-1" size={14} />
              </a>
            </div>
          </div>
          
          {/* Time Slots */}
          <div className="mb-6">
            <h4 className="text-gray-800 font-medium mb-4">Available time slots</h4>
            <div className="flex flex-wrap gap-3">
              {timeSlots.map((time, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 border rounded-lg ${
                    selectedTime === time ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
          
          {/* Book Button */}
          <button
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
              selectedTime ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={handleBookSession}
            disabled={!selectedTime || isBooking}
          >
            {isBooking ? 'Booking...' : `Book session for ${selectedDate}, 2025`}
          </button>
          
          {/* Booking Error */}
          {bookingError && (
            <div className="mt-4 text-red-500 text-sm">{bookingError}</div>
          )}          {/* Booking Success and Inline AgoraMeeting */}
          {bookingSuccess && showMeetingRoom && (
            <AgoraMeeting 
              channel={meetingId}
              token={meetingToken}
              appId={appId}
              userName={user.email as string} 
            />
          )}
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="w-full md:w-80 space-y-6">
        {/* Mentor Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mentor Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Mentoring time</span>
              <span className="font-medium">{selectedMentor?.sessions || 0}+ hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Attendance</span>
              <span className="font-medium">{selectedMentor?.attendance || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sessions completed</span>
              <span className="font-medium">{selectedMentor?.sessions || 0}</span>
            </div>
          </div>
          
          <h4 className="text-md font-medium text-gray-800 mt-6 mb-3">Top areas of impact</h4>
          <div className="flex flex-wrap gap-2">
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              {selectedMentor?.role || "Professional Skills"}
            </span>
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              Career Development
            </span>
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              Portfolio Review
            </span>
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              Industry Insights
            </span>
          </div>
        </div>
        
        {/* Achievements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Achievements</h3>
          <div className="space-y-4">
            <div className="border-l-2 border-blue-500 pl-3">
              <h4 className="font-medium text-gray-800">{selectedMentor?.sessions || 0}+ hours of mentoring</h4>
              <p className="text-sm text-gray-600">Dedicated over {selectedMentor?.sessions || 0} hours to helping others grow</p>
            </div>
            <div className="border-l-2 border-blue-500 pl-3">
              <h4 className="font-medium text-gray-800">{selectedMentor?.reviews || 0}+ satisfied mentees</h4>
              <p className="text-sm text-gray-600">Consistently high ratings from mentees</p>
            </div>
          </div>
        </div>
        
        {/* More Mentors */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">More mentors for you</h3>
          <div className="space-y-4">
            {mentors.filter(m => m.id !== selectedMentor?.id).slice(0, 3).map((mentor, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedMentorId(mentor.id)}
              >
                <Image
                  src={mentor.imageUrl}
                  alt={mentor.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-800">{mentor.name}</h4>
                  <p className="text-xs text-gray-600">{mentor.role} at {mentor.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorBookings;