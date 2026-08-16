/*
# Madrasa Program Management System - Initial Schema

Creates all tables for managing a Madrasa Annual Program:
categories, programs, schedule, participants, results, live_status,
emergency_contacts, queries_contact, and settings.

## Tables

1. categories - Senior, Junior, Sub Junior
2. programs - programs belonging to a category
3. schedule - schedule entries (time, program, category, stage)
4. participants - participant cards (photo, name, number, category, class, program)
5. results - program results (first/second/third prize), publishable
6. live_status - single row tracking current live program
7. emergency_contacts - emergency contacts (Main Usthad, Second Usthad, Committee Member)
8. queries_contact - single contact person for queries
9. settings - madrasa name, logo, event date, venue, address, contact (single row)

## Security

- This app has an admin login (Supabase Auth). Public reads are anon-accessible;
  writes are restricted to authenticated admins.
- Public-readable tables get SELECT for anon,authenticated.
- All writes (INSERT/UPDATE/DELETE) restricted to authenticated.
- Results: anon sees only published rows; authenticated sees all.

## Notes

1. Admins sign in via Supabase Auth (email/password).
2. live_status, queries_contact and settings are single-row tables enforced by
   a unique constraint on a singleton key column.
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_categories" ON categories;
CREATE POLICY "auth_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_categories" ON categories;
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_categories" ON categories;
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- Programs
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_number int NOT NULL,
  name text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_programs" ON programs;
CREATE POLICY "anon_select_programs" ON programs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_programs" ON programs;
CREATE POLICY "auth_insert_programs" ON programs FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_programs" ON programs;
CREATE POLICY "auth_update_programs" ON programs FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_programs" ON programs;
CREATE POLICY "auth_delete_programs" ON programs FOR DELETE
  TO authenticated USING (true);

-- Schedule
CREATE TABLE IF NOT EXISTS schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sl_no int NOT NULL,
  start_time text NOT NULL,
  end_time text,
  program text NOT NULL,
  category text,
  stage text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_schedule" ON schedule;
CREATE POLICY "anon_select_schedule" ON schedule FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_schedule" ON schedule;
CREATE POLICY "auth_insert_schedule" ON schedule FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_schedule" ON schedule;
CREATE POLICY "auth_update_schedule" ON schedule FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_schedule" ON schedule;
CREATE POLICY "auth_delete_schedule" ON schedule FOR DELETE
  TO authenticated USING (true);

-- Participants
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  participant_number text NOT NULL UNIQUE,
  category text,
  class_name text,
  program text,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_participants" ON participants;
CREATE POLICY "anon_select_participants" ON participants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_participants" ON participants;
CREATE POLICY "auth_insert_participants" ON participants FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_participants" ON participants;
CREATE POLICY "auth_update_participants" ON participants FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_participants" ON participants;
CREATE POLICY "auth_delete_participants" ON participants FOR DELETE
  TO authenticated USING (true);

-- Results
CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_number int NOT NULL,
  program_name text NOT NULL,
  category text,
  first_prize text,
  second_prize text,
  third_prize text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Public can only see published results
DROP POLICY IF EXISTS "anon_select_results" ON results;
CREATE POLICY "anon_select_results" ON results FOR SELECT
  TO anon USING (published = true);

-- Authenticated (admins) see all results
DROP POLICY IF EXISTS "auth_select_all_results" ON results;
CREATE POLICY "auth_select_all_results" ON results FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_results" ON results;
CREATE POLICY "auth_insert_results" ON results FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_results" ON results;
CREATE POLICY "auth_update_results" ON results FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_results" ON results;
CREATE POLICY "auth_delete_results" ON results FOR DELETE
  TO authenticated USING (true);

-- Live status (single row)
CREATE TABLE IF NOT EXISTS live_status (
  id int PRIMARY KEY DEFAULT 1,
  is_live boolean NOT NULL DEFAULT false,
  stage_number text,
  program_name text,
  category text,
  status text NOT NULL DEFAULT 'OFFLINE',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT live_status_singleton CHECK (id = 1)
);

ALTER TABLE live_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_live_status" ON live_status;
CREATE POLICY "anon_select_live_status" ON live_status FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_live_status" ON live_status;
CREATE POLICY "auth_update_live_status" ON live_status FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Emergency contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_emergency_contacts" ON emergency_contacts;
CREATE POLICY "anon_select_emergency_contacts" ON emergency_contacts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_emergency_contacts" ON emergency_contacts;
CREATE POLICY "auth_insert_emergency_contacts" ON emergency_contacts FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_emergency_contacts" ON emergency_contacts;
CREATE POLICY "auth_update_emergency_contacts" ON emergency_contacts FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_emergency_contacts" ON emergency_contacts;
CREATE POLICY "auth_delete_emergency_contacts" ON emergency_contacts FOR DELETE
  TO authenticated USING (true);

-- Queries contact (single row)
CREATE TABLE IF NOT EXISTS queries_contact (
  id int PRIMARY KEY DEFAULT 1,
  name text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  CONSTRAINT queries_contact_singleton CHECK (id = 1)
);

ALTER TABLE queries_contact ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_queries_contact" ON queries_contact;
CREATE POLICY "anon_select_queries_contact" ON queries_contact FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_queries_contact" ON queries_contact;
CREATE POLICY "auth_update_queries_contact" ON queries_contact FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Settings (single row)
CREATE TABLE IF NOT EXISTS settings (
  id int PRIMARY KEY DEFAULT 1,
  madrasa_name text NOT NULL DEFAULT 'Madrasa Annual Program',
  madrasa_logo text,
  event_date date,
  venue text,
  address text,
  contact_phone text,
  contact_email text,
  copyright text,
  CONSTRAINT settings_singleton CHECK (id = 1)
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_settings" ON settings;
CREATE POLICY "auth_update_settings" ON settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_programs_category_id ON programs(category_id);
CREATE INDEX IF NOT EXISTS idx_participants_category ON participants(category);
CREATE INDEX IF NOT EXISTS idx_results_published ON results(published);
CREATE INDEX IF NOT EXISTS idx_schedule_sl_no ON schedule(sl_no);

-- Seed: settings singleton
INSERT INTO settings (id, madrasa_name, event_date, venue, address, contact_phone, contact_email, copyright)
VALUES (
  1,
  'Darul Huda Madrasa',
  '2026-12-20',
  'Madrasa Auditorium',
  'Madrasa Campus, Calicut, Kerala, India',
  '+91 98765 43210',
  'info@darulhuda.example',
  '© 2026 Darul Huda Madrasa. All rights reserved.'
)
ON CONFLICT (id) DO NOTHING;

-- Seed: live_status singleton
INSERT INTO live_status (id, is_live, status) VALUES (1, false, 'OFFLINE')
ON CONFLICT (id) DO NOTHING;

-- Seed: queries_contact singleton
INSERT INTO queries_contact (id, name, phone, whatsapp) VALUES (1, 'Usthad Abdul Rahman', '+91 98765 43210', '+91 98765 43210')
ON CONFLICT (id) DO NOTHING;

-- Seed: categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Senior', 'senior', 'Senior category programs', 1),
('Junior', 'junior', 'Junior category programs', 2),
('Sub Junior', 'sub-junior', 'Sub Junior category programs', 3)
ON CONFLICT (slug) DO NOTHING;

-- Seed: emergency contacts
INSERT INTO emergency_contacts (role, name, phone, whatsapp, sort_order) VALUES
('Main Usthad', 'Usthad Abdul Rahman', '+919876543210', '+919876543210', 1),
('Second Usthad', 'Usthad Yusuf', '+919876543211', '+919876543211', 2),
('Committee Member', 'Br. Mohammed Ali', '+919876543212', '+919876543212', 3)
ON CONFLICT DO NOTHING;

-- Seed: a few sample programs
INSERT INTO programs (program_number, name, category_id, description, sort_order)
SELECT x.num, x.name, c.id, x.descr, x.num FROM (VALUES
  (1, 'Quran Recitation', 'Senior', 'Quran recitation competition'),
  (2, 'Hifz Competition', 'Senior', 'Memorization competition'),
  (3, 'Elocution', 'Senior', 'Speech competition'),
  (4, 'Quran Recitation', 'Junior', 'Quran recitation for juniors'),
  (5, 'Nasheed', 'Junior', 'Nasheed competition'),
  (6, 'Quran Recitation', 'Sub Junior', 'Quran recitation for sub juniors'),
  (7, 'Storytelling', 'Sub Junior', 'Islamic stories')
) AS x(num, name, cat, descr)
JOIN categories c ON c.slug = x.cat
ON CONFLICT DO NOTHING;

-- Seed: a few schedule entries
INSERT INTO schedule (sl_no, start_time, end_time, program, category, stage) VALUES
(1, '09:00', '10:00', 'Quran Recitation (Senior)', 'Senior', 'Main Stage'),
(2, '10:00', '11:00', 'Hifz Competition (Senior)', 'Senior', 'Main Stage'),
(3, '11:00', '12:00', 'Elocution (Senior)', 'Senior', 'Stage 2'),
(4, '12:00', '13:00', 'Lunch Break', 'All', '—'),
(5, '13:00', '14:00', 'Quran Recitation (Junior)', 'Junior', 'Main Stage'),
(6, '14:00', '15:00', 'Nasheed (Junior)', 'Junior', 'Stage 2'),
(7, '15:00', '16:00', 'Quran Recitation (Sub Junior)', 'Sub Junior', 'Main Stage'),
(8, '16:00', '17:00', 'Storytelling (Sub Junior)', 'Sub Junior', 'Stage 2')
ON CONFLICT DO NOTHING;

-- Seed: a few participants
INSERT INTO participants (name, participant_number, category, class_name, program, photo_url) VALUES
('Aisha Mohammed', 'P001', 'Senior', 'Class 10', 'Quran Recitation', NULL),
('Fatima Ali', 'P002', 'Senior', 'Class 10', 'Hifz Competition', NULL),
('Hiba Rahman', 'P003', 'Junior', 'Class 7', 'Quran Recitation', NULL),
('Mohammed Yusuf', 'P004', 'Junior', 'Class 7', 'Nasheed', NULL),
('Ibrahim Sayed', 'P005', 'Sub Junior', 'Class 4', 'Quran Recitation', NULL),
('Zainab Khan', 'P006', 'Sub Junior', 'Class 4', 'Storytelling', NULL)
ON CONFLICT (participant_number) DO NOTHING;

-- Seed: one published result
INSERT INTO results (program_number, program_name, category, first_prize, second_prize, third_prize, published) VALUES
(1, 'Quran Recitation', 'Senior', 'Aisha Mohammed (P001)', 'Fatima Ali (P002)', 'Sara Ibrahim (P007)', true)
ON CONFLICT DO NOTHING;
