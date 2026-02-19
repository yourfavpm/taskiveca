'use client'

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Consultation, CaseStudy, CompanySettings } from '@/lib/types'

// Admin Components
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Data States
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)

  // Stats
  const [stats, setStats] = useState({ total: 0, new: 0, completed: 0, conversionRate: 0 })

  // Sub-component States
  const [notes, setNotes] = useState<{ id: string; note: string; created_at: string }[]>([])
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null)
  const [isEditing, setIsEditing] = useState(false) // For toggling the modal

  const router = useRouter()
  const supabase = createClient()

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'info@taskivetech.tech') {
      router.push('/admin/login')
      return
    }
    setLoading(false)
  }

  useEffect(() => {
    checkUser()
  }, [])
  await Promise.all([
      fetchConsultations(),
      fetchCaseStudies(),
      fetchSettings()
    ])
    setLoading(false)
  }

  // --- Data Fetching ---

  const fetchConsultations = async () => {
    const { data } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setConsultations(data)
      const total = data.length
      const newCount = data.filter(c => c.status === 'new').length
      const completed = data.filter(c => c.status === 'completed').length
      const conversionRate = total > 0 ? Math.round((completed / total) * 100) : 0
      setStats({ total, new: newCount, completed, conversionRate })
    }
  }

  const fetchCaseStudies = async () => {
    const { data } = await supabase.from('case_studies').select('*').order('created_at', { ascending: false })
    if (data) setCaseStudies(data)
  }

  const fetchSettings = async () => {
    const { data } = await supabase.from('company_settings').select('*').single()
    if (data) setCompanySettings(data)
  }

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
    await supabase.from('company_settings').update({
      contact_email: settings.contact_email,
      contact_phone: settings.contact_phone,
      address: settings.address,
      social_tiktok: settings.social_tiktok,
      social_instagram: settings.social_instagram
    }).eq('id', settings.id)
    fetchSettings()
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
    if (data.id) {
      // Update
      const { error } = await supabase.from('case_studies').update(data).eq('id', data.id)
      if (error) alert('Error updating: ' + error.message)
    } else {
      // Insert
      const { error } = await supabase.from('case_studies').insert([data])
      if (error) alert('Error creating: ' + error.message)
    }
    setIsEditing(false)
    fetchCaseStudies()
  }

  if (loading) return <div className="loading-screen">Loading secure dashboard...</div>

  return (
    <div className="admin-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      <main className="main-content">

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

        {activeTab === 'settings' && companySettings && (
          <div className="view-animate">
            <SettingsForm
              settings={companySettings}
              onSave={saveSettings}
            />
          </div>
        )}

        {activeTab === 'crm' && (
          <div className="view-animate">
            <PipelineView />
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

      </main>

      {/* CMS Modal */}
      {isEditing && (
        <CaseStudyEditor
          initialData={editingCaseStudy}
          onSave={saveCaseStudy}
          onCancel={() => setIsEditing(false)}
        />
      )}

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
