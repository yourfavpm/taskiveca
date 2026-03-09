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
