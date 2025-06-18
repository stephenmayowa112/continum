-- Add email column to mentors table
ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';