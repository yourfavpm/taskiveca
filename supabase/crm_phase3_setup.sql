-- Phase 3: Credentials Vault and Communication Setup
-- This script safely creates tables for project credentials and communication logs.

-- 1. Project Credentials Table
CREATE TABLE IF NOT EXISTS public.project_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    platform_name TEXT NOT NULL,
    url TEXT,
    username TEXT,
    password_hash TEXT, -- Storing encrypted/masked password (in a real world scenario this should go through a KMS)
    password_hint TEXT,
    notes TEXT,
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for credentials
ALTER TABLE public.project_credentials ENABLE ROW LEVEL SECURITY;

-- 2. Communication Logs Table
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('email', 'note', 'meeting', 'call')),
    subject TEXT,
    content TEXT NOT NULL,
    direction TEXT CHECK (direction IN ('inbound', 'outbound', 'internal')),
    logged_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CHECK (project_id IS NOT NULL OR lead_id IS NOT NULL)
);

-- Enable RLS for communication logs
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Requires is_admin() function from Phase 1)
-- Credentials
CREATE POLICY "Admins can view credentials"
    ON public.project_credentials FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can insert credentials"
    ON public.project_credentials FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update credentials"
    ON public.project_credentials FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete credentials"
    ON public.project_credentials FOR DELETE
    USING (public.is_admin());

-- Communications
CREATE POLICY "Admins can view communication logs"
    ON public.communication_logs FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can insert communication logs"
    ON public.communication_logs FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update communication logs"
    ON public.communication_logs FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete communication logs"
    ON public.communication_logs FOR DELETE
    USING (public.is_admin());

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_project_credentials_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_credentials_updated_at
    BEFORE UPDATE ON public.project_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_project_credentials_updated_at_column();

CREATE OR REPLACE FUNCTION update_communication_logs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_communication_logs_updated_at
    BEFORE UPDATE ON public.communication_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_communication_logs_updated_at_column();
