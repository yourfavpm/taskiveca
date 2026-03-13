-- ============================================================
-- TASKIVE CRM OPERATIONS PLATFORM - FULL DATABASE SETUP
-- Run this entire script in Supabase SQL Editor.
-- It is idempotent — safe to run multiple times.
-- ============================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ENUMS
-- ============================================================

-- Drop old enum if it exists (requires dropping dependent columns first)
-- We use text-based status instead of enum for easier migration
-- The application layer will enforce valid statuses via TypeScript types.

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- CRM Leads
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
    status TEXT DEFAULT 'Consultation Booked',
    assigned_owner UUID,
    notes TEXT,
    consultation_date TIMESTAMPTZ,
    proposal_sent_date TIMESTAMPTZ,
    contract_signed_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_crm_lead_email UNIQUE (email)
);

-- Add country column if missing from older schema
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- CRM Financials (Agreement/Contract level)
CREATE TABLE IF NOT EXISTS public.crm_financials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    project_title VARCHAR(255),
    service_name VARCHAR(255),
    pricing_structure TEXT DEFAULT 'one-off' CHECK (pricing_structure IN ('one-off', 'milestone')),
    payment_type TEXT CHECK (payment_type IN ('full-upfront', 'deposit-balance')),
    currency VARCHAR(10) DEFAULT 'USD',
    agreed_value DECIMAL(12, 2) DEFAULT 0.00,
    deposit_amount DECIMAL(12, 2) DEFAULT 0.00,
    balance_amount DECIMAL(12, 2) DEFAULT 0.00,
    balance_due_date DATE,
    scope_notes TEXT,
    expected_start_date DATE,
    payment_notes TEXT,
    amount_invoiced DECIMAL(12, 2) DEFAULT 0.00,
    amount_paid DECIMAL(12, 2) DEFAULT 0.00,
    outstanding_balance DECIMAL(12, 2) GENERATED ALWAYS AS (agreed_value - amount_paid) STORED,
    payment_model VARCHAR(50) DEFAULT 'One-time',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns if table already existed
DO $$ BEGIN
    ALTER TABLE public.crm_financials ADD COLUMN IF NOT EXISTS project_title VARCHAR(255);
    ALTER TABLE public.crm_financials ADD COLUMN IF NOT EXISTS service_name VARCHAR(255);
    ALTER TABLE public.crm_financials ADD COLUMN IF NOT EXISTS pricing_structure TEXT DEFAULT 'one-off';
    ALTER TABLE public.crm_financials ADD COLUMN IF NOT EXISTS payment_type TEXT;
    ALTER TABLE public.crm_financials ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(12,2) DEFAULT 0.00;
    ALTER TABLE public.crm_financials ADD COLUMN IF NOT EXISTS balance_amount DECIMAL(12,2) DEFAULT 0.00;
    ALTER TABLE public.crm_financials ADD COLUMN IF NOT EXISTS balance_due_date DATE;
    ALTER TABLE public.crm_financials ADD COLUMN IF NOT EXISTS scope_notes TEXT;
    ALTER TABLE public.crm_financials ADD COLUMN IF NOT EXISTS expected_start_date DATE;
    ALTER TABLE public.crm_financials ADD COLUMN IF NOT EXISTS payment_notes TEXT;
EXCEPTION WHEN others THEN null;
END $$;

-- Project Milestones
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    financial_id UUID REFERENCES public.crm_financials(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    due_trigger TEXT,
    expected_due_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    amount_paid DECIMAL(12, 2) DEFAULT 0.00,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Records (individual payments)
CREATE TABLE IF NOT EXISTS public.payment_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    financial_id UUID REFERENCES public.crm_financials(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT,
    reference_id VARCHAR(255),
    allocation_target TEXT DEFAULT 'general' CHECK (allocation_target IN ('deposit', 'balance', 'milestone', 'general')),
    notes TEXT,
    recorded_by TEXT,
    is_voided BOOLEAN DEFAULT false,
    void_reason TEXT,
    voided_at TIMESTAMPTZ,
    voided_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Additional Charges / Change Orders
CREATE TABLE IF NOT EXISTS public.additional_charges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    financial_id UUID REFERENCES public.crm_financials(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    date_added DATE DEFAULT CURRENT_DATE,
    added_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM Status History (Audit Trail for status changes)
CREATE TABLE IF NOT EXISTS public.crm_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Audit Logs (immutable, comprehensive)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    previous_value JSONB,
    new_value JSONB,
    performed_by TEXT,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.additional_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- CRM Leads
DROP POLICY IF EXISTS "Admins can manage CRM leads" ON public.crm_leads;
CREATE POLICY "Admins can manage CRM leads" ON public.crm_leads
    FOR ALL USING (public.is_admin());

-- CRM Financials
DROP POLICY IF EXISTS "Admins can manage CRM financials" ON public.crm_financials;
CREATE POLICY "Admins can manage CRM financials" ON public.crm_financials
    FOR ALL USING (public.is_admin());

-- Status History
DROP POLICY IF EXISTS "Admins can view CRM status history" ON public.crm_status_history;
CREATE POLICY "Admins can view CRM status history" ON public.crm_status_history
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "System can insert status history" ON public.crm_status_history;
CREATE POLICY "System can insert status history" ON public.crm_status_history
    FOR INSERT WITH CHECK (true);

-- Milestones
DROP POLICY IF EXISTS "Admins can manage milestones" ON public.project_milestones;
CREATE POLICY "Admins can manage milestones" ON public.project_milestones
    FOR ALL USING (public.is_admin());

-- Payment Records
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payment_records;
CREATE POLICY "Admins can manage payments" ON public.payment_records
    FOR ALL USING (public.is_admin());

-- Additional Charges
DROP POLICY IF EXISTS "Admins can manage charges" ON public.additional_charges;
CREATE POLICY "Admins can manage charges" ON public.additional_charges
    FOR ALL USING (public.is_admin());

-- Audit Logs (read-only for admins, system writes)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- ============================================================
-- 4. TRIGGER: Consultation → CRM Lead Auto-Sync
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_consultation_to_crm()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.crm_leads (
        consultation_id, company_name, contact_name, email, phone,
        industry, country, source, status, notes, created_at, updated_at
    )
    VALUES (
        NEW.id, COALESCE(NEW.company, 'Personal'), NEW.name, NEW.email, NEW.phone,
        NEW.project_type, NEW.country, 'Website Consultation', 'Consultation Booked',
        NEW.description, NEW.created_at, NEW.updated_at
    )
    ON CONFLICT (email) DO UPDATE SET
        updated_at = EXCLUDED.updated_at,
        notes = CASE
            WHEN crm_leads.notes IS NOT NULL THEN crm_leads.notes || E'\n\nNew Consultation: ' || EXCLUDED.notes
            ELSE EXCLUDED.notes
        END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_consultation_to_crm ON public.consultations;
CREATE TRIGGER tr_sync_consultation_to_crm
AFTER INSERT ON public.consultations
FOR EACH ROW EXECUTE FUNCTION public.sync_consultation_to_crm();

-- ============================================================
-- 5. TRIGGER: Lead Status Change → History Log
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.crm_status_history (lead_id, old_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_lead_status_change ON public.crm_leads;
CREATE TRIGGER tr_lead_status_change
    AFTER UPDATE OF status ON public.crm_leads
    FOR EACH ROW EXECUTE FUNCTION public.log_lead_status_change();

-- Lead creation status log
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

-- ============================================================
-- 6. BACKFILL: Sync existing consultations to CRM
-- ============================================================

INSERT INTO public.crm_leads (
    consultation_id, company_name, contact_name, email, phone,
    industry, country, source, status, notes, created_at, updated_at
)
SELECT
    id, COALESCE(company, 'Personal'), name, email, phone,
    project_type, country, 'Website Consultation', 'Consultation Booked',
    description, created_at, updated_at
FROM public.consultations
ON CONFLICT (email) DO NOTHING;
