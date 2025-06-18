-- Add profile image URL field to mentees table
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentees' AND column_name = 'profile_image_url') THEN
    ALTER TABLE public.mentees ADD COLUMN profile_image_url TEXT DEFAULT '/images/mentor_pic.png';
  END IF;
END $$;