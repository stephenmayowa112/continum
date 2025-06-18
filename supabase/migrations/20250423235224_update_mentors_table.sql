-- Update mentors table to ensure it has all the fields needed for the dashboard

-- Location field
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'location') THEN
    ALTER TABLE public.mentors ADD COLUMN location TEXT DEFAULT 'Unknown';
  END IF;
END $$;

-- Company field
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'company') THEN
    ALTER TABLE public.mentors ADD COLUMN company TEXT DEFAULT 'Independent';
  END IF;
END $$;

-- Sessions completed field
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'sessions_completed') THEN
    ALTER TABLE public.mentors ADD COLUMN sessions_completed INT DEFAULT 0;
  END IF;
END $$;

-- Reviews count field
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'reviews_count') THEN
    ALTER TABLE public.mentors ADD COLUMN reviews_count INT DEFAULT 0;
  END IF;
END $$;

-- Years of experience field
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'years_experience') THEN
    ALTER TABLE public.mentors ADD COLUMN years_experience INT DEFAULT 0;
  END IF;
END $$;

-- Attendance rate field
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'attendance_rate') THEN
    ALTER TABLE public.mentors ADD COLUMN attendance_rate INT DEFAULT 98;
  END IF;
END $$;

-- Is available ASAP field
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'is_available_asap') THEN
    ALTER TABLE public.mentors ADD COLUMN is_available_asap BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Provides coaching field
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'provides_coaching') THEN
    ALTER TABLE public.mentors ADD COLUMN provides_coaching BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Profile image URL field
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'profile_image_url') THEN
    ALTER TABLE public.mentors ADD COLUMN profile_image_url TEXT DEFAULT '/images/mentor_pic.png';
  END IF;
END $$;

-- Is top rated field
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'is_top_rated') THEN
    ALTER TABLE public.mentors ADD COLUMN is_top_rated BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Categories array field (for specializations/skills)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'categories') THEN
    ALTER TABLE public.mentors ADD COLUMN categories TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Specialization field (can be used as role)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'specialization') THEN
    ALTER TABLE public.mentors ADD COLUMN specialization TEXT DEFAULT 'Mentor';
  END IF;
END $$;