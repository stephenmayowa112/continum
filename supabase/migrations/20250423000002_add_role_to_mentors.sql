-- Add role column to mentors table to differentiate user types
ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'mentee';

-- Update existing records as needed
-- UPDATE public.mentors SET role = 'mentor' WHERE /* your condition to identify mentors */;

-- Create an index for faster queries by role
CREATE INDEX IF NOT EXISTS idx_mentors_role ON public.mentors(role);