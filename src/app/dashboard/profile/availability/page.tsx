"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '../../../../lib/auth';
import { useRouter } from 'next/navigation';
import {
  getAvailability,
  createAvailability,
  deleteAvailability
} from '../../../../services/profileService';
import { supabase } from '../../../../lib/supabaseClient';
import dynamic from 'next/dynamic';
import 'react-datepicker/dist/react-datepicker.css';

const DatePicker = dynamic<any>(
  () => import('react-datepicker').then((mod) => mod.default as any),
  { ssr: false, loading: () => <div>Loading calendar...</div> }
);

type Slot = {
  id: string;
  mentor_id: string;
  start_time: string;
  end_time: string;
};

export default function AvailabilityPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    if (user) {
      try {
        const data = await getAvailability(user.id);
        setSlots(data || []);
      } catch (err) {
        console.warn('Error loading availability slots:', err);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!loading && user) loadSlots();
  }, [user, loading, loadSlots]);
  
  // subscribe to real-time availability changes for this mentor
  useEffect(() => {
    let channel: any;
    if (!loading && user) {
      channel = supabase
        .channel(`availability_${user.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'availability', filter: `mentor_id=eq.${user.id}` }, payload => {
          try {
            const newSlot = (payload as any).record as Slot;
            if (newSlot && newSlot.id) {
              setSlots(prev => [...prev, newSlot]);
            }
          } catch (err) {
            console.warn('Subscription insert error:', err);
          }
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'availability', filter: `mentor_id=eq.${user.id}` }, payload => {
          try {
            const oldSlot = (payload as any).record as Slot;
            if (oldSlot && oldSlot.id) {
              setSlots(prev => prev.filter(s => s.id !== oldSlot.id));
            }
          } catch (err) {
            console.warn('Subscription delete error:', err);
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'availability', filter: `mentor_id=eq.${user.id}` }, payload => {
          try {
            const updatedSlot = (payload as any).record as Slot;
            setSlots(prev => prev.map(s => s.id === updatedSlot.id ? updatedSlot : s));
          } catch (err) {
            console.warn('Subscription update error:', err);
          }
        })
        .subscribe();
    }
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [user, loading]);

  const handleAdd = async () => {
    if (!user) return;
    // Validation
    if (!startDate || !endDate) {
      setFormError('Start and end time are required');
      return;
    }
    
    if (endDate <= startDate) {
      setFormError('End time must be after start time');
      return;
    }

    setFormError(null);
    setBusy(true);
    
    try {
      const newSlot = {
        mentor_id: user.id,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString()
      };
      
      await createAvailability(newSlot);
      
      // Reset form on success
      setStartDate(null);
      setEndDate(null);
      // Redirect back to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error adding availability slot:', err.message || err);
      setFormError('Failed to add slot: ' + (err.message || 'Unknown error'));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      await deleteAvailability(id);
      await loadSlots();
    } catch (err) {
      console.warn('Error deleting availability slot:', err);
      setFormError('Failed to delete slot');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mt-4">
      <div className="bg-white p-6 rounded-lg shadow w-11/12 md:w-4/5 lg:w-3/4 mx-auto space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Availability Slots</h2>
        {formError && <p className="text-red-500 text-sm">{formError}</p>}
        {slots.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col items-center justify-center space-y-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">No availability slots yet</p>
              <p className="text-sm">Create your first session slot below</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {slots.map(slot => {
              const startDateTime = new Date(slot.start_time);
              const endDateTime = new Date(slot.end_time);
              
              return (
                <li key={slot.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition duration-200">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {startDateTime.toLocaleDateString(undefined, {weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'})}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{startDateTime.toLocaleTimeString(undefined, {hour: 'numeric', minute: '2-digit'})}</span>
                        <span className="mx-2">—</span>
                        <span className="font-medium">{endDateTime.toLocaleTimeString(undefined, {hour: 'numeric', minute: '2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(slot.id)} 
                    disabled={busy} 
                    className="flex items-center px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Add New Slot</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Begins</label>
              <div className="relative">
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={new Date()}
                  placeholderText="Select start date and time"
                  className="w-full px-4 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  calendarClassName="bg-white shadow-lg rounded-lg border border-gray-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Ends</label>
              <div className="relative">
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={startDate || new Date()}
                  placeholderText="Select end date and time"
                  className="w-full px-4 py-2 border border-gray-300 rounded text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  calendarClassName="bg-white shadow-lg rounded-lg border border-gray-200"
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={busy}
            className="w-full py-2 text-white font-medium rounded transition mt-4"
            style={{ background: 'linear-gradient(90deg, #24242E 0%, #747494 100%)' }}
          >
            {busy ? 'Saving...' : 'Add Slot'}
          </button>
        </div>
      </div>
    </div>
  );
}