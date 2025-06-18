"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Mentor } from '../common/types';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import { supabase } from '../../../../lib/supabaseClient';

// Availability slot from mentor profile
interface AvailabilitySlot {
  id: string;
  start_time: string;
  end_time: string;
  status?: string; // Making the status field explicit
  mentor_id?: string;
}

interface TimeSlot {
  time: string;
  formattedTime: string;
  uniqueKey: string;
  availabilityId: string;
}

interface MenteeBookingsProps {
  mentors: Mentor[];
  selectedMentorId: string | null;
  setSelectedMentorId: React.Dispatch<React.SetStateAction<string | null>>;
  user: Record<string, unknown>;
}

const MenteeBookings: React.FC<MenteeBookingsProps> = ({
  mentors,
  selectedMentorId,
  setSelectedMentorId,
  user
}) => {
  // Helper to load available periods from API
  const loadAvailability = useCallback(async () => {
    if (!selectedMentorId) return;
    try {
      const res = await fetch(`/api/mentors/${selectedMentorId}/availability`);
      const data = await res.json();
      const validSlots = Array.isArray(data)
        ? data.filter(slot => slot.status?.trim().toLowerCase() !== 'booked')
        : [];
      setAvailabilitySlots(validSlots);
    } catch (err) {
      console.error('Error loading availability:', err);
    }
  }, [selectedMentorId]);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDateObj, setSelectedDateObj] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>(''); // availability slot ID
  // Fixed video call sessions, 30-minute duration
  const sessionDuration = 30;
  const [agenda, setAgenda] = useState<string>('');
  // Adjusted bookingStep type, removed 'confirmation' as we redirect
  const [bookingStep, setBookingStep] = useState<'select-mentor' | 'select-time' | 'session-details'>('select-mentor');
  const [isBooking, setIsBooking] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);

  const selectedMentor = selectedMentorId ? mentors.find(m => m.id === selectedMentorId) : null;

  // Reset form when mentor changes and reload availability
  useEffect(() => {
    setSelectedDate('');
    setSelectedDateObj(null);
    setSelectedTimeSlot('');
    setAgenda('');
    setBookingStep('select-mentor');
    loadAvailability();
  }, [selectedMentorId, loadAvailability]);

  // Load mentor availability when selected and subscribe to real-time changes
  useEffect(() => {
    let channel: any;
    if (selectedMentorId) {
      // Initial fetch via helper
      loadAvailability();

      // Subscribe to real-time changes for this mentor's availability
      channel = supabase
        .channel(`availability_${selectedMentorId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'availability', filter: `mentor_id=eq.${selectedMentorId}` }, payload => {
          const newSlot = (payload as any).record as AvailabilitySlot;
          setAvailabilitySlots(prev => [...prev, newSlot]);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'availability', filter: `mentor_id=eq.${selectedMentorId}` }, payload => {
          const oldSlot = (payload as any).record as AvailabilitySlot;
          setAvailabilitySlots(prev => prev.filter(s => s.id !== oldSlot.id));
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'availability', filter: `mentor_id=eq.${selectedMentorId}` }, payload => {
          const updatedSlot = (payload as any).record as AvailabilitySlot;
          setAvailabilitySlots(prev => prev.map(s => s.id === updatedSlot.id ? updatedSlot : s));
        })
        .subscribe();
    } else {
      setAvailabilitySlots([]);
    }
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [selectedMentorId, loadAvailability]);

  // Compute available dates from availability slots with local date strings
  const now = new Date();
  const futureSlots = availabilitySlots.filter(s => new Date(s.end_time) > now);
  // Extract local YYYY-MM-DD to avoid timezone offsets
  const uniqueDates = Array.from(new Set(futureSlots.map(s => {
    const d = new Date(s.start_time);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })));
  const availableDates = uniqueDates.sort().map(dateKey => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return { date: dateKey, formattedDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) };
  });

  // Compute time slots for selected date
  const timeSlots: TimeSlot[] = selectedDate
    ? availabilitySlots
        .filter(s => {
          const d = new Date(s.start_time);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}` === selectedDate;
        })
        .flatMap((slot, slotIndex) => {
          const slots: TimeSlot[] = [];
          const start = new Date(slot.start_time);
          const end = new Date(slot.end_time);
          const interval = sessionDuration;
          const cursor = new Date(start);
          let timeIndex = 0;
          
          while (cursor.getTime() + interval * 60000 <= end.getTime()) {
            const hh = cursor.getHours().toString().padStart(2,'0');
            const mm = cursor.getMinutes().toString().padStart(2,'0');
            const time = `${hh}:${mm}`;
            const formattedTime = cursor.toLocaleTimeString(undefined, {hour:'numeric', minute:'2-digit'});
            const uniqueKey = `${slot.id}-${slotIndex}-${timeIndex}-${time}`;
            slots.push({ time, formattedTime, uniqueKey, availabilityId: slot.id });
            cursor.setMinutes(cursor.getMinutes() + interval);
            timeIndex++;
          }
          return slots;
        })
    : [];

  const handleBookSession = async () => {
    if (!selectedMentor || !user.id || !selectedDate || !selectedTimeSlot) return;
    setIsBooking(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: selectedMentorId,
          userId: user.id,
          userEmail: user.email,
          date: selectedDate,
          time: selectedTimeSlot,
          // Ensure sessionType is non-empty for API validation
          sessionType: agenda.trim() || 'General Mentoring Session',
          slotId: selectedTimeSlotId,
          description: agenda.trim(),
        }),
      });
      const data = await response.json();
      if (data.success && data.meeting) {
        // Redirect to the dedicated meeting page
        toast.success('Session booked successfully! Redirecting to meeting room...');
        const { channel, token, appId } = data.meeting;
        // Open meeting in a new browser tab using absolute URL to ensure correct domain and path
        const meetingUrl = `${window.location.origin}/meeting/${channel}?token=${token}&appId=${appId}`;
        window.open(meetingUrl, '_blank');
      } else {
        toast.error(data.error || 'Failed to book session');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book session due to an unexpected error.');
    } finally {
      setIsBooking(false);
     // Refresh availability after booking
     loadAvailability();
    }
  };
  
  const renderMentorSelection = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Select a Mentor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentors.map(mentor => (
            <div
              key={mentor.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedMentorId === mentor.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'
              }`}
              onClick={() => setSelectedMentorId(mentor.id)}
            >
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4 overflow-hidden">
                  {mentor.imageUrl ? (
                    <Image
                      src={mentor.imageUrl} 
                      alt={mentor.name} 
                      className="h-full w-full object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <span className="text-indigo-600 font-medium text-lg">
                      {mentor.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{mentor.name}</h3>
                  <p className="text-xs text-gray-500">{mentor.role} at {mentor.company}</p>
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-1">
                {mentor.categories?.slice(0, 2).map((category, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600"
                  >
                    {category}
                  </span>
                ))}
                {(mentor.categories?.length || 0) > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                    +{(mentor.categories?.length || 0) - 2} more
                  </span>
                )}
              </div>
            </div>
          ))}

        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={() => selectedMentorId && setBookingStep('select-time')}
            disabled={!selectedMentorId}
            className={`px-6 py-2 rounded-lg transition-colors ${
              selectedMentorId
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };
  
  const renderTimeSelection = () => {
    // Create an array of available dates for the DatePicker
    const availableDateObjects = availableDates.map(({ date }) => new Date(date));
    
    // Function to check if a date should be enabled in the calendar
    const isDateAvailable = (date: Date) => {
      return availableDates.some(({ date: availableDate }) => 
        availableDate === date.toISOString().split('T')[0]
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setBookingStep('select-mentor')}
              className="mr-4 text-indigo-600 hover:text-indigo-800"
              aria-label="Go back to mentor selection"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Select Date & Time</h2>
          </div>
        </div>
        
        {selectedMentor && (
          <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4 overflow-hidden">
              {selectedMentor.imageUrl ? (
                <Image 
                  src={selectedMentor.imageUrl} 
                  alt={selectedMentor.name} 
                  className="h-full w-full object-cover"
                  width={48}
                  height={48}
                />
              ) : (
                <span className="text-indigo-600 font-medium text-lg">
                  {selectedMentor.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Session with {selectedMentor.name}</h3>
              <p className="text-xs text-gray-500">{selectedMentor.role} at {selectedMentor.company}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Select Date</h3>
            {availableDateObjects.length > 0 ? (
              <div className="border rounded-lg p-4">
                <DatePicker
                  selected={selectedDateObj}
                  onChange={(date: Date | null) => {
                    if (date) {
                      const formatted = date.toISOString().split('T')[0];
                      setSelectedDate(formatted);
                      setSelectedDateObj(date);
                      setSelectedTimeSlot('');
                      setSelectedTimeSlotId(''); // reset slot ID when date changes
                    } else {
                      setSelectedDate('');
                      setSelectedDateObj(null);
                      setSelectedTimeSlot('');
                      setSelectedTimeSlotId('');
                    }
                  }}
                  filterDate={isDateAvailable}
                  highlightDates={availableDateObjects}
                  minDate={new Date()}
                  inline
                  className="w-full"
                  calendarClassName="bg-white rounded-lg border-none shadow-none"
                  dayClassName={date => 
                    isDateAvailable(date) ? "react-datepicker__day--highlighted" : ""
                  }
                />
                {/* Legend for date picker highlights */}
                <div className="mt-2 text-sm flex items-center space-x-4">
                  <span className="inline-block w-3 h-3 bg-green-200 border border-green-400 rounded-full"></span>
                  <span>Available</span>
                  <span className="inline-block w-3 h-3 bg-blue-200 border border-blue-400 rounded-full ml-4"></span>
                  <span>Selected</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500 border rounded-lg bg-gray-50">
                <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="font-medium">No availability found</p>
                <p className="text-sm mt-1">This mentor hasn't added any available time slots yet.</p>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Select Time</h3>
            <div className="grid grid-cols-2 gap-2 h-[320px] overflow-y-auto pr-2 border rounded-lg p-4">
              {timeSlots.length > 0 ? (
                timeSlots.map(slot => (
                  <div
                    key={slot.uniqueKey}
                    className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-center ${
                      selectedTimeSlot === slot.time
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                    onClick={() => {
                      setSelectedTimeSlot(slot.time);
                      setSelectedTimeSlotId(slot.availabilityId); // Set the selected slot ID
                    }}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${selectedTimeSlot === slot.time ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium">{slot.formattedTime}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 col-span-2 text-center text-gray-500">
                  {selectedDate ? (
                    <>
                      <svg className="w-10 h-10 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-medium">No available times</p>
                      <p className="text-sm mt-1">Try selecting a different date</p>
                    </>
                  ) : (
                    <p>Select a date to view available time slots</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={() => (selectedDate && selectedTimeSlot && selectedTimeSlotId) && setBookingStep('session-details')}
            disabled={!selectedDate || !selectedTimeSlot || !selectedTimeSlotId}
            className={`px-6 py-2 rounded-lg transition-colors ${
              selectedDate && selectedTimeSlot && selectedTimeSlotId
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };
  
  const renderSessionDetails = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setBookingStep('select-time')}
              className="mr-4 text-indigo-600 hover:text-indigo-800"
              aria-label="Go back to time selection"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Session Details</h2>
          </div>
        </div>
        
        {selectedMentor && (
          <div className="p-4 bg-indigo-50 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4 overflow-hidden">
                {selectedMentor.imageUrl ? (
                  <Image 
                    src={selectedMentor.imageUrl} 
                    alt={selectedMentor.name} 
                    className="h-full w-full object-cover"
                    width={48}
                    height={48}
                  />
                ) : (
                  <span className="text-indigo-600 font-medium text-lg">
                    {selectedMentor.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Session with {selectedMentor.name}</h3>
                <p className="text-xs text-gray-500">{selectedMentor.role} at {selectedMentor.company}</p>
              </div>
            </div>
            <div className="text-sm text-gray-700">
              <p><span className="font-medium">Date:</span> {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
              <p><span className="font-medium">Time:</span> {selectedTimeSlot ? new Date(`1970-01-01T${selectedTimeSlot}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'} for {sessionDuration} minutes</p>
            </div>
          </div>
        )}
        
        <div>
          <label htmlFor="agenda" className="block text-sm font-medium text-gray-700 mb-1">
            What would you like to discuss? (Optional)
          </label>
          <textarea
            id="agenda"
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Career advice, project feedback, technical questions..."
          />
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setBookingStep('select-time')}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleBookSession}
            disabled={isBooking || !selectedMentor || !selectedDate || !selectedTimeSlot || !selectedTimeSlotId}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center justify-center ${
              isBooking || !selectedMentor || !selectedDate || !selectedTimeSlot || !selectedTimeSlotId
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isBooking ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Booking...
              </>
            ) : (
              'Confirm & Book Session'
            )}
          </button>
        </div>
      </div>
    );
  };
  
  // Main render of the component
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {bookingStep === 'select-mentor' && renderMentorSelection()}
      {bookingStep === 'select-time' && renderTimeSelection()}
      {bookingStep === 'session-details' && renderSessionDetails()}
    </div>
  );
};

export default MenteeBookings;