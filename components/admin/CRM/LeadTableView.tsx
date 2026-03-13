'use client'

import { useState } from 'react'
import type { CRMLead } from '@/lib/types'
import { LEAD_STATUSES, ACTIVE_STATUSES, CLOSED_STATUSES } from '@/lib/types'

interface LeadTableViewProps {
    leads: CRMLead[]
    onSelectLead: (lead: CRMLead) => void
}

export default function LeadTableView({ leads, onSelectLead }: LeadTableViewProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status: string) => {
        return LEAD_STATUSES.find(s => s.value === status)?.color || '#94a3b8'
    }

    return (
        <div className="table-view">
            <div className="table-header">
                <div className="header-info">
                    <h2 className="text-lg font-bold text-slate-900">Leads</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{filteredLeads.length} total</p>
                </div>
                <div className="table-controls">
                    <div className="search-wrapper">
                        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            placeholder="Find leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                        <option value="all">All Statuses</option>
                        <optgroup label="Active">
                            {ACTIVE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </optgroup>
                        <optgroup label="Closed">
                            {CLOSED_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </optgroup>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="leads-table">
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Industry</th>
                            <th>Country</th>
                            <th>Source</th>
                            <th className="text-right">Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.map((lead) => (
                            <tr key={lead.id} onClick={() => onSelectLead(lead)}>
                                <td>
                                    <span className="company-name">{lead.company_name}</span>
                                </td>
                                <td>
                                    <div className="contact-info">
                                        <span className="contact-name">{lead.contact_name}</span>
                                        <span className="contact-email">{lead.email}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="status-badge" style={{ background: `${getStatusColor(lead.status)}10`, color: getStatusColor(lead.status), borderColor: `${getStatusColor(lead.status)}25` }}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td><span className="text-slate-500 font-medium">{lead.industry || '—'}</span></td>
                                <td><span className="text-slate-500 font-medium">{lead.country || '—'}</span></td>
                                <td><span className="source-tag">{lead.source}</span></td>
                                <td className="text-right text-slate-400 font-medium text-[11px]">{new Date(lead.updated_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {filteredLeads.length === 0 && (
                            <tr><td colSpan={7} className="no-results">No leads found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
        .table-view { background:#fff; border-radius:16px; border:1px solid #f1f5f9; display:flex; flex-direction:column; }
        .table-header { padding:24px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f8fafc; }
        .header-info h2 { margin-bottom:2px; }
        
        .table-controls { display:flex; gap:12px; align-items:center; }
        .search-wrapper { position:relative; display:flex; align-items:center; }
        .search-icon { position:absolute; left:12px; width:16px; height:16px; color:#94a3b8; pointer-events:none; }
        .search-input { width:240px; padding:10px 14px 10px 36px; border:1px solid #f1f5f9; border-radius:12px; font-size:13px; background:#f8fafc; transition:all 0.2s; color:#1e293b; }
        .search-input:focus { border-color:#3b82f6; background:#fff; outline:none; box-shadow:0 0 0 3px rgba(59, 130, 246, 0.05); }
        .search-input::placeholder { color:#94a3b8; }
        
        .filter-select { padding:10px 14px; border:1px solid #f1f5f9; border-radius:12px; font-size:13px; background:#f8fafc; min-width:160px; color:#475569; font-weight:500; outline:none; cursor:pointer; }
        .filter-select:focus { border-color:#3b82f6; background:#fff; }

        .table-container { overflow-x:auto; }
        .leads-table { width:100%; border-collapse:collapse; text-align:left; }
        .leads-table th { padding:16px 24px; background:#fcfdfe; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.06em; border-bottom:1px solid #f1f5f9; }
        .leads-table td { padding:18px 24px; border-bottom:1px solid #f8fafc; font-size:13px; cursor:pointer; transition:background 0.1s; }
        .leads-table tr:hover td { background:#fcfdfe; }
        .leads-table tr:last-child td { border-bottom:none; }

        .company-name { font-weight:600; color:#0f172a; }
        .contact-info { display:flex; flex-direction:column; }
        .contact-name { font-weight:500; color:#334155; }
        .contact-email { font-size:11px; color:#94a3b8; font-medium; margin-top:1px; }
        .status-badge { display:inline-block; padding:4px 12px; border-radius:100px; font-size:10px; font-weight:700; border:1px solid; white-space:nowrap; text-transform:uppercase; letter-spacing:0.02em; }
        .source-tag { font-size:10px; color:#cbd5e1; font-bold; text-transform:uppercase; letter-spacing:0.04em; }
        .no-results { text-align:center; color:#94a3b8; padding:60px !important; font-medium; background: #fff; }
      `}</style>
        </div>
    )
}
