-- Update mentors RLS policies to allow public inserts during registration

-- First drop the existing insert policy that's too restrictive
DROP POLICY IF EXISTS "Mentors can be inserted by authenticated users" ON public.mentors;

-- Create a new insert policy that allows service role and authenticated users to insert
CREATE POLICY "Allow registration inserts to mentors" 
    ON public.mentors 
    FOR INSERT 
    WITH CHECK (true);  -- Allow any insert (we'll rely on API logic to validate)

-- Rest of policies remain the same for update/delete/select