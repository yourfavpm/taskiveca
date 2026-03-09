-- 1. Create Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure email is unique and case-insensitive
CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_email_lower ON public.admins (LOWER(email));

-- 2. Enable RLS on Admins Table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public Read for Admins table (required for frontend check)
DROP POLICY IF EXISTS "Public read access for admins table" ON public.admins;
CREATE POLICY "Public read access for admins table" ON public.admins
    FOR SELECT USING (true);

-- 4. Initial Seed: Add the primary admin email
INSERT INTO public.admins (email)
VALUES ('info@taskivetech.tech')
ON CONFLICT (email) DO NOTHING;

-- 5. Update is_admin function to check the admins table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update Admin-Only Table Policies (with existence checks)
DO $$ 
BEGIN
    -- Company Settings
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'company_settings') THEN
        DROP POLICY IF EXISTS "Only admin can update company settings" ON company_settings;
        DROP POLICY IF EXISTS "Admins can manage company settings" ON company_settings;
        CREATE POLICY "Admins can manage company settings" ON company_settings FOR ALL USING (is_admin());
    END IF;

    -- Consultations
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'consultations') THEN
        DROP POLICY IF EXISTS "Only admin can view consultations" ON consultations;
        CREATE POLICY "Only admin can view consultations" ON consultations FOR SELECT USING (is_admin());
        
        DROP POLICY IF EXISTS "Only admin can update consultations" ON consultations;
        CREATE POLICY "Only admin can update consultations" ON consultations FOR UPDATE USING (is_admin());
    END IF;

    -- Case Studies
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'case_studies') THEN
        DROP POLICY IF EXISTS "Only admin can manage case studies" ON case_studies;
        CREATE POLICY "Only admin can manage case studies" ON case_studies FOR ALL USING (is_admin());
    END IF;

    -- Admin Notes
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_notes') THEN
        DROP POLICY IF EXISTS "Only admin can manage admin notes" ON admin_notes;
        CREATE POLICY "Only admin can manage admin notes" ON admin_notes FOR ALL USING (is_admin());
    END IF;
END $$;
