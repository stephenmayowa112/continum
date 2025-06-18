-- Add LinkedIn URL and date of birth to mentors table
ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT NOT NULL DEFAULT '';
ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Enable RLS on new columns if needed (policies apply to whole table)