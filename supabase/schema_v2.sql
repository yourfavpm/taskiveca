-- Schema Update V2: Admin, Booking, and Company Settings

-- 1. Update Consultations Table with Booking Details
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS preferred_date DATE,
ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(50); -- Using VARCHAR to allow ranges like "Morning", "2:00 PM"

-- 2. Create Company Settings Table (Singleton)
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    social_tiktok VARCHAR(255),
    social_instagram VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ensure only one row exists
    is_singleton BOOLEAN DEFAULT true UNIQUE CHECK (is_singleton)
);

-- Initialize with default/empty values if not exists
INSERT INTO company_settings (contact_email, contact_phone, address, social_tiktok, social_instagram)
VALUES ('info@taskivetech.tech', '', '', '', '')
ON CONFLICT (is_singleton) DO NOTHING;

-- 3. Security: Admin Check Function
-- This function checks if the current user's email matches the admin email.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.jwt() ->> 'email' = 'info@taskivetech.tech';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update RLS Policies

-- Company Settings: Public Read
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view company settings" ON company_settings
    FOR SELECT USING (true);

-- Company Settings: Admin Update Only
CREATE POLICY "Only admin can update company settings" ON company_settings
    FOR UPDATE USING (is_admin());

-- Consultations: Admin View Only (Stricter than "authenticated")
DROP POLICY IF EXISTS "Authenticated users can view consultations" ON consultations;
CREATE POLICY "Only admin can view consultations" ON consultations
    FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Authenticated users can update consultations" ON consultations;
CREATE POLICY "Only admin can update consultations" ON consultations
    FOR UPDATE USING (is_admin());

-- Case Studies: Admin Manage Only
DROP POLICY IF EXISTS "Authenticated users can manage case studies" ON case_studies;
CREATE POLICY "Only admin can manage case studies" ON case_studies
    FOR ALL USING (is_admin());

-- Admin Notes: Admin Manage Only
DROP POLICY IF EXISTS "Authenticated users can manage admin notes" ON admin_notes;
CREATE POLICY "Only admin can manage admin notes" ON admin_notes
    FOR ALL USING (is_admin());
