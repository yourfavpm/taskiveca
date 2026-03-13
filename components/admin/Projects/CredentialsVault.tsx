'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProjectCredential } from '@/lib/types'

interface CredentialsVaultProps {
    projectId: string
}

export default function CredentialsVault({ projectId }: CredentialsVaultProps) {
    const [credentials, setCredentials] = useState<ProjectCredential[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})

    const supabase = useMemo(() => createClient(), [])

    const fetchCredentials = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('project_credentials')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setCredentials(data)
        }
        setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId])

    useEffect(() => {
        fetchCredentials()
    }, [fetchCredentials])

    const handleAddCredential = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSaving(true)
        const formData = new FormData(e.currentTarget)
        const newCredential = {
            project_id: projectId,
            platform_name: formData.get('platform_name') as string,
            url: formData.get('url') as string || null,
            username: formData.get('username') as string || null,
            password_hash: formData.get('password') as string || null,
            notes: formData.get('notes') as string || null
        }

        const { error } = await supabase
            .from('project_credentials')
            .insert(newCredential)

        if (!error) {
            setIsAdding(false)
            fetchCredentials()
        }
        setIsSaving(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this credential?')) return
        
        await supabase
            .from('project_credentials')
            .delete()
            .eq('id', id)
            
        fetchCredentials()
    }

    const togglePasswordVisibility = (id: string) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    if (loading) {
        return <div className="py-20 text-center text-[13px] text-slate-400 font-light">Loading credentials...</div>
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-[13px] font-medium text-slate-500">Credentials Vault</h3>
                    <p className="text-[11px] text-slate-400 font-light mt-1">Manage passwords, API keys, and access details.</p>
                </div>
                {!isAdding && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="px-4 py-2.5 bg-slate-900 text-white text-[11px] font-medium rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        + Add Credential
                    </button>
                )}
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="bg-white rounded-2xl border border-slate-200/70 p-8 mb-8">
                    <form onSubmit={handleAddCredential} className="space-y-6">
                        <h4 className="text-[13px] font-medium text-slate-700">New Credential</h4>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[11px] text-slate-400 font-light mb-2">Platform Name *</label>
                                <input name="platform_name" placeholder="e.g. Vercel, AWS" className="w-full px-4 py-3 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all placeholder:text-slate-300" required />
                            </div>
                            <div>
                                <label className="block text-[11px] text-slate-400 font-light mb-2">Login URL</label>
                                <input type="url" name="url" placeholder="https://..." className="w-full px-4 py-3 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all placeholder:text-slate-300" />
                            </div>
                            <div>
                                <label className="block text-[11px] text-slate-400 font-light mb-2">Username / Email</label>
                                <input name="username" className="w-full px-4 py-3 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-[11px] text-slate-400 font-light mb-2">Password</label>
                                <input type="password" name="password" className="w-full px-4 py-3 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all font-mono" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[11px] text-slate-400 font-light mb-2">Notes</label>
                                <input name="notes" placeholder="API key, 2FA backup codes..." className="w-full px-4 py-3 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all placeholder:text-slate-300" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2.5 text-[12px] font-medium text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                            <button type="submit" disabled={isSaving} className="px-4 py-2.5 text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Content */}
            {credentials.length === 0 && !isAdding ? (
                <div className="bg-white rounded-2xl border border-slate-200/70 py-20 text-center">
                    <div className="text-3xl mb-4">🔐</div>
                    <p className="text-[13px] text-slate-400 font-light">Vault is empty.</p>
                    <p className="text-[11px] text-slate-300 font-light mt-1.5">Add credentials to share securely with the team.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {credentials.map(cred => (
                        <div key={cred.id} className="bg-white rounded-2xl border border-slate-200/70 p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-500 font-medium text-[13px]">
                                        {cred.platform_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-[14px] font-medium text-slate-700">{cred.platform_name}</h4>
                                        {cred.url && (
                                            <a href={cred.url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-400 hover:text-blue-500 transition-colors font-light">
                                                {new URL(cred.url).hostname} ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(cred.id)} className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="bg-slate-50/60 rounded-xl p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-light block mb-1">Username</span>
                                        <span className="font-mono text-[13px] text-slate-600">{cred.username || '—'}</span>
                                    </div>
                                    {cred.username && (
                                        <button onClick={() => copyToClipboard(cred.username!)} className="text-[11px] text-blue-400 hover:text-blue-500 font-medium">Copy</button>
                                    )}
                                </div>
                                
                                <div className="border-t border-slate-100/80 pt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <span className="text-[10px] text-slate-400 font-light block mb-1">Password</span>
                                            <span className="font-mono text-[13px] text-slate-600">
                                                {cred.password_hash ? (visiblePasswords[cred.id] ? cred.password_hash : '••••••••') : '—'}
                                            </span>
                                        </div>
                                        {cred.password_hash && (
                                            <button onClick={() => togglePasswordVisibility(cred.id)} className="p-1 text-slate-300 hover:text-slate-500">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {visiblePasswords[cred.id] 
                                                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                        : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                                                    }
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    {cred.password_hash && (
                                        <button onClick={() => copyToClipboard(cred.password_hash!)} className="text-[11px] text-blue-400 hover:text-blue-500 font-medium">Copy</button>
                                    )}
                                </div>
                            </div>

                            {cred.notes && (
                                <div className="mt-5 text-[11px] text-amber-600 bg-amber-50/60 p-4 rounded-xl font-light">
                                    <span className="font-medium">Note:</span> {cred.notes}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
