const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hxbogoynpkcyrojxbtsi.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Ym9nb3lucGtjeXJvanhidHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3ODYwNDgsImV4cCI6MjEwMTM2MjA0OH0.bCA_ZAjzIlsM4VpyeWCno3OFpIMYQ95r-0M7vqAJxKU';
const supabase = createClient(url, key);

(async () => {
  const sql = [
    "ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS program_name text DEFAULT 'Annual Program 2026';",
    "ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS program_subtitle text DEFAULT 'Annual Program & Competition';",
    "ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS logo_url text;",
    "ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS banner_url text;",
    "ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS footer_text text DEFAULT 'Nurturing minds and hearts with the light of Islamic knowledge.';",
    "ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS facebook_url text;",
    "ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS instagram_url text;",
    "ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS youtube_url text;",
    "UPDATE public.settings SET program_name = COALESCE(program_name, 'Annual Program 2026'), program_subtitle = COALESCE(program_subtitle, 'Annual Program & Competition'), footer_text = COALESCE(footer_text, 'Nurturing minds and hearts with the light of Islamic knowledge.'), madrasa_name = COALESCE(madrasa_name, 'Darul Huda Madrasa') WHERE id = 1;"
  ].join('\n');

  const { data, error } = await supabase.rpc('exec_sql', { sql });
  console.log(JSON.stringify({ data, error }, null, 2));
})();
