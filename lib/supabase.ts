import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://hxbogoynpkcyrojxbtsi.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Ym9nb3lucGtjeXJvanhidHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3ODYwNDgsImV4cCI6MjEwMTM2MjA0OH0.bCA_ZAjzIlsM4VpyeWCno3OFpIMYQ95r-0M7vqAJxKU';

function normalizeSupabaseUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return DEFAULT_SUPABASE_URL;
  }

  try {
    const parsed = new URL(trimmed);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return DEFAULT_SUPABASE_URL;
  }
}

const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

export type Program = {
  id: string;
  program_number: number;
  name: string;
  category_id: string | null;
  description: string | null;
  sort_order: number;
};

export type ScheduleEntry = {
  id: string;
  sl_no: number;
  start_time: string;
  end_time: string | null;
  program: string;
  category: string | null;
  stage: string | null;
  notes: string | null;
};

export type Participant = {
  id: string;
  name: string;
  participant_number: string;
  category: string | null;
  class_name: string | null;
  program: string | null;
  photo_url: string | null;
};

export type Result = {
  id: string;
  program_number: number;
  program_name: string;
  category: string | null;
  first_prize: string | null;
  second_prize: string | null;
  third_prize: string | null;
  published: boolean;
};

export type LiveStatus = {
  id: number;
  is_live: boolean;
  stage_number: string | null;
  program_name: string | null;
  category: string | null;
  status: string;
  updated_at: string;
};

export type EmergencyContact = {
  id: string;
  role: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  sort_order: number;
};

export type QueriesContact = {
  id: number;
  name: string;
  phone: string;
  whatsapp: string | null;
};

export type Settings = {
  id: number;
  madrasa_name: string;
  madrasa_logo: string | null;
  logo_url: string | null;
  banner_url: string | null;
  program_name: string | null;
  program_subtitle: string | null;
  event_date: string | null;
  venue: string | null;
  address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  footer_text: string | null;
  copyright: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  whatsapp_group_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  header_background: string | null;
  header_text_color: string | null;
  search_background: string | null;
  page_background: string | null;
};
