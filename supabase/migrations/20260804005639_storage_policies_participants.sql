/*
# Storage policies for participant photos

1. Allows public (anon) to read participant photos.
2. Allows authenticated admins to upload/update/delete photos.
*/

DROP POLICY IF EXISTS "public_read_participants_bucket" ON storage.objects;
CREATE POLICY "public_read_participants_bucket" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'participants');

DROP POLICY IF EXISTS "auth_insert_participants_bucket" ON storage.objects;
CREATE POLICY "auth_insert_participants_bucket" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'participants');

DROP POLICY IF EXISTS "auth_update_participants_bucket" ON storage.objects;
CREATE POLICY "auth_update_participants_bucket" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'participants') WITH CHECK (bucket_id = 'participants');

DROP POLICY IF EXISTS "auth_delete_participants_bucket" ON storage.objects;
CREATE POLICY "auth_delete_participants_bucket" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'participants');
