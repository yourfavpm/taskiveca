'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, ProjectStatus, PROJECT_STATUSES } from '@/lib/types'
import DocumentManager from '@/components/admin/Projects/DocumentManager'
import CredentialsVault from '@/components/admin/Projects/CredentialsVault'
import CommunicationPanel from '@/components/admin/Projects/CommunicationPanel'

interface ProjectDetailProps {
    project: Project
    onClose: () => void
    onUpdate: () => void
}

export default function ProjectDetail({ project: initialProject, onClose, onUpdate }: ProjectDetailProps) {
    const [project, setProject] = useState<Project>(initialProject)
    const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'credentials' | 'communication' | 'audit'>('overview')
    const [isSaving, setIsSaving] = useState(false)
    const [editMode, setEditMode] = useState(false)

    const supabase = createClient()

    const handleStatusChange = async (newStatus: ProjectStatus) => {
        setIsSaving(true)
        const { error } = await supabase
            .from('projects')
            .update({ status: newStatus })
            .eq('id', project.id)

        if (!error) {
            setProject(prev => ({ ...prev, status: newStatus }))
            onUpdate()
        }
        setIsSaving(false)
    }

    const handleUpdateProject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSaving(true)
        const formData = new FormData(e.currentTarget)
        const updates = {
            title: formData.get('title') as string,
            client_name: formData.get('client_name') as string,
            description: formData.get('description') as string,
            repo_url: formData.get('repo_url') as string,
            staging_url: formData.get('staging_url') as string,
            production_url: formData.get('production_url') as string,
            start_date: formData.get('start_date') as string || null,
            estimated_end_date: formData.get('estimated_end_date') as string || null,
        }

        const { error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', project.id)

        if (!error) {
            setProject(prev => ({ ...prev, ...updates } as Project))
            setEditMode(false)
            onUpdate()
        }
        setIsSaving(false)
    }

    const statusObj = PROJECT_STATUSES.find(s => s.value === project.status) || PROJECT_STATUSES[0]

    const tabs = [
        { key: 'overview' as const, label: 'Overview' },
        { key: 'documents' as const, label: 'Documents' },
        { key: 'credentials' as const, label: 'Credentials' },
        { key: 'communication' as const, label: 'Comms' },
        { key: 'audit' as const, label: 'Activity' },
    ]

    return (
        <div className="fixed inset-0 bg-black/15 z-50 flex justify-end" onClick={onClose}>
            <div 
                className="bg-[#eef0f4] w-full max-w-[920px] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ─── Header ─── */}
                <div className="bg-white px-12 pt-12 pb-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <span 
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium"
                                style={{ 
                                    backgroundColor: `${statusObj.color}10`,
                                    color: statusObj.color,
                                }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusObj.color }} />
                                {project.status}
                            </span>

                            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight mt-5">{project.title}</h2>
                            
                            {project.client_name && (
                                <p className="text-[13px] text-slate-400 mt-2.5 font-light">
                                    Client · <span className="text-slate-500 font-normal">{project.client_name}</span>
                                </p>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {!editMode && activeTab === 'overview' && (
                                <button 
                                    onClick={() => setEditMode(true)}
                                    className="px-4 py-2 text-[13px] font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Edit
                                </button>
                            )}
                            <button 
                                onClick={onClose} 
                                className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 rounded-lg transition-colors text-slate-300 hover:text-slate-500"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── Tab Navigation ─── */}
                <div className="bg-white border-b border-slate-200/70 px-12">
                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => { setActiveTab(tab.key); setEditMode(false); }}
                                className={`px-5 py-4 text-[13px] font-medium transition-all relative ${
                                    activeTab === tab.key 
                                        ? 'text-slate-900' 
                                        : 'text-slate-400 hover:text-slate-500'
                                }`}
                            >
                                {tab.label}
                                {activeTab === tab.key && (
                                    <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-slate-900 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── Content ─── */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-12">
                        
                        {activeTab === 'overview' && (
                            <>
                                {editMode ? (
                                    <div className="bg-white rounded-2xl border border-slate-200/70 p-10">
                                        <form onSubmit={handleUpdateProject} className="space-y-8">
                                            <h3 className="text-[15px] font-semibold text-slate-800">Edit Project</h3>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="col-span-2">
                                                    <label className="block text-[12px] text-slate-400 mb-2.5 font-light">Project Title</label>
                                                    <input name="title" defaultValue={project.title} className="w-full px-4 py-3.5 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all" required />
                                                </div>
                                                <div>
                                                    <label className="block text-[12px] text-slate-400 mb-2.5 font-light">Client Name</label>
                                                    <input name="client_name" defaultValue={project.client_name} className="w-full px-4 py-3.5 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all" required />
                                                </div>
                                                <div>
                                                    <label className="block text-[12px] text-slate-400 mb-2.5 font-light">Project Status</label>
                                                    <select 
                                                        value={project.status}
                                                        onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                                                        className="w-full px-4 py-3.5 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all"
                                                        disabled={isSaving}
                                                    >
                                                        {PROJECT_STATUSES.map(s => (
                                                            <option key={s.value} value={s.value}>{s.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[12px] text-slate-400 mb-2.5 font-light">Description</label>
                                                    <textarea name="description" defaultValue={project.description} rows={4} className="w-full px-4 py-3.5 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all resize-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-[12px] text-slate-400 mb-2.5 font-light">Start Date</label>
                                                    <input type="date" name="start_date" defaultValue={project.start_date} className="w-full px-4 py-3.5 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all" />
                                                </div>
                                                <div>
                                                    <label className="block text-[12px] text-slate-400 mb-2.5 font-light">Estimated End Date</label>
                                                    <input type="date" name="estimated_end_date" defaultValue={project.estimated_end_date} className="w-full px-4 py-3.5 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all" />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[12px] text-slate-400 mb-2.5 font-light">Repository URL</label>
                                                    <input name="repo_url" defaultValue={project.repo_url} className="w-full px-4 py-3.5 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all" />
                                                </div>
                                                <div>
                                                    <label className="block text-[12px] text-slate-400 mb-2.5 font-light">Staging URL</label>
                                                    <input name="staging_url" defaultValue={project.staging_url} className="w-full px-4 py-3.5 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all" />
                                                </div>
                                                <div>
                                                    <label className="block text-[12px] text-slate-400 mb-2.5 font-light">Production URL</label>
                                                    <input name="production_url" defaultValue={project.production_url} className="w-full px-4 py-3.5 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all" />
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                                                <button type="button" onClick={() => setEditMode(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 hover:bg-slate-50 transition-colors">Cancel</button>
                                                <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors">
                                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="space-y-14">
                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-3 gap-6">
                                            {[
                                                {
                                                    label: 'Launch Target',
                                                    value: project.estimated_end_date 
                                                        ? new Date(project.estimated_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                        : 'TBD',
                                                    sub: project.estimated_end_date 
                                                        ? String(new Date(project.estimated_end_date).getFullYear())
                                                        : 'Not scheduled'
                                                },
                                                {
                                                    label: 'Current Phase',
                                                    value: project.status,
                                                    sub: 'Active'
                                                },
                                                {
                                                    label: 'Assigned Lead',
                                                    value: project.pm_assigned || '—',
                                                    sub: project.pm_assigned ? 'Project lead' : 'Unassigned'
                                                }
                                            ].map((stat) => (
                                                <div key={stat.label} className="bg-white rounded-2xl border border-slate-200/70 p-8">
                                                    <p className="text-[11px] text-slate-400 font-light uppercase tracking-widest">{stat.label}</p>
                                                    <p className="text-[22px] font-semibold text-slate-900 mt-4 leading-none">{stat.value}</p>
                                                    <p className="text-[11px] text-slate-400 font-light mt-3">{stat.sub}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <h4 className="text-[13px] font-medium text-slate-500 mb-4">About</h4>
                                            <div className="bg-white rounded-2xl border border-slate-200/70 p-8">
                                                <p className="text-[13px] text-slate-500 leading-7 font-light whitespace-pre-wrap">
                                                    {project.description || 'No description provided yet. Click "Edit" to add project details.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Links */}
                                        <div>
                                            <h4 className="text-[13px] font-medium text-slate-500 mb-4">Links</h4>
                                            <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
                                                {[
                                                    { label: 'Repository', url: project.repo_url, icon: '🗂' },
                                                    { label: 'Staging', url: project.staging_url, icon: '🔬' },
                                                    { label: 'Production', url: project.production_url, icon: '🌐' },
                                                ].map((link, idx) => (
                                                    <a 
                                                        key={link.label}
                                                        href={link.url || undefined} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className={`flex items-center justify-between px-8 py-6 transition-colors ${
                                                            link.url ? 'hover:bg-slate-50/50 cursor-pointer' : 'opacity-35 cursor-default'
                                                        } ${idx > 0 ? 'border-t border-slate-50/80' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <span className="text-lg">{link.icon}</span>
                                                            <div>
                                                                <p className="text-[13px] font-medium text-slate-700">{link.label}</p>
                                                                <p className="text-[11px] text-slate-400 font-light mt-1">{link.url || 'Not configured'}</p>
                                                            </div>
                                                        </div>
                                                        {link.url && (
                                                            <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        )}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Timeline */}
                                        <div>
                                            <h4 className="text-[13px] font-medium text-slate-500 mb-4">Timeline</h4>
                                            <div className="bg-white rounded-2xl border border-slate-200/70 p-8">
                                                <div className="flex items-center">
                                                    <div className="flex-1">
                                                        <p className="text-[11px] text-slate-400 font-light mb-2">Started</p>
                                                        <p className="text-[13px] font-medium text-slate-700">
                                                            {project.start_date 
                                                                ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                                                : 'Not started'
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="flex-1 mx-10 flex items-center gap-3">
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusObj.color }} />
                                                        <div className="flex-1 h-px bg-slate-100" />
                                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                                    </div>
                                                    <div className="flex-1 text-right">
                                                        <p className="text-[11px] text-slate-400 font-light mb-2">Target Completion</p>
                                                        <p className="text-[13px] font-medium text-slate-700">
                                                            {project.estimated_end_date 
                                                                ? new Date(project.estimated_end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                                                : 'Not set'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'documents' && <DocumentManager projectId={project.id} />}
                        {activeTab === 'credentials' && <CredentialsVault projectId={project.id} />}
                        {activeTab === 'communication' && <CommunicationPanel projectId={project.id} />}

                        {activeTab === 'audit' && (
                            <div>
                                <h4 className="text-[13px] font-medium text-slate-500 mb-4">Activity Log</h4>
                                <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
                                    <div className="px-8 py-7 flex items-start gap-5 border-b border-slate-50/80">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                        <div>
                                            <p className="text-[13px] font-medium text-slate-700">Project created</p>
                                            <p className="text-[11px] text-slate-400 font-light mt-2">
                                                {new Date(project.created_at).toLocaleDateString('en-US', { 
                                                    month: 'long', day: 'numeric', year: 'numeric', 
                                                    hour: '2-digit', minute: '2-digit' 
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="px-8 py-7 flex items-start gap-5">
                                        <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                                        <div>
                                            <p className="text-[13px] text-slate-400 font-light">No further activity recorded</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
