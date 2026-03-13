'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CRMLead, LeadLifecycleStatus } from '@/lib/types'
import { LEAD_STATUSES, ACTIVE_STATUSES, CLOSED_STATUSES } from '@/lib/types'
import LeadTableView from './LeadTableView'
import LeadDetailView from './LeadDetailView'

export default function PipelineView() {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [leads, setLeads] = useState<CRMLead[]>([])
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLead, setNewLead] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    industry: '',
    country: '',
    notes: ''
  })
  const supabase = createClient()

  useEffect(() => { fetchLeads() }, [])

  const fetchLeads = async () => {
    const { data } = await supabase
      .from('crm_leads')
      .select('*')
      .order('updated_at', { ascending: false })
    if (data) setLeads(data)
    setLoading(false)
  }

  const handleAddLead = async () => {
    if (!newLead.company_name || !newLead.contact_name || !newLead.email) {
      alert('Please fill in Company, Contact Name, and Email')
      return
    }
    const { error } = await supabase.from('crm_leads').insert([{
      ...newLead,
      source: 'Manual Entry',
      status: 'Consultation Booked'
    }])
    if (!error) {
      setShowAddModal(false)
      setNewLead({ company_name: '', contact_name: '', email: '', phone: '', industry: '', country: '', notes: '' })
      fetchLeads()
    } else {
      alert('Error adding lead: ' + error.message)
    }
  }

  const getStatusColor = (status: string) => {
    return LEAD_STATUSES.find(s => s.value === status)?.color || '#94a3b8'
  }

  if (loading) return <div className="loading-state">Loading CRM pipeline...</div>

  return (
    <div className="crm-container">
      <div className="crm-header">
        <div className="header-left">
          <h1 className="page-title">Lead Management</h1>
          <span className="lead-count">{leads.length} leads</span>
        </div>
        <div className="header-actions">
          <button className="add-lead-btn" onClick={() => setShowAddModal(true)}>
            + Add Lead
          </button>
          <div className="view-switcher">
            <button className={`switch-btn ${viewMode === 'kanban' ? 'active' : ''}`} onClick={() => setViewMode('kanban')}>Pipeline</button>
            <button className={`switch-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>Table</button>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="add-modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Lead</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Company Name *</label>
                <input type="text" value={newLead.company_name} onChange={e => setNewLead({ ...newLead, company_name: e.target.value })} placeholder="Acme Corp" />
              </div>
              <div className="form-group">
                <label>Contact Name *</label>
                <input type="text" value={newLead.contact_name} onChange={e => setNewLead({ ...newLead, contact_name: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} placeholder="john@acme.com" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} placeholder="+1 555 123 4567" />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input type="text" value={newLead.industry} onChange={e => setNewLead({ ...newLead, industry: e.target.value })} placeholder="Technology" />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input type="text" value={newLead.country} onChange={e => setNewLead({ ...newLead, country: e.target.value })} placeholder="Canada" />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Notes</label>
              <textarea value={newLead.notes} onChange={e => setNewLead({ ...newLead, notes: e.target.value })} placeholder="Additional notes..." rows={3} />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleAddLead}>Add Lead</button>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline / Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="pipeline-board">
          {ACTIVE_STATUSES.map(status => {
            const statusLeads = leads.filter(l => l.status === status)
            const color = getStatusColor(status)
            return (
              <div key={status} className="pipeline-column">
                <div className="column-header">
                  <div className="column-header-left">
                    <span className="status-dot" style={{ background: color }} />
                    <h3>{status}</h3>
                  </div>
                  <span className="count">{statusLeads.length}</span>
                </div>
                <div className="column-content">
                  {statusLeads.map(lead => (
                    <div key={lead.id} className="lead-card" onClick={() => setSelectedLead(lead)}>
                      <div className="lead-company">{lead.company_name}</div>
                      <div className="lead-contact">{lead.contact_name}</div>
                      {lead.industry && <div className="lead-industry">{lead.industry}</div>}
                      <div className="lead-footer">
                        <span className="lead-source">{lead.source}</span>
                        <span className="lead-date">{new Date(lead.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {statusLeads.length === 0 && (
                    <div className="empty-column">No leads</div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Closed statuses grouped */}
          <div className="pipeline-column closed-column">
            <div className="column-header">
              <div className="column-header-left">
                <span className="status-dot" style={{ background: '#ef4444' }} />
                <h3>Closed / Lost</h3>
              </div>
              <span className="count">{leads.filter(l => CLOSED_STATUSES.includes(l.status)).length}</span>
            </div>
            <div className="column-content">
              {leads.filter(l => CLOSED_STATUSES.includes(l.status)).map(lead => (
                <div key={lead.id} className="lead-card closed-card" onClick={() => setSelectedLead(lead)}>
                  <div className="lead-company">{lead.company_name}</div>
                  <div className="lead-contact">{lead.contact_name}</div>
                  <div className="lead-footer">
                    <span className="lead-source">{lead.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <LeadTableView leads={leads} onSelectLead={setSelectedLead} />
      )}

      {/* Lead Detail Drawer */}
      {selectedLead && (
        <LeadDetailView
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={() => { fetchLeads(); setSelectedLead(null); }}
        />
      )}

      <style jsx>{`
        .crm-container { height:calc(100vh - 120px); display:flex; flex-direction:column; }
        .crm-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
        .header-left { display:flex; align-items:center; gap:12px; }
        .page-title { font-size:24px; font-weight:700; color:#111; margin:0; }
        .lead-count { font-size:13px; color:#64748b; background:#f1f5f9; padding:4px 12px; border-radius:20px; }
        .header-actions { display:flex; align-items:center; gap:16px; }
        .add-lead-btn { background:#0f172a; color:#fff; border:none; padding:10px 20px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:background 0.2s; }
        .add-lead-btn:hover { background:#1e293b; }
        .view-switcher { display:flex; background:#f1f5f9; padding:4px; border-radius:10px; gap:4px; }
        .switch-btn { padding:8px 16px; border-radius:8px; border:none; font-size:13px; font-weight:600; cursor:pointer; background:transparent; color:#64748b; transition:all 0.2s; }
        .switch-btn.active { background:#fff; color:#0f172a; box-shadow:0 1px 3px rgba(0,0,0,0.1); }

        .pipeline-board { display:flex; gap:12px; overflow-x:auto; padding-bottom:24px; flex:1; }
        .pipeline-column { min-width:260px; max-width:260px; background:#f8fafc; border-radius:14px; display:flex; flex-direction:column; border:1px solid #e2e8f0; }
        .closed-column { background:#fef2f2; border-color:#fecaca; }
        .column-header { padding:14px 16px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; background:#fff; border-radius:14px 14px 0 0; }
        .column-header-left { display:flex; align-items:center; gap:8px; }
        .status-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .column-header h3 { font-size:11px; font-weight:600; color:#3f3f46; margin:0; text-transform:uppercase; letter-spacing:0.03em; }
        .count { font-size:11px; background:#e2e8f0; color:#64748b; padding:2px 8px; border-radius:10px; font-weight:600; }
        .column-content { padding:10px; display:flex; flex-direction:column; gap:8px; overflow-y:auto; flex:1; }
        .lead-card { background:#fff; padding:14px; border-radius:10px; border:1px solid #e2e8f0; box-shadow:0 1px 2px rgba(0,0,0,0.04); cursor:pointer; transition:all 0.15s; }
        .lead-card:hover { transform:translateY(-1px); box-shadow:0 4px 8px rgba(0,0,0,0.06); border-color:#3b82f6; }
        .closed-card { opacity:0.7; }
        .closed-card:hover { opacity:1; }
        .lead-company { font-size:13px; font-weight:600; color:#18181b; margin-bottom:2px; }
        .lead-contact { font-size:12px; color:#71717a; margin-bottom:6px; }
        .lead-industry { font-size:10px; color:#8b5cf6; background:#f5f3ff; padding:2px 8px; border-radius:4px; display:inline-block; margin-bottom:8px; }
        .lead-footer { display:flex; justify-content:space-between; align-items:center; padding-top:8px; border-top:1px solid #f4f4f5; }
        .lead-source { font-size:10px; text-transform:uppercase; letter-spacing:0.04em; color:#a1a1aa; }
        .lead-date { font-size:10px; color:#a1a1aa; }
        .empty-column { text-align:center; color:#94a3b8; font-size:12px; padding:20px 0; }
        .loading-state { padding:40px; text-align:center; color:#64748b; }

        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .add-modal { background:#fff; width:100%; max-width:600px; padding:32px; border-radius:20px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); }
        .add-modal h2 { margin:0 0 24px 0; font-size:20px; font-weight:700; color:#111; }
        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
        .form-group label { display:block; font-size:11px; font-weight:600; color:#64748b; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.05em; }
        .form-group input, .form-group textarea { width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; }
        .form-group input:focus, .form-group textarea:focus { border-color:#3b82f6; outline:none; }
        .form-group.full-width { grid-column:span 2; }
        .modal-actions { display:flex; justify-content:flex-end; gap:12px; margin-top:24px; padding-top:24px; border-top:1px solid #e2e8f0; }
        .cancel-btn { background:#f1f5f9; border:1px solid #e2e8f0; padding:12px 24px; border-radius:10px; font-weight:600; color:#475569; cursor:pointer; }
        .submit-btn { background:#0f172a; color:#fff; border:none; padding:12px 24px; border-radius:10px; font-weight:600; cursor:pointer; }
        .submit-btn:hover { background:#1e293b; }
      `}</style>
    </div>
  )
}
