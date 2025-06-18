"use client";
import React, { useState, useEffect } from 'react';
import { getMenteeSessions } from '../../../services/sessionService';
import { supabase } from '../../../../lib/supabaseClient';

interface MenteeSessionsProps { menteeId: string; }

const formatDateTime = (dateString: string) => {
  const d = new Date(dateString);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export default function MenteeSessions({ menteeId }: MenteeSessionsProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // load initial sessions
  useEffect(() => {
    if (!menteeId) return;
    getMenteeSessions(menteeId).then(setSessions).catch(console.error);
  }, [menteeId]);

  // real-time subscribe new bookings
  useEffect(() => {
    if (!menteeId) return;
    const channel = supabase
      .channel(`mentee_sessions_${menteeId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mentoring_sessions', filter: `mentee_id=eq.${menteeId}` }, (payload) => {
        const newSession = (payload as any).new;
        setSessions(prev => [...prev, newSession]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [menteeId]);

  const upcoming = sessions.filter(s => ['upcoming', 'active'].includes(s.status) && !s.cancelled_at);
  const past = sessions.filter(s => s.status === 'completed' || s.cancelled_at);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex gap-4 mb-4">
        <button onClick={() => setActiveTab('upcoming')} className={activeTab === 'upcoming' ? 'font-semibold' : ''}>Upcoming Sessions</button>
        <button onClick={() => setActiveTab('past')} className={activeTab === 'past' ? 'font-semibold' : ''}>Past Sessions</button>
      </div>
      <div className="space-y-4">
        {(activeTab === 'upcoming' ? upcoming : past).length === 0 ? (
          <p className="text-gray-500">No {activeTab} sessions.</p>
        ) : (
          (activeTab === 'upcoming' ? upcoming : past).map(session => (
            <div key={session.id} className="border border-gray-200 p-4 rounded">
              <p className="text-sm font-medium">{session.title || `Session with ${session.mentors?.name}`}</p>
              <p className="text-xs text-gray-500">{formatDateTime(session.start_time)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
