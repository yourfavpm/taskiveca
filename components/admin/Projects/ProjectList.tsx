'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, PROJECT_STATUSES } from '@/lib/types'
import ProjectDetail from '@/components/admin/Projects/ProjectDetail'

export default function ProjectList() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const supabase = createClient()

    const fetchProjects = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('updated_at', { ascending: false })
        
        if (!error && data) {
            setProjects(data)
        }
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.client_name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter
        return matchesSearch && matchesStatus
    })

    if (loading) return <div className="p-8 text-center text-slate-500">Loading projects...</div>

    return (
        <div className="table-view">
            <div className="table-header">
                <div className="header-info">
                    <h1 className="text-lg font-bold text-slate-900">Projects</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{projects.length} tracked</p>
                </div>
                <div className="table-controls">
                    <div className="search-wrapper">
                        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                            type="text" 
                            placeholder="Find projects..." 
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        {PROJECT_STATUSES.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="leads-table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Client</th>
                            <th>Status</th>
                            <th>Timeline</th>
                            <th>Platform</th>
                            <th className="text-right">Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map(project => (
                            <tr key={project.id} onClick={() => setSelectedProject(project)} className="hover:bg-fcfdfe cursor-pointer transition-colors">
                                <td>
                                    <div className="font-semibold text-slate-900">{project.title}</div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tight">{project.id.split('-')[0]}</div>
                                </td>
                                <td>
                                    <span className="text-slate-600 font-medium">{project.client_name}</span>
                                </td>
                                <td>
                                    <span 
                                        className="status-badge"
                                        style={{ 
                                            backgroundColor: `${PROJECT_STATUSES.find(s => s.value === project.status)?.color}10`,
                                            color: PROJECT_STATUSES.find(s => s.value === project.status)?.color,
                                            borderColor: `${PROJECT_STATUSES.find(s => s.value === project.status)?.color}25`
                                        }}
                                    >
                                        {project.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="text-[11px] text-slate-600 font-semibold tracking-tight">Start: {project.start_date || 'TBD'}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Launch: {project.estimated_end_date || 'TBD'}</div>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        {project.repo_url && <span title="Repository" className="text-blue-400/60 hover:text-blue-500 transition-colors">🔗</span>}
                                        {project.production_url && <span title="Production" className="text-emerald-400/60 hover:text-emerald-500 transition-colors">🌐</span>}
                                        {!project.repo_url && !project.production_url && <span className="opacity-20 text-slate-400">—</span>}
                                    </div>
                                </td>
                                <td className="text-right text-[11px] text-slate-400 font-medium">
                                    {new Date(project.updated_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredProjects.length === 0 && (
                    <div className="py-24 text-center">
                        <p className="text-slate-400 font-medium">No projects found matching your criteria.</p>
                    </div>
                )}
            </div>

            {selectedProject && (
                <ProjectDetail 
                    project={selectedProject} 
                    onClose={() => setSelectedProject(null)} 
                    onUpdate={fetchProjects}
                />
            )}

            <style jsx>{`
                .table-view { background:#fff; border-radius:16px; border:1px solid #f1f5f9; display:flex; flex-direction:column; }
                .table-header { padding:24px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f8fafc; }
                
                .table-controls { display:flex; gap:12px; align-items:center; }
                .search-wrapper { position:relative; display:flex; align-items:center; }
                .search-icon { position:absolute; left:12px; width:16px; height:16px; color:#94a3b8; pointer-events:none; }
                .search-input { width:240px; padding:10px 14px 10px 36px; border:1px solid #f1f5f9; border-radius:12px; font-size:13px; background:#f8fafc; transition:all 0.2s; color:#1e293b; }
                .search-input:focus { border-color:#3b82f6; background:#fff; outline:none; box-shadow:0 0 0 3px rgba(59, 130, 246, 0.05); }
                
                .filter-select { padding:10px 14px; border:1px solid #f1f5f9; border-radius:12px; font-size:13px; background:#f8fafc; min-width:160px; color:#475569; font-weight:500; outline:none; cursor:pointer; }
                .filter-select:focus { border-color:#3b82f6; background:#fff; }

                .table-container { overflow-x:auto; }
                .leads-table { width:100%; border-collapse:collapse; text-align:left; }
                .leads-table th { padding:16px 24px; background:#fcfdfe; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.06em; border-bottom:1px solid #f1f5f9; }
                .leads-table td { padding:18px 24px; border-bottom:1px solid #f8fafc; font-size:13px; cursor:pointer; transition:background 0.1s; }
                .leads-table tr:hover td { background:#fcfdfe; }
                .leads-table tr:last-child td { border-bottom:none; }

                .status-badge { display:inline-block; padding:4px 12px; border-radius:100px; font-size:10px; font-weight:700; border:1px solid; white-space:nowrap; text-transform:uppercase; letter-spacing:0.02em; }
            `}</style>
        </div>
    )
}
