-- Fix RLS policies for real-time chat functionality
-- This migration ensures real-time subscriptions work properly

-- First, ensure REPLICA IDENTITY is set for all chat tables
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.chat_room_participants REPLICA IDENTITY FULL;  
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Drop existing conflicting policies and recreate them
DROP POLICY IF EXISTS "Users can view messages in rooms they are in" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in rooms they are in" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow replication" ON public.chat_messages;

-- Create optimized RLS policies for chat_messages
CREATE POLICY "Users can view messages in their rooms"
  ON public.chat_messages
  FOR SELECT
  USING (
    room_id IN (
      SELECT room_id FROM public.chat_room_participants WHERE user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Users can insert their own messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    auth.uid()::uuid = sender_id AND
    room_id IN (
      SELECT room_id FROM public.chat_room_participants WHERE user_id = auth.uid()::uuid
    )
  );

-- Critical: Allow service_role to replicate for real-time
CREATE POLICY "Enable realtime for chat_messages"
  ON public.chat_messages
  FOR ALL
  TO "service_role"
  USING (true);

-- Update chat_rooms policies for better real-time support  
DROP POLICY IF EXISTS "Users can view rooms they are in" ON public.chat_rooms;

CREATE POLICY "Users can view their rooms"
  ON public.chat_rooms
  FOR SELECT
  USING (
    id IN (
      SELECT room_id FROM public.chat_room_participants WHERE user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Enable realtime for chat_rooms"
  ON public.chat_rooms
  FOR ALL
  TO "service_role"
  USING (true);

-- Update chat_room_participants policies
DROP POLICY IF EXISTS "Users can view participants in rooms they are in" ON public.chat_room_participants;

CREATE POLICY "Users can view participants in their rooms"
  ON public.chat_room_participants
  FOR SELECT
  USING (
    room_id IN (
      SELECT room_id FROM public.chat_room_participants WHERE user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Enable realtime for chat_room_participants"
  ON public.chat_room_participants
  FOR ALL
  TO "service_role"
  USING (true);

-- Grant necessary permissions to service_role
GRANT ALL ON public.chat_messages TO "service_role";
GRANT ALL ON public.chat_rooms TO "service_role";
GRANT ALL ON public.chat_room_participants TO "service_role";

-- Ensure tables are added to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_participants;
