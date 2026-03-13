-- ============================================================
-- TASKIVE CRM OPERATIONS PLATFORM - PHASE 2: PROJECTS & DOCUMENTS
-- ============================================================

-- Project Delivery Statuses
-- 'Planning' | 'In Development' | 'Testing' | 'UAT' | 'Launch' | 'Maintenance' | 'Completed' | 'On Hold' | 'Cancelled'

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    financial_id UUID REFERENCES public.crm_financials(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    status TEXT DEFAULT 'Planning',
    description TEXT,
    start_date DATE,
    estimated_end_date DATE,
    actual_end_date DATE,
    repo_url TEXT,
    staging_url TEXT,
    production_url TEXT,
    pm_assigned UUID,
    technical_lead UUID,
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Documents
CREATE TABLE IF NOT EXISTS public.project_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    category TEXT DEFAULT 'general' CHECK (category IN ('contract', 'invoice', 'brief', 'design', 'technical', 'credentials', 'general')),
    uploaded_by TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Projects Policy
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
CREATE POLICY "Admins can manage projects" ON public.projects
    FOR ALL USING (public.is_admin());

-- Project Documents Policy
DROP POLICY IF EXISTS "Admins can manage project documents" ON public.project_documents;
CREATE POLICY "Admins can manage project documents" ON public.project_documents
    FOR ALL USING (public.is_admin());

-- Storage Bucket for Project Documents
-- Note: Bucket creation usually requires superuser or manual setup in Supabase dashboard
-- But we define the policy here in case the bucket is created
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-documents', 'project-documents', false);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_projects_updated_at ON public.projects;
CREATE TRIGGER tr_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_project_documents_updated_at ON public.project_documents;
CREATE TRIGGER tr_project_documents_updated_at
BEFORE UPDATE ON public.project_documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Automatic Project Creation Trigger (Optional based on business logic)
-- We'll manually create projects for now to ensure agency oversight
-- but here's a helper function if needed.
