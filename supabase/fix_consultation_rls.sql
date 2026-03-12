-- Fix RLS for consultations table to allow public submissions
-- Previous schema updates may have inadvertently dropped the INSERT policy.

-- 1. Ensure RLS is enabled
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing insert policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can submit consultation" ON consultations;
DROP POLICY IF EXISTS "Public can submit consultation" ON consultations;

-- 3. Create a fresh policy for public inserts
CREATE POLICY "Public can submit consultation" ON consultations
    FOR INSERT WITH CHECK (true);

-- 4. Verify admin policies (keeping them for dashboard access)
DROP POLICY IF EXISTS "Only admin can view consultations" ON consultations;
CREATE POLICY "Only admin can view consultations" ON consultations
    FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Only admin can update consultations" ON consultations;
CREATE POLICY "Only admin can update consultations" ON consultations
    FOR UPDATE USING (is_admin());
