-- Migration: Fix infinite recursion and RLS for chat tables

-- Drop existing chat policies
DROP POLICY IF EXISTS "chat_room_participants_select_policy" ON public.chat_room_participants;
DROP POLICY IF EXISTS "chat_room_participants_insert_policy" ON public.chat_room_participants;
DROP POLICY IF EXISTS "chat_rooms_select_policy" ON public.chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_insert_policy" ON public.chat_rooms;
DROP POLICY IF EXISTS "chat_messages_select_policy" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_policy" ON public.chat_messages;
DROP POLICY IF EXISTS "realtime_chat_rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "realtime_chat_participants" ON public.chat_room_participants;
DROP POLICY IF EXISTS "realtime_chat_messages" ON public.chat_messages;

-- Recreate non-recursive RLS policies

-- Participants
CREATE POLICY "chat_room_participants_select_policy" ON public.chat_room_participants
  FOR SELECT USING ( auth.uid()::uuid = user_id );
CREATE POLICY "chat_room_participants_insert_policy" ON public.chat_room_participants
  FOR INSERT WITH CHECK ( auth.uid()::uuid = user_id );

-- Rooms
CREATE POLICY "chat_rooms_select_policy" ON public.chat_rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_participants p
       WHERE p.room_id = public.chat_rooms.id AND p.user_id = auth.uid()::uuid
    )
  );
CREATE POLICY "chat_rooms_insert_policy" ON public.chat_rooms
  FOR INSERT WITH CHECK ( true );

-- Messages
CREATE POLICY "chat_messages_select_policy" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_room_participants p
       WHERE p.room_id = public.chat_messages.room_id AND p.user_id = auth.uid()::uuid
    )
  );
CREATE POLICY "chat_messages_insert_policy" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid()::uuid = sender_id
    AND EXISTS (
      SELECT 1 FROM public.chat_room_participants p
       WHERE p.room_id = public.chat_messages.room_id AND p.user_id = auth.uid()::uuid
    )
  );

-- Real-time service_role policies
CREATE POLICY "realtime_chat_rooms" ON public.chat_rooms
  FOR ALL TO service_role USING ( true );
CREATE POLICY "realtime_chat_participants" ON public.chat_room_participants
  FOR ALL TO service_role USING ( true );
CREATE POLICY "realtime_chat_messages" ON public.chat_messages
  FOR ALL TO service_role USING ( true );

-- Ensure real-time publication
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
EXCEPTION WHEN duplicate_object THEN NULL; END$$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_participants;
EXCEPTION WHEN duplicate_object THEN NULL; END$$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- Ensure REPLICA IDENTITY for streaming
ALTER TABLE public.chat_rooms       REPLICA IDENTITY FULL;
ALTER TABLE public.chat_room_participants REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages    REPLICA IDENTITY FULL;
