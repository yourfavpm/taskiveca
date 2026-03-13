-- Supabase Storage Setup for Case Studies

-- 1. Create a bucket for case studies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('case-studies', 'case-studies', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies

-- Allow public to view images
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'case-studies');

-- Allow authenticated users (admins) to upload images
CREATE POLICY "Admins can upload images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'case-studies' 
        AND (SELECT is_admin())
    );

-- Allow admins to delete images
CREATE POLICY "Admins can delete images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'case-studies' 
        AND (SELECT is_admin())
    );

-- Allow admins to update images
CREATE POLICY "Admins can update images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'case-studies' 
        AND (SELECT is_admin())
    );
