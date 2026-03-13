-- Phase 4: Role-Based Access Control (RBAC) Setup

-- 1. Create Role Enum Type
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'editor', 'viewer');
    END IF;
END $$;

-- 2. Add Role Column to Admins Table
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS role admin_role DEFAULT 'super_admin';

-- 3. Helper Functions for RLS
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS admin_role AS $$
  SELECT role FROM public.admins 
  WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')
    AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Admins Table Policies
-- Allow anyone to read the admins table (required for auth check)
-- Handled by existing "Public read access for admins table" policy

-- Allow only super admins to modify the admins table
DROP POLICY IF EXISTS "Only super admins can manage admins" ON public.admins;
CREATE POLICY "Only super admins can manage admins" ON public.admins
    FOR ALL
    USING (is_super_admin());

-- 5. Helper Function for Updated At
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger to automatically update updated_at if doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_admins') THEN
        ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
        CREATE TRIGGER set_updated_at_admins
            BEFORE UPDATE ON public.admins
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
