/*
# Add configurable website settings fields

Adds support for homepage and footer content that can be managed from the admin panel.
*/

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS program_name text DEFAULT 'Annual Program 2026',
  ADD COLUMN IF NOT EXISTS program_subtitle text DEFAULT 'Annual Program & Competition',
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS footer_text text DEFAULT 'Nurturing minds and hearts with the light of Islamic knowledge.',
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text;

UPDATE public.settings
SET
  program_name = COALESCE(program_name, 'Annual Program 2026'),
  program_subtitle = COALESCE(program_subtitle, 'Annual Program & Competition'),
  footer_text = COALESCE(footer_text, 'Nurturing minds and hearts with the light of Islamic knowledge.'),
  madrasa_name = COALESCE(madrasa_name, 'Darul Huda Madrasa')
WHERE id = 1;
