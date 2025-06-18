-- filepath: supabase/migrations/20250528_add_chat_files_table.sql
-- Create table to store file uploads associated with chat rooms
CREATE TABLE public.chat_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable REPLICA IDENTITY for streaming changes
ALTER TABLE public.chat_files REPLICA IDENTITY FULL;

-- Enable Row-Level Security
ALTER TABLE public.chat_files ENABLE ROW LEVEL SECURITY;

-- Policy: allow users to insert their own files
CREATE POLICY "Users can insert their own files"
  ON public.chat_files
  FOR INSERT
  WITH CHECK ( auth.uid()::uuid = sender_id );

-- Policy: allow users to select files in rooms they participate in
CREATE POLICY "Users can view files in their rooms"
  ON public.chat_files
  FOR SELECT
  USING (
    room_id IN (
      SELECT room_id FROM public.chat_room_participants WHERE user_id = auth.uid()::uuid
    )
  );

-- Policy: allow realtime replication
CREATE POLICY "Allow replication on chat_files"
  ON public.chat_files
  FOR ALL
  USING ( true );
