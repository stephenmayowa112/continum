-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id TEXT NOT NULL, -- Using TEXT to match your implementation
  user_id TEXT NOT NULL, -- Using TEXT to match your implementation
  booking_date TEXT, -- Format: "18 Jan"
  booking_time TEXT, -- Format: "6:00pm"
  date TEXT, -- Alternative field name used in your code
  time TEXT, -- Alternative field name used in your code
  session_type TEXT NOT NULL, -- "Mentorship" or "Coaching"
  meeting_id TEXT NOT NULL,
  meeting_url TEXT NOT NULL,
  meeting_password TEXT,
  password TEXT, -- Alternative field name
  mentor_name TEXT,
  mentor_email TEXT,
  user_email TEXT,
  status TEXT DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indices for faster lookup if they don't exist
CREATE INDEX IF NOT EXISTS idx_bookings_mentor_id ON bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(date, time);

-- Add RLS policies for security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policy function to safely add policies
DO $$
DECLARE
  policy_exists boolean;
BEGIN
    -- Policy for users to view their own bookings
    SELECT EXISTS(
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Users can view their own bookings'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        CREATE POLICY "Users can view their own bookings"
          ON bookings
          FOR SELECT
          USING (auth.uid()::text = user_id);
    END IF;

    -- Policy for mentors to view bookings where they are the mentor
    SELECT EXISTS(
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Mentors can view their assigned bookings'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        CREATE POLICY "Mentors can view their assigned bookings"
          ON bookings
          FOR SELECT
          USING (auth.uid()::text = mentor_id);
    END IF;

    -- Policy for inserting bookings
    SELECT EXISTS(
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Users can create bookings'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        CREATE POLICY "Users can create bookings"
          ON bookings
          FOR INSERT
          WITH CHECK (auth.uid()::text = user_id);
    END IF;

    -- Policy for updating bookings
    SELECT EXISTS(
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Users can update their own bookings'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        CREATE POLICY "Users can update their own bookings"
          ON bookings
          FOR UPDATE
          USING (auth.uid()::text = user_id);
    END IF;

    -- Policy for service role
    SELECT EXISTS(
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Service role has full access'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        CREATE POLICY "Service role has full access"
          ON bookings
          USING (auth.role() = 'service_role');
    END IF;
END
$$;

-- Create function to update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Check if trigger exists before creating
DO $$
DECLARE
  trigger_exists boolean;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_bookings_updated_at' 
        AND tgrelid = 'bookings'::regclass
    ) INTO trigger_exists;
    
    IF NOT trigger_exists THEN
        CREATE TRIGGER update_bookings_updated_at
        BEFORE UPDATE ON bookings
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END
$$;