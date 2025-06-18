"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '../../../../lib/auth';
import { fetchMentorById } from '../../../../lib/mentors';
import { Mentor } from '../../components/common/types';

interface Slot { id: string; start_time: string; end_time: string; }

export default function MentorDetailPage() {
  const { mentorId } = useParams() as { mentorId: string };
  const router = useRouter();
  const { user } = useUser();

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchMentorById(mentorId);
      setMentor(data);
      const res = await fetch(`/api/mentors/${mentorId}/availability`);
      const avail = await res.json();
      setSlots(avail);
      setLoading(false);
    })();
  }, [mentorId]);

  const handleBook = async (slot: Slot) => {
    if (!user) return router.push('/signIn');
    setBooking(true);
    const payload = {
      slotId: slot.id,
      mentorId,
      userId: user.id,
      mentorName: mentor?.name,
      mentorEmail: mentor?.email,
      userEmail: user.email,
      date: new Date(slot.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: new Date(slot.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      sessionType: 'Mentorship'
    };
    const res = await fetch('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
    if (res.ok) {
      router.push('/dashboard?section=bookings');
    } else {
      console.error('Booking failed');
    }
    setBooking(false);
  };

  if (loading) return <div>Loading mentor...</div>;
  if (!mentor) return <div>Mentor not found</div>;

  return (
    <div className="max-w-screen-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{mentor.name}</h1>
      <p className="text-gray-600 mb-6">{mentor.role} at {mentor.company}</p>
      <h2 className="text-xl font-semibold mb-2">Available Slots</h2>
      {slots.length > 0 ? (
        <ul className="space-y-2">
          {slots.map(slot => (
            <li key={slot.id} className="flex justify-between items-center border p-4 rounded">
              <div>
                <span className="font-medium">{new Date(slot.start_time).toLocaleString()}</span>
              </div>
              <button
                onClick={() => handleBook(slot)}
                disabled={booking}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                {booking ? 'Booking...' : 'Book'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No slots available</p>
      )}
    </div>
  );
}