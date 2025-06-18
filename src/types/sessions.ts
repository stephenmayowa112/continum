// filepath: src/types/sessions.ts
export interface Session {
  id: string;
  mentor_id: string;
  mentee_id: string;
  title: string;
  description?: string;
  agenda?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  meeting_link?: string;
  meetingId?: string;
  token?: string;
  created_at?: string;
  updated_at?: string;
  mentees?: {
    name?: string;
    id?: string;
    email?: string;
  };
}
