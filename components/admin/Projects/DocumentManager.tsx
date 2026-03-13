'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProjectDocument } from '@/lib/types'

interface DocumentManagerProps {
    projectId: string
}

export default function DocumentManager({ projectId }: DocumentManagerProps) {
    const [documents, setDocuments] = useState<ProjectDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const supabase = useMemo(() => createClient(), [])

    const fetchDocuments = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('project_documents')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setDocuments(data)
        }
        setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId])

    useEffect(() => {
        fetchDocuments()
    }, [fetchDocuments])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        
        const filePath = `projects/${projectId}/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage
            .from('project-documents')
            .upload(filePath, file)

        if (uploadError) {
            alert('Upload failed: ' + uploadError.message)
            setIsUploading(false)
            return
        }

        const { error: dbError } = await supabase
            .from('project_documents')
            .insert({
                project_id: projectId,
                title: file.name,
                file_path: filePath,
                file_type: file.type,
                file_size: file.size,
                uploaded_by: 'Admin',
                category: 'general'
            })

        if (!dbError) {
            fetchDocuments()
        } else {
            alert('Database record creation failed: ' + dbError.message)
        }
        setIsUploading(false)
    }

    const handleDelete = async (doc: ProjectDocument) => {
        if (!confirm('Are you sure you want to delete this document?')) return

        const { error: storageError } = await supabase.storage
            .from('project-documents')
            .remove([doc.file_path])

        if (storageError) {
            console.error('Storage deletion failed', storageError)
        }

        const { error: dbError } = await supabase
            .from('project_documents')
            .delete()
            .eq('id', doc.id)

        if (!dbError) {
            fetchDocuments()
        }
    }

    const getFileIcon = (type?: string) => {
        if (type?.includes('pdf')) return '📕'
        if (type?.includes('image')) return '🖼️'
        if (type?.includes('word') || type?.includes('office')) return '📄'
        return '📁'
    }

    const formatSize = (bytes?: number) => {
        if (!bytes) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const filteredDocs = documents.filter(d => 
        d.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-[13px] font-medium text-slate-500">Documents</h3>
                    <p className="text-[11px] text-slate-400 font-light mt-1">Manage project files and deliverables.</p>
                </div>
                
                <div className="flex gap-3 items-center">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="pl-8 pr-4 py-2.5 border border-slate-100/80 bg-white rounded-xl text-[12px] text-slate-600 w-48 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 outline-none transition-all placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <label className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-[11px] font-medium cursor-pointer transition-colors flex items-center gap-1.5">
                        {isUploading ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                <span>Upload</span>
                            </>
                        )}
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                </div>
            </div>

            {/* Content */}
            {filteredDocs.length === 0 && !loading ? (
                <div className="bg-white rounded-2xl border border-slate-200/70 py-20 text-center">
                    <div className="text-3xl mb-4">📁</div>
                    <p className="text-[13px] text-slate-400 font-light">No documents uploaded yet.</p>
                    <p className="text-[11px] text-slate-300 font-light mt-1.5">Upload project files to get started.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
                    {filteredDocs.map((doc, idx) => (
                        <div key={doc.id} className={`flex items-center justify-between px-8 py-6 hover:bg-slate-50/30 transition-colors group ${idx > 0 ? 'border-t border-slate-50/80' : ''}`}>
                            <div className="flex items-center gap-5">
                                <div className="text-lg">{getFileIcon(doc.file_type)}</div>
                                <div>
                                    <h5 className="text-[13px] font-medium text-slate-700">{doc.title}</h5>
                                    <p className="text-[11px] text-slate-400 font-light mt-1">
                                        {doc.category} · {formatSize(doc.file_size)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={async () => {
                                        const { data } = supabase.storage.from('project-documents').getPublicUrl(doc.file_path)
                                        window.open(data.publicUrl, '_blank')
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-300 hover:text-blue-500 transition-colors"
                                    title="Download"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </button>
                                <button 
                                    onClick={() => handleDelete(doc)}
                                    className="p-2 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors"
                                    title="Delete"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
