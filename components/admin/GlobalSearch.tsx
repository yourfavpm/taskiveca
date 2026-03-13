'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface GlobalSearchProps {
    isOpen: boolean
    onClose: () => void
    onNavigate: (tab: string) => void
}

type SearchResultItem = {
    id: string
    title: string
    subtitle: string
    typeText: string
    typeColor: string
    tab: string
}

export default function GlobalSearch({ isOpen, onClose, onNavigate }: GlobalSearchProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<SearchResultItem[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
        } else {
            setSearchTerm('')
            setResults([])
        }
    }, [isOpen])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                // If it was already open, do nothing or toggling is handled by parent.
                // Normally parent handles Cmd+K to open
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const performSearch = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setResults([])
            return
        }

        setIsSearching(true)
        const q = `%${query}%`

        try {
            // Search Leads
            const { data: leads } = await supabase
                .from('crm_leads')
                .select('id, company_name, contact_name, status')
                .or(`company_name.ilike.${q},contact_name.ilike.${q},email.ilike.${q}`)
                .limit(5)

            // Search Projects
            const { data: projects } = await supabase
                .from('projects')
                .select('id, title, client_name, status')
                .or(`title.ilike.${q},client_name.ilike.${q},description.ilike.${q}`)
                .limit(5)

            // Search Credentials
            const { data: credentials } = await supabase
                .from('project_credentials')
                .select('id, platform_name, username, projects(title)')
                .or(`platform_name.ilike.${q},username.ilike.${q}`)
                .limit(5)

            const formattedResults: SearchResultItem[] = []

            if (leads) {
                leads.forEach(l => {
                    formattedResults.push({
                        id: `lead-${l.id}`,
                        title: l.company_name,
                        subtitle: `${l.contact_name} • ${l.status}`,
                        typeText: 'Lead',
                        typeColor: 'bg-purple-100 text-purple-700',
                        tab: 'crm'
                    })
                })
            }

            if (projects) {
                projects.forEach(p => {
                    formattedResults.push({
                        id: `proj-${p.id}`,
                        title: p.title,
                        subtitle: `${p.client_name} • ${p.status}`,
                        typeText: 'Project',
                        typeColor: 'bg-blue-100 text-blue-700',
                        tab: 'projects'
                    })
                })
            }

            if (credentials) {
                credentials.forEach(c => {
                    const projectTitle = c.projects && Array.isArray(c.projects) ? c.projects[0]?.title : (c.projects as { title: string })?.title || 'Unknown Project'
                    formattedResults.push({
                        id: `cred-${c.id}`,
                        title: c.platform_name,
                        subtitle: `${c.username || 'No user'} • ${projectTitle}`,
                        typeText: 'Credential',
                        typeColor: 'bg-emerald-100 text-emerald-700',
                        tab: 'projects'
                    })
                })
            }

            setResults(formattedResults)
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setIsSearching(false)
        }
    }, [supabase])

    useEffect(() => {
        const debounce = setTimeout(() => {
            performSearch(searchTerm)
        }, 300)
        return () => clearTimeout(debounce)
    }, [searchTerm, performSearch])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-md flex items-start justify-center pt-[15vh]">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col scale-in" style={{ maxHeight: '70vh' }}>
                <div className="flex items-center px-6 py-4 border-b border-slate-50">
                    <svg className="w-5 h-5 text-slate-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search leads, projects, team..."
                        className="flex-1 bg-transparent text-lg text-slate-900 placeholder:text-slate-300 outline-none font-medium"
                    />
                    <div className="flex items-center gap-1 opacity-40">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">ESC</span>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-3 min-h-[120px]">
                    {isSearching ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                            <p className="text-slate-400 text-sm font-medium">Searching records...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-1">
                            {results.map(res => (
                                <button
                                    key={res.id}
                                    onClick={() => {
                                        onNavigate(res.tab)
                                        onClose()
                                    }}
                                    className="w-full text-left px-5 py-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-between group"
                                >
                                    <div>
                                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{res.title}</h4>
                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{res.subtitle}</p>
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${res.typeColor} opacity-80`}>
                                        {res.typeText}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : searchTerm.length >= 2 ? (
                        <div className="p-12 text-center">
                            <p className="text-slate-400 font-medium">No matches found for &quot;{searchTerm}&quot;</p>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="text-5xl mb-4 grayscale opacity-20">🔍</div>
                            <p className="text-slate-400 font-semibold text-sm">Find anything instantly</p>
                            <p className="text-slate-300 text-xs mt-1">Start typing to search across all data</p>
                        </div>
                    )}
                </div>
            </div>
            
            <style jsx>{`
                .scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            `}</style>
            
            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    )
}
