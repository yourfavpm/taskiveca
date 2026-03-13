'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AdminUser, AdminRole } from '@/lib/types'

export default function AdminManager() {
    const [admins, setAdmins] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const supabase = createClient()

    const fetchAdmins = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .order('created_at', { ascending: true })

        if (error) {
            setError(error.message)
        } else if (data) {
            setAdmins(data)
        }
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        fetchAdmins()
    }, [fetchAdmins])

    const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setIsSaving(true)
        
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const role = formData.get('role') as AdminRole

        if (!email) {
            setError('Email is required.')
            setIsSaving(false)
            return
        }

        const { error: insertError } = await supabase
            .from('admins')
            .insert({ email: email.toLowerCase(), role })

        if (insertError) {
            if (insertError.code === '23505') {
                setError('An admin with this email already exists.')
            } else {
                setError(insertError.message)
            }
        } else {
            setIsAdding(false)
            fetchAdmins()
        }
        setIsSaving(false)
    }

    const handleUpdateRole = async (id: string, newRole: AdminRole) => {
        const { error } = await supabase
            .from('admins')
            .update({ role: newRole })
            .eq('id', id)

        if (error) {
            alert('Failed to update role: ' + error.message)
        } else {
            fetchAdmins()
        }
    }

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`Are you sure you want to remove ${email} from the team?`)) return
        
        const { error } = await supabase
            .from('admins')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Failed to remove admin: ' + error.message)
        } else {
            fetchAdmins()
        }
    }

    const filteredAdmins = admins.filter(a => 
        a.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div className="p-12 text-center text-slate-400 font-medium animate-pulse">Loading team members...</div>

    return (
        <div className="space-y-6">
            <div className="table-view">
                <div className="table-header">
                    <div className="header-info">
                        <h1 className="text-lg font-bold text-slate-900">Team Management</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{admins.length} total members</p>
                    </div>
                    <div className="table-controls">
                        <div className="search-wrapper">
                            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                                type="text"
                                placeholder="Find members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="px-4 py-2 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            + Invite Member
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="leads-table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Role</th>
                                <th>Added On</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAdmins.map((admin) => (
                                <tr key={admin.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                                                {admin.email?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">{admin.email}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">Verified Admin</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <select 
                                            value={admin.role}
                                            onChange={(e) => handleUpdateRole(admin.id, e.target.value as AdminRole)}
                                            className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wider text-slate-600 outline-none cursor-pointer hover:text-blue-600 transition-colors"
                                        >
                                            <option value="super_admin">Super Admin</option>
                                            <option value="admin">Admin</option>
                                            <option value="editor">Editor</option>
                                            <option value="viewer">Viewer</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className="text-[11px] text-slate-400 font-medium">
                                            {new Date(admin.created_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <button 
                                            onClick={() => handleDelete(admin.id, admin.email)}
                                            className="text-slate-300 hover:text-rose-500 transition-colors p-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredAdmins.length === 0 && (
                        <div className="py-24 text-center">
                            <p className="text-slate-400 font-medium italic">No administrators found.</p>
                        </div>
                    )}
                </div>
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900">Invite Team Member</h3>
                            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleInvite} className="p-6 space-y-4">
                            {error && <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold">{error}</div>}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                                <input 
                                    name="email"
                                    type="email" 
                                    required
                                    placeholder="name@company.com"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Assign Role</label>
                                <select 
                                    name="role"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all appearance-none"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="editor">Editor</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
                            >
                                {isSaving ? 'Sending...' : 'Invite Member'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .table-view { background:#fff; border-radius:16px; border:1px solid #f1f5f9; display:flex; flex-direction:column; }
                .table-header { padding:24px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f8fafc; }
                
                .table-controls { display:flex; gap:12px; align-items:center; }
                .search-wrapper { position:relative; display:flex; align-items:center; }
                .search-icon { position:absolute; left:12px; width:16px; height:16px; color:#94a3b8; pointer-events:none; }
                .search-input { width:240px; padding:10px 14px 10px 36px; border:1px solid #f1f5f9; border-radius:12px; font-size:13px; background:#f8fafc; transition:all 0.2s; color:#1e293b; }
                .search-input:focus { border-color:#3b82f6; background:#fff; outline:none; box-shadow:0 0 0 3px rgba(59, 130, 246, 0.05); }
                
                .table-container { overflow-x:auto; }
                .leads-table { width:100%; border-collapse:collapse; text-align:left; }
                .leads-table th { padding:16px 24px; background:#fcfdfe; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.06em; border-bottom:1px solid #f1f5f9; }
                .leads-table td { padding:18px 24px; border-bottom:1px solid #f8fafc; font-size:13px; transition:background 0.1s; border-bottom: 1px solid #f8fafc; }
                .leads-table tr:hover td { background:#fcfdfe; }
                .leads-table tr:last-child td { border-bottom:none; }
            `}</style>
        </div>
    )
}
