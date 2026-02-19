-- Fix script for Taskive Tech schema
-- Run this in Supabase SQL Editor if you encounter errors submitting consultations

-- 1. Ensure all columns exist in consultations table
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS estimated_start_time VARCHAR(100),
ADD COLUMN IF NOT EXISTS preferred_date DATE,
ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(50);

-- 2. Ensure testimonials table exists
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    quote TEXT NOT NULL,
    avatar VARCHAR(10), -- Initials
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ensure RLS for testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active testimonials" ON testimonials;
CREATE POLICY "Anyone can view active testimonials" ON testimonials
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Only admin can manage testimonials" ON testimonials;
CREATE POLICY "Only admin can manage testimonials" ON testimonials
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'info@taskivetech.tech'
    );
