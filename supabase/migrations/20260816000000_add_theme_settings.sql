-- Configurable branding and theme colours
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#164b36',
  ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#e8f3ed',
  ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#d6a928',
  ADD COLUMN IF NOT EXISTS header_background text DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS header_text_color text DEFAULT '#164b36',
  ADD COLUMN IF NOT EXISTS search_background text DEFAULT '#f3f7f5',
  ADD COLUMN IF NOT EXISTS page_background text DEFAULT '#ffffff';

UPDATE public.settings SET
  primary_color = COALESCE(primary_color, '#164b36'),
  secondary_color = COALESCE(secondary_color, '#e8f3ed'),
  accent_color = COALESCE(accent_color, '#d6a928'),
  header_background = COALESCE(header_background, '#ffffff'),
  header_text_color = COALESCE(header_text_color, '#164b36'),
  search_background = COALESCE(search_background, '#f3f7f5'),
  page_background = COALESCE(page_background, '#ffffff')
WHERE id = 1;
