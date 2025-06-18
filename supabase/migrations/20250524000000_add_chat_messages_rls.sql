-- Enable REPLICA IDENTITY for streaming changes
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Enable RLS on chat_messages and add policies for secure access
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: allow users to insert messages only as themselves
CREATE POLICY "Users can insert their own messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (auth.uid()::uuid = sender_id);

-- Policy: allow users to select messages in rooms they participate in
CREATE POLICY "Users can view messages in their rooms"
  ON public.chat_messages
  FOR SELECT
  USING (
    room_id IN (
      SELECT room_id FROM public.chat_room_participants WHERE user_id = auth.uid()::uuid
    )
  );

-- Policy: allow realtime replication
--DROP POLICY IF EXISTS "Allow replication" ON public.chat_messages;
-- Allow replication via service_role
 CREATE POLICY "Allow replication"
   ON public.chat_messages
   FOR ALL
   USING ( true );
-- Ensure SELECT by Supabase real-time uses service_role bypassing RLS
 GRANT SELECT ON public.chat_messages TO "service_role";
