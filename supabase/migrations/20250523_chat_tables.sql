-- Create tables needed for chat functionality
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT
);

CREATE TABLE IF NOT EXISTS public.chat_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  text TEXT NOT NULL,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies to secure chat tables
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS for chat_rooms
CREATE POLICY "Users can view rooms they are in" 
ON public.chat_rooms 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM chat_room_participants crp 
    WHERE crp.room_id = id AND crp.user_id = auth.uid()
  )
);

-- RLS for chat_room_participants
CREATE POLICY "Users can view participants in rooms they are in" 
ON public.chat_room_participants 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM chat_room_participants crp 
    WHERE crp.room_id = room_id AND crp.user_id = auth.uid()
  )
);

-- RLS for chat_messages
CREATE POLICY "Users can view messages in rooms they are in" 
ON public.chat_messages 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM chat_room_participants crp 
    WHERE crp.room_id = room_id AND crp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in rooms they are in" 
ON public.chat_messages 
FOR INSERT 
TO authenticated 
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 
    FROM chat_room_participants crp 
    WHERE crp.room_id = room_id AND crp.user_id = auth.uid()
  )
);

-- Enable realtime for the chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_participants;
