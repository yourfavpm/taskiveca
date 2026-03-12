-- 1. Make is_admin() dynamic by checking the admins table
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    company VARCHAR(255),
    quote TEXT NOT NULL,
    avatar VARCHAR(10), -- Initials
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS and Set Policies for Testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for testimonials" ON testimonials;
CREATE POLICY "Public read access for testimonials" ON testimonials
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
CREATE POLICY "Admins can manage testimonials" ON testimonials
    FOR ALL USING (is_admin());

-- 4. Ensure Case Studies has proper RLS for all actions
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for published case studies" ON case_studies;
CREATE POLICY "Public read access for published case studies" ON case_studies
    FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Admins can manage case studies" ON case_studies;
CREATE POLICY "Admins can manage case studies" ON case_studies
    FOR ALL USING (is_admin());

-- 5. Ensure Company Settings RLS is correct for Upsert (Insert + Update)
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view company settings" ON company_settings;
CREATE POLICY "Anyone can view company settings" ON company_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage company settings" ON company_settings;
CREATE POLICY "Admins can manage company settings" ON company_settings
    FOR ALL USING (is_admin());
