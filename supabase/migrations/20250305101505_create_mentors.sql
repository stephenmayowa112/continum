-- Create mentors table if it doesn't exist already
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    name TEXT NOT NULL,
    email TEXT,
    bio TEXT,
    expertise TEXT[],
    profile_image_url TEXT,
    user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS on the mentors table (safe to run multiple times)
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist already
DO $$
BEGIN
    -- Check if the policy exists before creating it
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'mentors' AND policyname = 'Mentors are viewable by everyone'
    ) THEN
        CREATE POLICY "Mentors are viewable by everyone" 
            ON public.mentors FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'mentors' AND policyname = 'Mentors can be edited by the owner'
    ) THEN
        CREATE POLICY "Mentors can be edited by the owner" 
            ON public.mentors FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'mentors' AND policyname = 'Mentors can be deleted by the owner'
    ) THEN
        CREATE POLICY "Mentors can be deleted by the owner" 
            ON public.mentors FOR DELETE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'mentors' AND policyname = 'Mentors can be inserted by authenticated users'
    ) THEN
        CREATE POLICY "Mentors can be inserted by authenticated users" 
            ON public.mentors FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;


