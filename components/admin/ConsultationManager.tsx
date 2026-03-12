import { useState } from 'react'
import { Consultation, AdminNote } from '@/lib/types'

interface ConsultationManagerProps {
    consultations: Consultation[]
    onUpdateStatus: (id: string, status: string) => Promise<void>
    notes: AdminNote[]
    onFetchNotes: (id: string) => void
    onAddNote: (id: string, note: string) => Promise<void>
}

export default function ConsultationManager({
    consultations,
    onUpdateStatus,
    notes,
    onFetchNotes,
    onAddNote
}: ConsultationManagerProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [newNote, setNewNote] = useState('')

    const selectedConsultation = consultations.find(c => c.id === selectedId)

    const handleSelect = (id: string) => {
        setSelectedId(id)
        onFetchNotes(id)
    }

    const handleAddNote = async () => {
        if (!selectedId || !newNote.trim()) return
        await onAddNote(selectedId, newNote)
        setNewNote('')
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="consultations-layout">
            {/* List Panel */}
            <div className="list-panel">
                <div className="panel-header">
                    <h2>Requests</h2>
                    <span className="count">{consultations.length}</span>
                </div>
                <div className="list-content">
                    {consultations.map(c => (
                        <div
                            key={c.id}
                            className={`list-item ${selectedId === c.id ? 'active' : ''}`}
                            onClick={() => handleSelect(c.id)}
                        >
                            <div className="row-top">
                                <span className="name">{c.name}</span>
                                <span className={`badge ${c.status}`}>{c.status}</span>
                            </div>
                            <div className="row-bottom">
                                <span>{c.project_type}</span>
                                <span>{new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Panel */}
            <div className="detail-panel">
                {selectedConsultation ? (
                    <div className="detail-content">
                        <div className="detail-header">
                            <div>
                                <h2>{selectedConsultation.name}</h2>
                                <div className="meta-row">
                                    <a href={`mailto:${selectedConsultation.email}`} className="email-link">
                                        {selectedConsultation.email}
                                    </a>
                                    {selectedConsultation.company && (
                                        <span className="company"> • {selectedConsultation.company}</span>
                                    )}
                                </div>
                            </div>

                            <div className="status-control">
                                <select
                                    value={selectedConsultation.status}
                                    onChange={(e) => onUpdateStatus(selectedConsultation.id, e.target.value)}
                                    className={`status-select ${selectedConsultation.status}`}
                                >
                                    <option value="new">New</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="info-grid">
                            <div className="info-card">
                                <label>Project Type</label>
                                <p>{selectedConsultation.project_type}</p>
                            </div>
                            <div className="info-card">
                                <label>Phone</label>
                                <p>{selectedConsultation.phone || 'N/A'}</p>
                            </div>
                            <div className="info-card">
                                <label>Website</label>
                                <p>
                                    {selectedConsultation.website ? (
                                        <a href={selectedConsultation.website} target="_blank" rel="noopener noreferrer" className="link">
                                            Visit Site
                                        </a>
                                    ) : 'N/A'}
                                </p>
                            </div>
                            <div className="info-card">
                                <label>Country</label>
                                <p>{selectedConsultation.country || 'N/A'}</p>
                            </div>
                            <div className="info-card">
                                <label>Est. Start Time</label>
                                <p>{selectedConsultation.estimated_start_time || 'N/A'}</p>
                            </div>
                            <div className="info-card">
                                <label>Preferred Time</label>
                                <p>
                                    {selectedConsultation.preferred_date || 'N/A'}
                                    {selectedConsultation.preferred_time ? ` at ${selectedConsultation.preferred_time}` : ''}
                                </p>
                            </div>
                        </div>

                        <div className="description-section">
                            <label>Project Description</label>
                            <div className="description-box">
                                {selectedConsultation.description}
                            </div>
                        </div>

                        <div className="notes-section">
                            <div className="section-header">
                                <h3>Internal Notes</h3>
                            </div>
                            <div className="notes-list">
                                {notes.length === 0 && <p className="empty-notes">No notes yet.</p>}
                                {notes.map(n => (
                                    <div key={n.id} className="note-item">
                                        <p className="note-text">{n.note}</p>
                                        <span className="note-date">{formatDate(n.created_at)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="add-note">
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Type a private note..."
                                    rows={2}
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim()}
                                    className="add-btn"
                                >
                                    Add Note
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">👈</div>
                        <h3>Select a consultation</h3>
                        <p>View details, update status, and manage notes.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
        .consultations-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 24px;
          height: calc(100vh - 140px);
          min-height: 600px;
        }

        /* List Panel */
        .list-panel {
          background: #fff;
          border: 1px solid #eaeaea;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .panel-header {
          padding: 16px 20px;
          border-bottom: 1px solid #eaeaea;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fafafa;
        }

        .panel-header h2 { font-size: 14px; font-weight: 600; color: #666; text-transform: uppercase; margin: 0; }
        .count { background: #eee; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }

        .list-content { overflow-y: auto; flex: 1; }
        
        .list-item {
          padding: 16px 20px;
          border-bottom: 1px solid #f5f5f5;
          cursor: pointer;
          transition: 0.1s;
        }

        .list-item:hover { background: #f9f9f9; }
        .list-item.active { background: #EFF6FF; border-left: 3px solid #2563EB; }

        .row-top { display: flex; justify-content: space-between; margin-bottom: 6px; align-items: center; }
        .name { font-weight: 600; font-size: 15px; color: #111; }
        
        .badge { font-size: 10px; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.02em; }
        .badge.new { background: #EFF6FF; color: #2563EB; }
        .badge.scheduled { background: #FEF3C7; color: #D97706; }
        .badge.completed { background: #ECFDF5; color: #059669; }
        .badge.cancelled { background: #FEE2E2; color: #DC2626; }

        .row-bottom { font-size: 13px; color: #777; display: flex; justify-content: space-between; }

        /* Detail Panel */
        .detail-panel {
          background: #fff;
          border: 1px solid #eaeaea;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .detail-content { padding: 32px; overflow-y: auto; flex: 1; }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #eaeaea;
        }

        .detail-header h2 { font-size: 28px; font-weight: 700; margin-bottom: 8px; color: #111; }
        .email-link, .link { color: #2563EB; text-decoration: none; font-weight: 500; }
        .email-link:hover, .link:hover { text-decoration: underline; }
        .company { color: #666; }

        .status-select {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #ddd;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }

        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .info-card label { display: block; font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; margin-bottom: 8px; }
        .info-card p { font-size: 16px; color: #111; font-weight: 500; }

        .description-section { margin-bottom: 40px; }
        .description-section label { display: block; font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; margin-bottom: 12px; }
        .description-box { background: #fafafa; padding: 20px; border-radius: 8px; line-height: 1.6; color: #333; }

        .notes-section { background: #fdfdfd; border: 1px solid #f0f0f0; border-radius: 8px; padding: 24px; }
        .notes-section h3 { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #444; }
        
        .notes-list { margin-bottom: 16px; max-height: 300px; overflow-y: auto; }
        .note-item { background: #fff; padding: 12px; border: 1px solid #eee; border-radius: 6px; margin-bottom: 12px; }
        .note-text { font-size: 14px; color: #333; margin-bottom: 6px; line-height: 1.4; }
        .note-date { font-size: 11px; color: #999; }
        
        .add-note textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; margin-bottom: 12px; outline: none; transition: 0.2s; }
        .add-note textarea:focus { border-color: #2563EB; }
        .add-btn { padding: 8px 16px; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
        .add-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #888;
        }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
      `}</style>
        </div>
    )
}
