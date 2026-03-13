// Database types for Taskive Tech

export interface Consultation {
    id: string
    name: string
    email: string
    phone?: string
    company?: string
    website?: string
    country?: string
    project_type: string
    estimated_start_time?: string
    description: string
    status: 'new' | 'scheduled' | 'completed' | 'cancelled'
    scheduled_at?: string
    preferred_date?: string
    preferred_time?: string
    created_at: string
    updated_at: string
}

export interface CompanySettings {
    id: string
    contact_email: string
    contact_phone: string
    address: string
    social_tiktok: string
    social_instagram: string
}

export interface CaseStudy {
    id: string
    slug: string
    title: string
    summary: string
    industry?: string
    challenge?: string
    solution?: string
    process?: string[]
    outcome?: string
    images?: string[]
    featured: boolean
    published: boolean
    created_at: string
    updated_at: string
}

export interface AdminNote {
    id: string
    consultation_id: string
    note: string
    created_at: string
}

export type ProjectType =
    | 'landing-page'
    | 'portfolio-website'
    | 'ecommerce'
    | 'web-application'
    | 'saas-mvp'
    | 'ai-automation'
    | 'product-design'
    | 'other'

export const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
    { value: 'landing-page', label: 'Landing Page' },
    { value: 'portfolio-website', label: 'Portfolio Website' },
    { value: 'ecommerce', label: 'E-commerce Website' },
    { value: 'web-application', label: 'Web Application' },
    { value: 'saas-mvp', label: 'SaaS & MVP Development' },
    { value: 'ai-automation', label: 'AI & Automation' },
    { value: 'product-design', label: 'Product Design (UI/UX)' },
    { value: 'other', label: 'Other' },
]

// ============================================================
// CRM Types
// ============================================================

export type LeadLifecycleStatus =
    | 'Consultation Booked'
    | 'Consultation Completed'
    | 'Qualification Review'
    | 'Proposal Sent'
    | 'Follow-Up / Discussion'
    | 'Approved — Awaiting Payment'
    | 'Deposit Paid'
    | 'Onboarding Started'
    | 'Project In Development'
    | 'Closed Lost'
    | 'No Show'
    | 'Budget Mismatch'
    | 'Not Interested'

export const LEAD_STATUSES: { value: LeadLifecycleStatus; label: string; color: string }[] = [
    { value: 'Consultation Booked', label: 'Consultation Booked', color: '#3b82f6' },
    { value: 'Consultation Completed', label: 'Consultation Completed', color: '#6366f1' },
    { value: 'Qualification Review', label: 'Qualification Review', color: '#8b5cf6' },
    { value: 'Proposal Sent', label: 'Proposal Sent', color: '#f59e0b' },
    { value: 'Follow-Up / Discussion', label: 'Follow-Up / Discussion', color: '#f97316' },
    { value: 'Approved — Awaiting Payment', label: 'Approved — Awaiting Payment', color: '#10b981' },
    { value: 'Deposit Paid', label: 'Deposit Paid', color: '#059669' },
    { value: 'Onboarding Started', label: 'Onboarding Started', color: '#0ea5e9' },
    { value: 'Project In Development', label: 'Project In Development', color: '#0284c7' },
    { value: 'Closed Lost', label: 'Closed Lost', color: '#ef4444' },
    { value: 'No Show', label: 'No Show', color: '#dc2626' },
    { value: 'Budget Mismatch', label: 'Budget Mismatch', color: '#b91c1c' },
    { value: 'Not Interested', label: 'Not Interested', color: '#991b1b' },
]

export const ACTIVE_STATUSES: LeadLifecycleStatus[] = [
    'Consultation Booked',
    'Consultation Completed',
    'Qualification Review',
    'Proposal Sent',
    'Follow-Up / Discussion',
    'Approved — Awaiting Payment',
    'Deposit Paid',
    'Onboarding Started',
    'Project In Development',
]

export const CLOSED_STATUSES: LeadLifecycleStatus[] = [
    'Closed Lost',
    'No Show',
    'Budget Mismatch',
    'Not Interested',
]

export interface CRMLead {
    id: string
    consultation_id?: string
    company_name: string
    contact_name: string
    email: string
    phone?: string
    industry?: string
    country?: string
    source: string
    status: LeadLifecycleStatus
    assigned_owner?: string
    notes?: string
    consultation_date?: string
    proposal_sent_date?: string
    contract_signed_date?: string
    created_at: string
    updated_at: string
}

export interface CRMFinancials {
    id: string
    lead_id: string
    project_title?: string
    service_name?: string
    pricing_structure: 'one-off' | 'milestone'
    payment_type?: 'full-upfront' | 'deposit-balance'
    currency: string
    agreed_value: number
    deposit_amount: number
    balance_amount: number
    balance_due_date?: string
    scope_notes?: string
    expected_start_date?: string
    payment_notes?: string
    amount_invoiced: number
    amount_paid: number
    outstanding_balance: number
    payment_model: 'One-time' | 'Milestone-based' | 'Retainer'
    created_at: string
    updated_at: string
}

export interface ProjectMilestone {
    id: string
    financial_id: string
    title: string
    description?: string
    amount: number
    due_trigger?: string
    expected_due_date?: string
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
    amount_paid: number
    sort_order: number
    created_at: string
    updated_at: string
}

export interface PaymentRecord {
    id: string
    lead_id: string
    financial_id: string
    milestone_id?: string
    amount: number
    payment_date: string
    payment_method?: string
    reference_id?: string
    allocation_target: 'deposit' | 'balance' | 'milestone' | 'general'
    notes?: string
    recorded_by?: string
    is_voided: boolean
    void_reason?: string
    voided_at?: string
    voided_by?: string
    created_at: string
    updated_at: string
}

export interface AdditionalCharge {
    id: string
    lead_id: string
    financial_id: string
    title: string
    description?: string
    amount: number
    date_added: string
    added_by?: string
    created_at: string
}

export interface CRMStatusHistory {
    id: string
    lead_id: string
    old_status?: LeadLifecycleStatus
    new_status: LeadLifecycleStatus
    changed_by?: string
    changed_at: string
    notes?: string
}

export interface AuditLogEntry {
    id: string
    action_type: string
    entity_type: string
    entity_id?: string
    previous_value?: Record<string, unknown>
    new_value?: Record<string, unknown>
    performed_by?: string
    reason?: string
    metadata?: Record<string, unknown>
    created_at: string
}

export interface AnalyticsMetrics {
    totalLeads: number
    activeLeads: number
    conversionRate: number
    totalRevenue: number
    totalPaid: number
    totalOutstanding: number
    projectedRevenue: number
    pipelineValue: number
    averageDealSize: number
    winRate: number
    conversionFunnel: {
        status: string
        count: number
        percentage: number
        color: string
    }[]
    revenueData: {
        byMonth: { month: string; signed: number; paid: number }[]
        byIndustry: { industry: string; value: number }[]
        byCountry: { country: string; value: number; count: number }[]
    }
    leadsTrend: {
        month: string
        newLeads: number
        converted: number
    }[]
    recentActivity: {
        date: string
        action: string
        lead: string
    }[]
}

export type ProjectStatus =
    | 'Planning'
    | 'In Development'
    | 'Testing'
    | 'UAT'
    | 'Launch'
    | 'Maintenance'
    | 'Completed'
    | 'On Hold'
    | 'Cancelled'

export const PROJECT_STATUSES: { value: ProjectStatus; label: string; color: string }[] = [
    { value: 'Planning', label: 'Planning', color: '#94a3b8' },
    { value: 'In Development', label: 'In Development', color: '#3b82f6' },
    { value: 'Testing', label: 'Testing', color: '#8b5cf6' },
    { value: 'UAT', label: 'User Acceptance Testing', color: '#f59e0b' },
    { value: 'Launch', label: 'Launch', color: '#10b981' },
    { value: 'Maintenance', label: 'Maintenance', color: '#14b8a6' },
    { value: 'Completed', label: 'Completed', color: '#059669' },
    { value: 'On Hold', label: 'On Hold', color: '#f97316' },
    { value: 'Cancelled', label: 'Cancelled', color: '#ef4444' },
]

export interface Project {
    id: string
    lead_id?: string
    financial_id?: string
    title: string
    client_name: string
    status: ProjectStatus
    description?: string
    start_date?: string
    estimated_end_date?: string
    actual_end_date?: string
    repo_url?: string
    staging_url?: string
    production_url?: string
    pm_assigned?: string
    technical_lead?: string
    tags?: string[]
    metadata?: Record<string, unknown>
    created_at: string
    updated_at: string
}

export interface ProjectDocument {
    id: string
    project_id: string
    title: string
    file_path: string
    file_type?: string
    file_size?: number
    category: 'contract' | 'invoice' | 'brief' | 'design' | 'technical' | 'credentials' | 'general'
    uploaded_by?: string
    metadata?: Record<string, unknown>
    created_at: string
    updated_at: string
}

export interface ProjectCredential {
    id: string
    project_id: string
    platform_name: string
    url?: string
    username?: string
    password_hash?: string
    password_hint?: string
    notes?: string
    added_by?: string
    created_at: string
    updated_at: string
}

export type CommunicationType = 'email' | 'note' | 'meeting' | 'call'
export type CommunicationDirection = 'inbound' | 'outbound' | 'internal'

export interface CommunicationLog {
    id: string
    project_id?: string
    lead_id?: string
    type: CommunicationType
    subject?: string
    content: string
    direction?: CommunicationDirection
    logged_by?: string
    created_at: string
    updated_at: string
}

// ============================================================
// Admin & RBAC Types
// ============================================================

export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer'

export interface AdminUser {
    id: string
    email: string
    role: AdminRole
    created_at: string
    updated_at: string
}

