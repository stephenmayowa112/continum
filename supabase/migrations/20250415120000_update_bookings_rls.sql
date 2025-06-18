-- Create bookings table and set up RLS
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id text NOT NULL,
  mentor_name text,
  mentor_email text,
  user_id text NOT NULL,
  user_email text,
  date text NOT NULL,
  time text NOT NULL,
  session_type text NOT NULL,
  meeting_id text NOT NULL,
  meeting_url text NOT NULL,
  password text,
  status text DEFAULT 'confirmed',
  created_at timestamp with time zone DEFAULT now()
);

-- This migration updates the RLS policies for the bookings table
-- It's safe to run multiple times

-- Make sure the bookings table exists and has the necessary columns
DO $$
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'status'
    ) THEN
        ALTER TABLE bookings ADD COLUMN status TEXT DEFAULT 'confirmed';
    END IF;
END
$$;

-- Make sure RLS is enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Update policies for secure access
DO $$
DECLARE
    policy_exists boolean;
BEGIN
    -- Drop and recreate policies to ensure they're up to date
    
    -- First, check and drop existing policies
    SELECT EXISTS(
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Users can view their own bookings'
    ) INTO policy_exists;
    IF policy_exists THEN
        DROP POLICY "Users can view their own bookings" ON bookings;
    END IF;
    
    SELECT EXISTS(
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Mentors can view their assigned bookings'
    ) INTO policy_exists;
    IF policy_exists THEN
        DROP POLICY "Mentors can view their assigned bookings" ON bookings;
    END IF;
    
    SELECT EXISTS(
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Users can create bookings'
    ) INTO policy_exists;
    IF policy_exists THEN
        DROP POLICY "Users can create bookings" ON bookings;
    END IF;
    
    SELECT EXISTS(
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Users can update their own bookings'
    ) INTO policy_exists;
    IF policy_exists THEN
        DROP POLICY "Users can update their own bookings" ON bookings;
    END IF;
    
    SELECT EXISTS(
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Users can insert their own bookings'
    ) INTO policy_exists;
    IF policy_exists THEN
        DROP POLICY "Users can insert their own bookings" ON bookings;
    END IF;
    
    SELECT EXISTS(
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Service role has full access'
    ) INTO policy_exists;
    IF policy_exists THEN
        DROP POLICY "Service role has full access" ON bookings;
    END IF;
    
    -- Now create the updated policies
    CREATE POLICY "Users can view their own bookings"
      ON bookings
      FOR SELECT
      USING (auth.uid()::text = user_id OR auth.uid()::text = mentor_id);

    CREATE POLICY "Users can insert their own bookings"
      ON bookings
      FOR INSERT
      WITH CHECK (auth.uid()::text = user_id);

    CREATE POLICY "Service role has full access"
      ON bookings
      USING (auth.role() = 'service_role');
END;
$$ LANGUAGE plpgsql;

-- Add indices for performance if they don't exist already
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mentor_id ON bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(date, time);