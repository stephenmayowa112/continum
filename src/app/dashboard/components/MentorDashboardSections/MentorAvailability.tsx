"use client"

import { useState, useEffect } from 'react';
import { getAvailability } from '../../../../../services/profileService';
import type { Mentor } from '../../../../../services/profileService';

interface MentorAvailabilityProps {
  mentor: Mentor | null;
}

interface AvailabilitySlot {
  id: string;
  mentor_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  status: string;
}

export default function MentorAvailability({ mentor }: MentorAvailabilityProps) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '10:00',
  });
  
  // Days of the week for dropdown
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  
  // Load mentor availability
  useEffect(() => {
    const loadAvailability = async () => {
      if (mentor?.id) {
        setLoading(true);
        try {
          const slots = await getAvailability(mentor.id);
          setAvailability(slots);
        } catch (error) {
          console.error('Error loading availability:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadAvailability();
  }, [mentor]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSlot(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddSlot = async () => {
    if (!mentor?.id) return;
    
    // Basic validation
    if (newSlot.start_time >= newSlot.end_time) {
      alert('End time must be after start time');
      return;
    }
    
    try {
      // This would be an API call to create a new availability slot
      alert('Feature to be implemented: Add availability slot');
      
      // For now just add to local state (UI only)
      const mockSlot: AvailabilitySlot = {
        id: `temp-${Date.now()}`,
        mentor_id: mentor.id,
        day_of_week: newSlot.day_of_week,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
        status: 'available'
      };
      
      setAvailability(prev => [...prev, mockSlot]);
      
      // Reset form
      setNewSlot({
        day_of_week: 'Monday',
        start_time: '09:00',
        end_time: '10:00',
      });
      
    } catch (error) {
      console.error('Error adding availability slot:', error);
    }
  };
  
  const handleDeleteSlot = (slotId: string) => {
    // This would be an API call to delete the slot
    alert(`Feature to be implemented: Delete slot ${slotId}`);
    
    // For now just remove from local state (UI only)
    setAvailability(prev => prev.filter(slot => slot.id !== slotId));
  };
  
  if (!mentor) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">My Availability</h2>
        <p className="text-gray-500">Please complete your mentor profile first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">My Availability</h2>
      <p className="mb-6 text-gray-600">
        Set your recurring availability for mentoring sessions. Mentees will be able to book
        slots during these times.
      </p>
      
      {/* Add new availability slot */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Add New Availability</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              id="day_of_week"
              name="day_of_week"
              value={newSlot.day_of_week}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              id="start_time"
              type="time"
              name="start_time"
              value={newSlot.start_time}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              id="end_time"
              type="time"
              name="end_time"
              value={newSlot.end_time}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleAddSlot}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Slot
            </button>
          </div>
        </div>
      </div>
      
      {/* Current availability slots */}
      <h3 className="text-lg font-medium mb-3">Current Availability</h3>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : availability.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Day</th>
                <th className="px-4 py-2 text-left">Start Time</th>
                <th className="px-4 py-2 text-left">End Time</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {availability.map(slot => (
                <tr key={slot.id} className="border-b border-gray-200">
                  <td className="px-4 py-2">{slot.day_of_week}</td>
                  <td className="px-4 py-2">{slot.start_time}</td>
                  <td className="px-4 py-2">{slot.end_time}</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {slot.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 py-4">No availability slots set. Add some above.</p>
      )}
    </div>
  );
}