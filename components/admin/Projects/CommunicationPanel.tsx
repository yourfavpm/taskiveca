'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CommunicationLog, CommunicationType, CommunicationDirection } from '@/lib/types'

interface CommunicationPanelProps {
    projectId: string
}

export default function CommunicationPanel({ projectId }: CommunicationPanelProps) {
    const [logs, setLogs] = useState<CommunicationLog[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const supabase = useMemo(() => createClient(), [])

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('communication_logs')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setLogs(data)
        }
        setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    const handleAddLog = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSaving(true)
        const formData = new FormData(e.currentTarget)
        const newLog = {
            project_id: projectId,
            type: formData.get('type') as CommunicationType,
            subject: formData.get('subject') as string || null,
            content: formData.get('content') as string,
            direction: formData.get('direction') as CommunicationDirection
        }

        const { error } = await supabase
            .from('communication_logs')
            .insert(newLog)

        if (!error) {
            setIsAdding(false)
            fetchLogs()
        }
        setIsSaving(false)
    }

    const getIconForType = (type: string) => {
        switch(type) {
            case 'email': return '📧'
            case 'meeting': return '📹'
            case 'call': return '📞'
            case 'note': default: return '📝'
        }
    }

    const getColorForDirection = (direction?: string) => {
        switch(direction) {
            case 'inbound': return 'text-blue-500 bg-blue-50/60'
            case 'outbound': return 'text-emerald-500 bg-emerald-50/60'
            case 'internal': default: return 'text-slate-500 bg-slate-50/60'
        }
    }

    if (loading) {
        return <div className="py-20 text-center text-[13px] text-slate-400 font-light">Loading communication logs...</div>
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-[13px] font-medium text-slate-500">Communication</h3>
                    <p className="text-[11px] text-slate-400 font-light mt-1">Log emails, meetings, calls, and notes.</p>
                </div>
                {!isAdding && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="px-4 py-2.5 bg-slate-900 text-white text-[11px] font-medium rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        + Log Activity
                    </button>
                )}
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="bg-white rounded-2xl border border-slate-200/70 p-8 mb-8">
                    <form onSubmit={handleAddLog} className="space-y-6">
                        <h4 className="text-[13px] font-medium text-slate-700">New Log Entry</h4>
                        
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[11px] text-slate-400 font-light mb-2">Type</label>
                                <select name="type" className="w-full px-4 py-3 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all" required>
                                    <option value="note">Internal Note</option>
                                    <option value="email">Email</option>
                                    <option value="meeting">Meeting</option>
                                    <option value="call">Phone Call</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] text-slate-400 font-light mb-2">Direction</label>
                                <select name="direction" className="w-full px-4 py-3 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all" required>
                                    <option value="internal">Internal Only</option>
                                    <option value="inbound">Inbound (From Client)</option>
                                    <option value="outbound">Outbound (To Client)</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[11px] text-slate-400 font-light mb-2">Subject</label>
                                <input name="subject" placeholder="e.g. Kickoff Meeting Notes" className="w-full px-4 py-3 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all placeholder:text-slate-300" required />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[11px] text-slate-400 font-light mb-2">Content *</label>
                                <textarea name="content" rows={4} placeholder="Log the details here..." className="w-full px-4 py-3 bg-slate-50/60 border border-slate-100/80 rounded-xl text-[13px] text-slate-700 focus:bg-white focus:border-blue-300 focus:outline-none transition-all resize-none placeholder:text-slate-300" required />
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
            {logs.length === 0 && !isAdding ? (
                <div className="bg-white rounded-2xl border border-slate-200/70 py-20 text-center">
                    <div className="text-3xl mb-4">💬</div>
                    <p className="text-[13px] text-slate-400 font-light">No communication logged yet.</p>
                    <p className="text-[11px] text-slate-300 font-light mt-1.5">Add notes or log external communication.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {logs.map(log => (
                        <div key={log.id} className="bg-white rounded-2xl border border-slate-200/70 p-8">
                            <div className="flex items-start justify-between mb-5">
                                <div className="flex items-center gap-4">
                                    <span className="text-lg">{getIconForType(log.type)}</span>
                                    <div>
                                        <h4 className="text-[13px] font-medium text-slate-700">{log.subject || 'No Subject'}</h4>
                                        <p className="text-[11px] text-slate-400 font-light mt-1">
                                            {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            {' · '}
                                            {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${getColorForDirection(log.direction)}`}>
                                    {log.direction || 'internal'}
                                </span>
                            </div>
                            <p className="text-[13px] text-slate-500 leading-7 font-light whitespace-pre-wrap pl-10">{log.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
