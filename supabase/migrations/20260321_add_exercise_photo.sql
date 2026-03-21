-- Add photo_url to exercise_library for custom exercise photos
ALTER TABLE exercise_library ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create storage bucket for exercise photos (run this manually in Supabase dashboard
-- if the bucket doesn't exist: Storage > New bucket > "exercise-photos" > Public)
-- Then add this policy via SQL:
-- CREATE POLICY "Users can upload their own exercise photos"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'exercise-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Anyone can view exercise photos"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'exercise-photos');
-- CREATE POLICY "Users can delete their own exercise photos"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'exercise-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
