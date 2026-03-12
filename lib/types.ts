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
    process?: string
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
export type LeadLifecycleStatus =
    | 'Consultation Booked'
    | 'Discovery Completed'
    | 'Qualified Lead'
    | 'Proposal Sent'
    | 'Negotiation / Review'
    | 'Contract Signed'
    | 'Project In Progress'
    | 'Delivered / Handed Over'
    | 'Retainer / Ongoing'
    | 'Closed – Not a Fit'
    | 'Closed – Lost'

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
    agreed_value: number
    currency: string
    payment_model: 'One-time' | 'Milestone-based' | 'Retainer'
    amount_invoiced: number
    amount_paid: number
    outstanding_balance: number
    created_at: string
    updated_at: string
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

export interface AnalyticsMetrics {
    totalConsultations: number
    conversionFunnel: {
        status: LeadLifecycleStatus
        count: number
        percentage: number
    }[]
    revenueData: {
        totalSigned: number
        totalPaid: number
        totalOutstanding: number
        byMonth: { month: string; signed: number; paid: number }[]
        byIndustry: { industry: string; value: number }[]
        byCountry: { country: string; value: number; count: number }[]
        averageDealSize: number
        winRate: number
    }
    leadsTrend: {
        month: string
        newLeads: number
        converted: number
    }[]
}
