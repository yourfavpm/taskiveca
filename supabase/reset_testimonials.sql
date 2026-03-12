-- 1. Clear all existing data
TRUNCATE TABLE testimonials;

-- 2. Ensure RLS is enabled
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- 3. DROP all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access for testimonials" ON testimonials;
DROP POLICY IF EXISTS "Anyone can view testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Only admin can manage testimonials" ON testimonials;

-- 4. Set fresh policies
-- Allow anyone to see active testimonials
CREATE POLICY "Public read access for testimonials" ON testimonials
    FOR SELECT USING (active = true);

-- Allow admins to do EVERYTHING (Insert, Update, Delete, Select all)
CREATE POLICY "Admins can manage testimonials" ON testimonials
    FOR ALL USING (is_admin());
