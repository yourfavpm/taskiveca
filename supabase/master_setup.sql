-- MASTER DATABASE SETUP FOR TASKIVE TECH
-- This script ensures all tables, columns, and policies exist.
-- Run this in your Supabase SQL Editor.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- Admins
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultations
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(100),
    website VARCHAR(255),
    country VARCHAR(100),
    project_type VARCHAR(100) NOT NULL,
    estimated_start_time VARCHAR(100),
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'scheduled', 'completed', 'cancelled')),
    scheduled_at TIMESTAMPTZ,
    preferred_date DATE,
    preferred_time VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was already created earlier
DO $$ 
BEGIN
    ALTER TABLE consultations ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
    ALTER TABLE consultations ADD COLUMN IF NOT EXISTS website VARCHAR(255);
    ALTER TABLE consultations ADD COLUMN IF NOT EXISTS preferred_date DATE;
    ALTER TABLE consultations ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(50);
EXCEPTION
    WHEN others THEN null;
END $$;

-- Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    company VARCHAR(255),
    quote TEXT NOT NULL,
    avatar VARCHAR(10),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Studies
CREATE TABLE IF NOT EXISTS public.case_studies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    industry VARCHAR(100),
    challenge TEXT,
    solution TEXT,
    process JSONB,
    outcome TEXT,
    images JSONB,
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Notes
CREATE TABLE IF NOT EXISTS public.admin_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Settings
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    social_tiktok VARCHAR(255),
    social_instagram VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_singleton BOOLEAN DEFAULT true UNIQUE CHECK (is_singleton)
);

-- 3. FUNCTIONS

-- is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SECURITY (RLS)

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Admins
DROP POLICY IF EXISTS "Public read access for admins table" ON public.admins;
CREATE POLICY "Public read access for admins table" ON public.admins FOR SELECT USING (true);

-- Consultations
DROP POLICY IF EXISTS "Public can submit consultation" ON consultations;
CREATE POLICY "Public can submit consultation" ON consultations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Only admin can view consultations" ON consultations;
CREATE POLICY "Only admin can view consultations" ON consultations FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "Only admin can update consultations" ON consultations;
CREATE POLICY "Only admin can update consultations" ON consultations FOR UPDATE USING (is_admin());

-- Testimonials
DROP POLICY IF EXISTS "Public read access for testimonials" ON testimonials;
CREATE POLICY "Public read access for testimonials" ON testimonials FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL USING (is_admin());

-- Case Studies
DROP POLICY IF EXISTS "Public read access for published case studies" ON case_studies;
CREATE POLICY "Public read access for published case studies" ON case_studies FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Admins can manage case studies" ON case_studies;
CREATE POLICY "Admins can manage case studies" ON case_studies FOR ALL USING (is_admin());

-- Admin Notes
DROP POLICY IF EXISTS "Only admin can manage admin notes" ON admin_notes;
CREATE POLICY "Only admin can manage admin notes" ON admin_notes FOR ALL USING (is_admin());

-- Company Settings
DROP POLICY IF EXISTS "Anyone can view company settings" ON company_settings;
CREATE POLICY "Anyone can view company settings" ON company_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage company settings" ON company_settings;
CREATE POLICY "Admins can manage company settings" ON company_settings FOR ALL USING (is_admin());

-- 5. INITIAL DATA

-- Seed primary admin
INSERT INTO public.admins (email)
VALUES ('info@taskivetech.tech')
ON CONFLICT (email) DO NOTHING;

-- Seed company settings
INSERT INTO public.company_settings (contact_email, contact_phone, address, social_tiktok, social_instagram)
VALUES ('info@taskivetech.tech', '', '', '', '')
ON CONFLICT (is_singleton) DO NOTHING;

-- CLEAR TESTIMONIALS AS REQUESTED
TRUNCATE TABLE public.testimonials;
