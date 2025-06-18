-- Create a function to get or create a chat room between two users
CREATE OR REPLACE FUNCTION get_or_create_one_to_one_room(user1 UUID, user2 UUID)
RETURNS SETOF chat_rooms AS $$
DECLARE
  existing_room_id UUID;
  new_room_id UUID;
BEGIN
  -- Check if a room already exists between these users
  SELECT cr.id INTO existing_room_id
  FROM chat_rooms cr
  JOIN chat_room_participants crp1 ON cr.id = crp1.room_id
  JOIN chat_room_participants crp2 ON cr.id = crp2.room_id
  WHERE 
    cr.is_group = false AND
    crp1.user_id = user1 AND
    crp2.user_id = user2;

  -- If room exists, return it
  IF existing_room_id IS NOT NULL THEN
    RETURN QUERY 
    SELECT * 
    FROM chat_rooms
    WHERE id = existing_room_id;
  ELSE
    -- Create new 1:1 chat room
    INSERT INTO chat_rooms (is_group, created_at)
    VALUES (false, NOW())
    RETURNING id INTO new_room_id;
    
    -- Add both users as participants
    INSERT INTO chat_room_participants (room_id, user_id)
    VALUES 
      (new_room_id, user1),
      (new_room_id, user2);
    
    -- Return the new room
    RETURN QUERY 
    SELECT * 
    FROM chat_rooms
    WHERE id = new_room_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get all chat rooms for a user with participant information
CREATE OR REPLACE FUNCTION get_user_chat_rooms()
RETURNS TABLE (
  id UUID,
  participants JSONB,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user ID from auth.uid()
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  RETURN QUERY
  WITH user_rooms AS (
    -- Get all rooms the current user is part of
    SELECT cr.id AS room_id, cr.created_at
    FROM chat_rooms cr
    JOIN chat_room_participants crp ON cr.id = crp.room_id
    WHERE crp.user_id = current_user_id
  ),
  last_messages AS (
    -- Get last message for each room
    SELECT DISTINCT ON (room_id)
      room_id,
      text as message,
      inserted_at
    FROM chat_messages
    WHERE room_id IN (SELECT room_id FROM user_rooms)
    ORDER BY room_id, inserted_at DESC
  ),
  room_participants AS (
    -- Get all participants for each room
    SELECT
      crp.room_id,
      jsonb_agg(
        jsonb_build_object(
          'user_id', p.id,
          'full_name', COALESCE(
            CASE 
              WHEN EXISTS (SELECT 1 FROM mentors WHERE user_id = p.id) THEN (SELECT name FROM mentors WHERE user_id = p.id)
              WHEN EXISTS (SELECT 1 FROM mentees WHERE user_id = p.id) THEN (SELECT name FROM mentees WHERE user_id = p.id)
              ELSE NULL
            END, 
            p.raw_user_meta_data->>'full_name', 
            'User'
          ),
          'avatar_url', COALESCE(
            CASE 
              WHEN EXISTS (SELECT 1 FROM mentors WHERE user_id = p.id) THEN (SELECT profile_image_url FROM mentors WHERE user_id = p.id)
              WHEN EXISTS (SELECT 1 FROM mentees WHERE user_id = p.id) THEN (SELECT profile_image_url FROM mentees WHERE user_id = p.id)
              ELSE NULL
            END,
            '/images/user-placeholder.png'
          )
        )
      ) AS participants
    FROM chat_room_participants crp
    JOIN auth.users p ON crp.user_id = p.id
    WHERE crp.room_id IN (SELECT id FROM user_rooms)
    GROUP BY crp.room_id
  )
  
  -- Final query joining all the parts
  SELECT
    ur.room_id AS id,
    rp.participants,
    COALESCE(lm.message, '') AS last_message,
    COALESCE(lm.inserted_at, ur.created_at) AS last_message_at
  FROM user_rooms ur
  JOIN room_participants rp ON ur.room_id = rp.room_id
  LEFT JOIN last_messages lm ON ur.room_id = lm.room_id
  ORDER BY COALESCE(lm.inserted_at, ur.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
