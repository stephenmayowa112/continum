-- Simple, direct migration for bookings table
-- This file replaces all previous migrations with a simpler approach

-- Drop and recreate bookings table with proper types
DROP TABLE IF EXISTS public.bookings;

-- Create the table with TEXT types for user_id and mentor_id
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies with explicit text casting
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