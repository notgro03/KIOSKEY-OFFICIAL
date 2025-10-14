-- Create a public bucket for videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true);

-- Allow public access to read videos
CREATE POLICY "Videos are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'videos');

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'videos' 
  AND auth.role() = 'authenticated'
);