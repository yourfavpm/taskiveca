'use client'

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import type { Consultation, CaseStudy, CompanySettings, AdminNote } from '@/lib/types'
import Sidebar from '@/components/admin/Sidebar'
import DashboardStats from '@/components/admin/DashboardStats'
import ConsultationManager from '@/components/admin/ConsultationManager'
import CaseStudyManager from '@/components/admin/CaseStudyManager'
import CaseStudyEditor from '@/components/admin/CaseStudyEditor'
import SettingsForm from '@/components/admin/SettingsForm'
import TestimonialManager from '@/components/admin/TestimonialManager'

// CRM & Analytics Components
import PipelineView from '@/components/admin/CRM/PipelineView'
import AnalyticsDashboard from '@/components/admin/Analytics/AnalyticsDashboard'
import ProjectList from '@/components/admin/Projects/ProjectList'
import GlobalSearch from '@/components/admin/GlobalSearch'
import AdminManager from '@/components/admin/UserManagement/AdminManager'
import type { AdminRole } from '@/lib/types'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Data States
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)

  // Stats
  const [stats, setStats] = useState({ total: 0, new: 0, completed: 0, conversionRate: 0 })

  // Sub-component States
  const [notes, setNotes] = useState<AdminNote[]>([])
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null)
  const [isEditing, setIsEditing] = useState(false) // For toggling the modal

  const router = useRouter()
  const supabase = createClient()

  // --- Data Fetching ---

  async function fetchConsultations() {
    const { data } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setConsultations(data)
      const total = data.length
      const newCount = data.filter((c: Consultation) => c.status === 'new').length
      const completed = data.filter((c: Consultation) => c.status === 'completed').length
      const conversionRate = total > 0 ? Math.round((completed / total) * 100) : 0
      setStats({ total, new: newCount, completed, conversionRate })
    }
  }

  async function fetchCaseStudies() {
    const { data } = await supabase.from('case_studies').select('*').order('created_at', { ascending: false })
    if (data) setCaseStudies(data)
  }

  async function fetchSettings() {
    const { data } = await supabase.from('company_settings').select('*').single()
    if (data) {
      setCompanySettings(data)
    } else {
      // Provide a default template if no settings exist yet
      setCompanySettings({
        id: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        social_tiktok: '',
        social_instagram: ''
      })
    }
  }

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/admin/login')
      return
    }

    // Verify if the user is in the admins table (case-insensitive)
    const { data: adminEntry, error: adminError } = await supabase
      .from('admins')
      .select('email, role')
      .ilike('email', user.email || '')
      .single()

    if (adminError || !adminEntry) {
      console.error('Admin verification failed:', {
        error: adminError,
        userEmail: user.email,
        wasFound: !!adminEntry
      })
      router.push('/admin/login')
      return
    }

    setUser(user)
    setAdminRole(adminEntry.role as AdminRole)
    
    await Promise.all([
      fetchConsultations(),
      fetchCaseStudies(),
      fetchSettings()
    ])
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  const fetchNotes = async (consultationId: string) => {
    const { data } = await supabase
      .from('admin_notes')
      .select('*')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: false })
    if (data) setNotes(data)
    else setNotes([])
  }

  // --- Actions ---

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  // Keyboard shortcut handler for Cmd+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('consultations').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    fetchConsultations()
  }

  const addNote = async (id: string, note: string) => {
    const { data } = await supabase
      .from('admin_notes')
      .insert([{ consultation_id: id, note }])
      .select()
      .single()

    if (data) {
      setNotes(prev => [data, ...prev])
    }
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('case_studies').update({ featured: !current }).eq('id', id)
    fetchCaseStudies()
  }

  const saveSettings = async (settings: CompanySettings) => {
    const { error } = await supabase.from('company_settings').upsert({
      ...(settings.id ? { id: settings.id } : {}),
      contact_email: settings.contact_email,
      contact_phone: settings.contact_phone,
      address: settings.address,
      social_tiktok: settings.social_tiktok,
      social_instagram: settings.social_instagram,
      is_singleton: true, // Required for the singleton constraint
      updated_at: new Date().toISOString()
    }, { onConflict: 'is_singleton' })

    if (error) {
      alert('Error saving settings: ' + error.message)
    } else {
      fetchSettings()
    }
  }

  // --- Case Study CMS Actions ---

  const handleEditCaseStudy = (cs: CaseStudy) => {
    setEditingCaseStudy(cs)
    setIsEditing(true)
  }

  const handleCreateCaseStudy = () => {
    setEditingCaseStudy(null) // Empty for new
    setIsEditing(true)
  }

  const saveCaseStudy = async (data: Partial<CaseStudy>) => {
    try {
      if (data.id) {
        // Update
        const { error } = await supabase.from('case_studies').update(data).eq('id', data.id)
        if (error) throw error
      } else {
        // Insert
        const { error } = await supabase.from('case_studies').insert([data])
        if (error) throw error
      }
      setIsEditing(false)
      fetchCaseStudies()
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      console.error('Error saving case study:', err)
      if (err.code === '23505') {
        alert('Error: A case study with this slug already exists. Please use a different slug.')
      } else {
        alert('Error saving case study: ' + (err.message || 'Unknown error'))
      }
    }
  }

  if (loading) return <div className="loading-screen">Loading secure dashboard...</div>

  return (
    <div className="admin-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={user?.email}
        adminRole={adminRole || undefined}
        onLogout={handleLogout}
      />

      <main className="main-content">
        
        {/* Search Button */}
        <div className="flex justify-end mb-8">
            <button 
                onClick={() => setIsSearchOpen(true)}
                className="group flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:border-blue-200 hover:text-blue-500 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <span className="text-xs font-bold uppercase tracking-widest">Search Console</span>
                <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 ml-2 font-bold text-slate-300 group-hover:text-blue-300 transition-colors">⌘K</span>
            </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="view-animate">
            <h1 className="page-title">Dashboard Overview</h1>
            <DashboardStats stats={stats} />

            {/* Recent Activity Sneeze */}
            <div className="recent-section">
              <h3>Recent Consultations</h3>
              <ConsultationManager
                consultations={consultations.slice(0, 5)} // Show only recent 5
                onUpdateStatus={updateStatus}
                notes={notes}
                onFetchNotes={fetchNotes}
                onAddNote={addNote}
              />
            </div>
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="view-animate">
            <h1 className="page-title">Consultation Requests</h1>
            <ConsultationManager
              consultations={consultations}
              onUpdateStatus={updateStatus}
              notes={notes}
              onFetchNotes={fetchNotes}
              onAddNote={addNote}
            />
          </div>
        )}

        {activeTab === 'casestudies' && (
          <div className="view-animate">
            <CaseStudyManager
              caseStudies={caseStudies}
              onToggleFeatured={toggleFeatured}
              onEdit={handleEditCaseStudy}
              onAdd={handleCreateCaseStudy}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="view-animate">
            <SettingsForm
              settings={companySettings || {
                id: '',
                contact_email: '',
                contact_phone: '',
                address: '',
                social_tiktok: '',
                social_instagram: ''
              }}
              onSave={saveSettings}
            />
          </div>
        )}

        {activeTab === 'crm' && (
          <div className="view-animate">
            <PipelineView />
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="view-animate">
            <ProjectList />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="view-animate">
            <AnalyticsDashboard />
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="view-animate">
            <TestimonialManager />
          </div>
        )}

        {activeTab === 'team' && adminRole === 'super_admin' && (
          <div className="view-animate">
            <AdminManager />
          </div>
        )}

      </main>

      {/* CMS Modal */}
      {isEditing && (
        <CaseStudyEditor
          initialData={editingCaseStudy}
          existingSlugs={caseStudies.map(cs => cs.slug)}
          onSave={saveCaseStudy}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {/* Global Search Overly */}
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onNavigate={setActiveTab} 
      />

      <style jsx>{`
        .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: #fff; color: #666; font-size: 14px; }
        .admin-layout { display: flex; min-height: 100vh; background: #fafafa; }
        .main-content { margin-left: 260px; flex: 1; padding: 40px; overflow-x: hidden; }
        
        .page-title { font-size: 24px; font-weight: 700; color: #111; margin-bottom: 32px; letter-spacing: -0.01em; }

        .view-animate { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        .recent-section { margin-top: 40px; }
        .recent-section h3 { margin-bottom: 20px; font-size: 16px; font-weight: 600; color: #444; }
      `}</style>
    </div>
  )
}
