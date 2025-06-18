-- Create storage policies for chat-files bucket
-- First, ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload files to chat-files bucket
CREATE POLICY "Allow authenticated uploads to chat-files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-files' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow public read access to files in chat-files bucket
CREATE POLICY "Allow public read from chat-files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-files'
);

-- Policy: Allow users to update/delete their own files
CREATE POLICY "Allow users to manage own files in chat-files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'chat-files' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to delete own files in chat-files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-files' 
  AND auth.role() = 'authenticated'
);
