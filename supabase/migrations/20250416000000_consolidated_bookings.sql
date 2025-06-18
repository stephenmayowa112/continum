-- Combined migration file for bookings table and RLS policies
-- This replaces and combines the previous migrations

-- First ensure needed extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create or update bookings table
DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
        -- Create the table if it doesn't exist
        CREATE TABLE public.bookings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            mentor_id TEXT NOT NULL,
            mentor_name TEXT,
            mentor_email TEXT,
            user_id TEXT NOT NULL,
            user_email TEXT,
            date TEXT,
            time TEXT,
            booking_date TEXT, -- Alternative field name
            booking_time TEXT, -- Alternative field name
            session_type TEXT NOT NULL,
            meeting_id TEXT NOT NULL,
            meeting_url TEXT NOT NULL,
            password TEXT,
            meeting_password TEXT, -- Alternative field name
            status TEXT DEFAULT 'confirmed',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE
        );
        
        -- Create indices for faster lookup
        CREATE INDEX idx_bookings_mentor_id ON public.bookings(mentor_id);
        CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
        CREATE INDEX idx_bookings_date_time ON public.bookings(date, time);
        
        -- Create function to update updated_at timestamp
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        -- Create trigger for updated_at
        CREATE TRIGGER update_bookings_updated_at
        BEFORE UPDATE ON public.bookings
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
    ELSE
        -- Table exists, ensure it has all required columns
        -- Add columns if they don't exist
        
        -- Status column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'status'
        ) THEN
            ALTER TABLE public.bookings ADD COLUMN status TEXT DEFAULT 'confirmed';
        END IF;
        
        -- Alternative date field
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'booking_date'
        ) THEN
            ALTER TABLE public.bookings ADD COLUMN booking_date TEXT;
        END IF;
        
        -- Alternative time field
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'booking_time'
        ) THEN
            ALTER TABLE public.bookings ADD COLUMN booking_time TEXT;
        END IF;
        
        -- Alternative password field
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'meeting_password'
        ) THEN
            ALTER TABLE public.bookings ADD COLUMN meeting_password TEXT;
        END IF;
    END IF;
END
$$;

-- Always enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Clean up old policies first before adding new ones
DO $$
BEGIN
    -- Drop all policies from bookings table using dynamic SQL
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.bookings', pol.policyname);
    END LOOP;
    
    -- Create the new policies
    CREATE POLICY "Users can view their own bookings"
        ON public.bookings
        FOR SELECT
        USING (auth.uid()::text = user_id OR auth.uid()::text = mentor_id);

    CREATE POLICY "Users can insert their own bookings"
        ON public.bookings
        FOR INSERT
        WITH CHECK (auth.uid()::text = user_id);

    CREATE POLICY "Service role has full access"
        ON public.bookings
        USING (auth.role() = 'service_role');
END
$$;