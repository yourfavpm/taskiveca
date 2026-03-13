'use client'

import { useState } from 'react'

interface AdditionalChargeFormProps {
  leadId: string
  financialId: string
  currency: string
  onSave: (charge: ChargeInput) => void
  onCancel: () => void
}

export interface ChargeInput {
  title: string
  description: string
  amount: number
}

export default function AdditionalChargeForm({ leadId, financialId, currency, onSave, onCancel }: AdditionalChargeFormProps) {
  const [form, setForm] = useState<ChargeInput>({ title: '', description: '', amount: 0 })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.amount || form.amount <= 0) e.amount = 'Amount must be greater than 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="charge-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Additional Charge</h2>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>

        <div className="modal-body">
          <p className="info-text">Add a change order or extra charge. This will increase the total agreed revenue for this client.</p>
          
          <div className="form-group">
            <label>Charge Title *</label>
            <input type="text" value={form.title} onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setErrors(p => ({ ...p, title: '' })) }} placeholder="e.g. Additional Feature: User Dashboard" />
            {errors.title && <span className="error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Reason / Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Why is this charge being added?" rows={3} />
          </div>

          <div className="form-group">
            <label>Amount ({currency}) *</label>
            <input type="number" value={form.amount || ''} onChange={e => { setForm(p => ({ ...p, amount: Number(e.target.value) })); setErrors(p => ({ ...p, amount: '' })) }} placeholder="0.00" min="0" step="0.01" />
            {errors.amount && <span className="error">{errors.amount}</span>}
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : `Add ${currency} ${form.amount ? form.amount.toLocaleString() : '0'} Charge`}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:2000; padding:20px; }
        .charge-modal { background:#fff; width:100%; max-width:480px; border-radius:20px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); }
        .modal-header { padding:24px 28px; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; }
        .modal-header h2 { margin:0; font-size:20px; font-weight:700; color:#111; }
        .close-btn { background:none; border:none; font-size:28px; color:#9ca3af; cursor:pointer; }
        .modal-body { padding:24px 28px; }
        .info-text { font-size:13px; color:#6b7280; margin:0 0 20px 0; padding:12px; background:#fffbeb; border:1px solid #fef3c7; border-radius:10px; }
        .form-group { margin-bottom:16px; }
        .form-group label { display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px; }
        .form-group input, .form-group textarea { width:100%; padding:10px 14px; border:1px solid #d1d5db; border-radius:10px; font-size:14px; }
        .form-group input:focus, .form-group textarea:focus { border-color:#3b82f6; outline:none; box-shadow:0 0 0 3px rgba(59,130,246,0.1); }
        .error { display:block; font-size:11px; color:#ef4444; margin-top:4px; }
        .modal-footer { padding:20px 28px; border-top:1px solid #e5e7eb; display:flex; justify-content:flex-end; gap:12px; }
        .cancel-btn { padding:12px 24px; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:10px; font-weight:600; color:#475569; cursor:pointer; font-size:14px; }
        .save-btn { padding:12px 28px; background:#f59e0b; color:#fff; border:none; border-radius:10px; font-weight:600; cursor:pointer; font-size:14px; }
        .save-btn:hover { background:#d97706; }
        .save-btn:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>
    </div>
  )
}
