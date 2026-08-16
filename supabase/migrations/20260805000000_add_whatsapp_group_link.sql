-- Add whatsapp_group_url column to settings
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS whatsapp_group_url TEXT;

-- Optional: index for faster lookups if needed
CREATE INDEX IF NOT EXISTS idx_settings_whatsapp_group_url ON public.settings (whatsapp_group_url);
