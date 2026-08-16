/*
# Create website-assets storage bucket for logo/banner uploads
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website-assets',
  'website-assets',
  true,
  5242880,
  ARRAY['image/png','image/jpeg','image/jpg','image/webp','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_website_assets_bucket" ON storage.objects;
CREATE POLICY "public_read_website_assets_bucket" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'website-assets');

DROP POLICY IF EXISTS "auth_insert_website_assets_bucket" ON storage.objects;
CREATE POLICY "auth_insert_website_assets_bucket" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'website-assets');

DROP POLICY IF EXISTS "auth_update_website_assets_bucket" ON storage.objects;
CREATE POLICY "auth_update_website_assets_bucket" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'website-assets') WITH CHECK (bucket_id = 'website-assets');

DROP POLICY IF EXISTS "auth_delete_website_assets_bucket" ON storage.objects;
CREATE POLICY "auth_delete_website_assets_bucket" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'website-assets');
