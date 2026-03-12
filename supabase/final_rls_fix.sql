-- Final RLS fix for both Consultations and Testimonials

-- 1. Consultations
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can submit consultation" ON consultations;
DROP POLICY IF EXISTS "Anyone can submit consultation" ON consultations;
CREATE POLICY "Public can submit consultation" ON consultations
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admin can view consultations" ON consultations;
CREATE POLICY "Only admin can view consultations" ON consultations
    FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Only admin can update consultations" ON consultations;
CREATE POLICY "Only admin can update consultations" ON consultations
    FOR UPDATE USING (is_admin());

-- 2. Testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for testimonials" ON testimonials;
CREATE POLICY "Public read access for testimonials" ON testimonials
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
CREATE POLICY "Admins can manage testimonials" ON testimonials
    FOR ALL USING (is_admin());
