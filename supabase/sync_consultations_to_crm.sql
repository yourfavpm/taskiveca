-- COMPREHENSIVE CRM SETUP FOR TASKIVE TECH
-- This script creates the lead status types, tables, RLS policies, and sync triggers.

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE public.lead_lifecycle_status AS ENUM (
        'Consultation Booked',
        'Discovery Completed',
        'Qualified Lead',
        'Proposal Sent',
        'Negotiation / Review',
        'Contract Signed',
        'Project In Progress',
        'Delivered / Handed Over',
        'Retainer / Ongoing',
        'Closed – Not a Fit',
        'Closed – Lost'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    industry VARCHAR(100),
    country VARCHAR(100),
    source VARCHAR(100) DEFAULT 'Website Consultation',
    status public.lead_lifecycle_status DEFAULT 'Consultation Booked',
    assigned_owner UUID, -- Linked to auth.users if needed
    notes TEXT,
    consultation_date TIMESTAMPTZ,
    proposal_sent_date TIMESTAMPTZ,
    contract_signed_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_crm_lead_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS public.crm_financials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    agreed_value DECIMAL(12, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_model VARCHAR(50) CHECK (payment_model IN ('One-time', 'Milestone-based', 'Retainer')),
    amount_invoiced DECIMAL(12, 2) DEFAULT 0.00,
    amount_paid DECIMAL(12, 2) DEFAULT 0.00,
    outstanding_balance DECIMAL(12, 2) GENERATED ALWAYS AS (agreed_value - amount_paid) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    old_status public.lead_lifecycle_status,
    new_status public.lead_lifecycle_status NOT NULL,
    changed_by UUID,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- 3. SECURITY (RLS)
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_status_history ENABLE ROW LEVEL SECURITY;

-- Assuming is_admin() function exists from master_setup.sql
DROP POLICY IF EXISTS "Admins can manage CRM leads" ON public.crm_leads;
CREATE POLICY "Admins can manage CRM leads" ON public.crm_leads
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage CRM financials" ON public.crm_financials;
CREATE POLICY "Admins can manage CRM financials" ON public.crm_financials
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view CRM status history" ON public.crm_status_history;
CREATE POLICY "Admins can view CRM status history" ON public.crm_status_history
    FOR SELECT USING (public.is_admin());

-- 4. SYNC FUNCTIONS & TRIGGERS

-- Lead creation status history
CREATE OR REPLACE FUNCTION public.log_lead_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.crm_status_history (lead_id, old_status, new_status)
    VALUES (NEW.id, NULL, NEW.status);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_lead_creation ON public.crm_leads;
CREATE TRIGGER tr_lead_creation
    AFTER INSERT ON public.crm_leads
    FOR EACH ROW EXECUTE FUNCTION public.log_lead_creation();

-- Sync consultation to lead
CREATE OR REPLACE FUNCTION public.sync_consultation_to_crm()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.crm_leads (
        consultation_id,
        company_name,
        contact_name,
        email,
        phone,
        industry,
        country,
        source,
        status,
        notes,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.company, 'Personal'),
        NEW.name,
        NEW.email,
        NEW.phone,
        NEW.project_type,
        NEW.country,
        'Website Consultation',
        'Consultation Booked',
        NEW.description,
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (email) DO UPDATE SET
        updated_at = EXCLUDED.updated_at,
        notes = crm_leads.notes || '\n\nNew Consultation: ' || EXCLUDED.notes;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_consultation_to_crm ON public.consultations;
CREATE TRIGGER tr_sync_consultation_to_crm
AFTER INSERT ON public.consultations
FOR EACH ROW EXECUTE FUNCTION public.sync_consultation_to_crm();

-- 5. MANUAL DATA MIGRATION
INSERT INTO public.crm_leads (
    consultation_id,
    company_name,
    contact_name,
    email,
    phone,
    industry,
    country,
    source,
    status,
    notes,
    created_at,
    updated_at
)
SELECT 
    id,
    COALESCE(company, 'Personal'),
    name,
    email,
    phone,
    project_type,
    country,
    'Website Consultation',
    'Consultation Booked',
    description,
    created_at,
    updated_at
FROM public.consultations
ON CONFLICT (email) DO NOTHING;
