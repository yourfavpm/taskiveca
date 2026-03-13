'use client'

import { useState } from 'react'
import type { ProjectMilestone } from '@/lib/types'

interface PaymentRecorderProps {
  leadId: string
  financialId: string
  currency: string
  milestones: ProjectMilestone[]
  onSave: (payment: PaymentInput) => void
  onCancel: () => void
}

export interface PaymentInput {
  amount: number
  payment_date: string
  payment_method: string
  reference_id: string
  allocation_target: 'deposit' | 'balance' | 'milestone' | 'general'
  milestone_id?: string
  notes: string
}

const PAYMENT_METHODS = ['Bank Transfer', 'Credit Card', 'PayPal', 'Stripe', 'Cash', 'Cheque', 'Interac', 'Wire Transfer', 'Other']

export default function PaymentRecorder({ leadId, financialId, currency, milestones, onSave, onCancel }: PaymentRecorderProps) {
  const [form, setForm] = useState<PaymentInput>({
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    reference_id: '',
    allocation_target: 'general',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.amount || form.amount <= 0) e.amount = 'Amount must be greater than 0'
    if (!form.payment_date) e.payment_date = 'Payment date is required'
    if (!form.payment_method) e.payment_method = 'Select a payment method'
    if (form.allocation_target === 'milestone' && !form.milestone_id) e.milestone_id = 'Select a milestone'
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
      <div className="payment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Record Payment</h2>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Amount ({currency}) *</label>
              <input type="number" value={form.amount || ''} onChange={e => { setForm(p => ({ ...p, amount: Number(e.target.value) })); setErrors(p => ({ ...p, amount: '' })) }} placeholder="0.00" min="0" step="0.01" />
              {errors.amount && <span className="error">{errors.amount}</span>}
            </div>
            <div className="form-group">
              <label>Payment Date *</label>
              <input type="date" value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))} />
              {errors.payment_date && <span className="error">{errors.payment_date}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Payment Method *</label>
              <select value={form.payment_method} onChange={e => { setForm(p => ({ ...p, payment_method: e.target.value })); setErrors(p => ({ ...p, payment_method: '' })) }}>
                <option value="">Select method...</option>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.payment_method && <span className="error">{errors.payment_method}</span>}
            </div>
            <div className="form-group">
              <label>Reference / Transaction ID</label>
              <input type="text" value={form.reference_id} onChange={e => setForm(p => ({ ...p, reference_id: e.target.value }))} placeholder="e.g. TXN-12345" />
            </div>
          </div>

          <div className="form-group">
            <label>Allocate To</label>
            <div className="allocation-grid">
              {(['deposit', 'balance', 'general'] as const).map(target => (
                <button key={target} className={`alloc-btn ${form.allocation_target === target ? 'active' : ''}`} onClick={() => setForm(p => ({ ...p, allocation_target: target, milestone_id: undefined }))}>
                  {target === 'deposit' ? '💰 Deposit' : target === 'balance' ? '📊 Balance' : '📋 General'}
                </button>
              ))}
              {milestones.length > 0 && (
                <button className={`alloc-btn ${form.allocation_target === 'milestone' ? 'active' : ''}`} onClick={() => setForm(p => ({ ...p, allocation_target: 'milestone' }))}>
                  🎯 Milestone
                </button>
              )}
            </div>
          </div>

          {form.allocation_target === 'milestone' && milestones.length > 0 && (
            <div className="form-group">
              <label>Select Milestone *</label>
              <select value={form.milestone_id || ''} onChange={e => { setForm(p => ({ ...p, milestone_id: e.target.value })); setErrors(p => ({ ...p, milestone_id: '' })) }}>
                <option value="">Choose milestone...</option>
                {milestones.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title} — {currency} {Number(m.amount).toLocaleString()} ({m.status})
                  </option>
                ))}
              </select>
              {errors.milestone_id && <span className="error">{errors.milestone_id}</span>}
            </div>
          )}

          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any payment notes..." rows={2} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : `Record ${currency} ${form.amount ? form.amount.toLocaleString() : '0'} Payment`}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:2000; padding:20px; }
        .payment-modal { background:#fff; width:100%; max-width:560px; border-radius:20px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); }
        .modal-header { padding:24px 28px; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; }
        .modal-header h2 { margin:0; font-size:20px; font-weight:700; color:#111; }
        .close-btn { background:none; border:none; font-size:28px; color:#9ca3af; cursor:pointer; }
        .modal-body { padding:24px 28px; }
        .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .form-group { margin-bottom:16px; }
        .form-group label { display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px; }
        .form-group input, .form-group select, .form-group textarea { width:100%; padding:10px 14px; border:1px solid #d1d5db; border-radius:10px; font-size:14px; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color:#3b82f6; outline:none; box-shadow:0 0 0 3px rgba(59,130,246,0.1); }
        .error { display:block; font-size:11px; color:#ef4444; margin-top:4px; }
        .allocation-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; }
        .alloc-btn { padding:10px 8px; border:1px solid #d1d5db; border-radius:10px; background:#fff; font-size:12px; font-weight:600; color:#6b7280; cursor:pointer; transition:all 0.2s; }
        .alloc-btn.active { background:#0f172a; color:#fff; border-color:#0f172a; }
        .alloc-btn:hover { border-color:#9ca3af; }
        .modal-footer { padding:20px 28px; border-top:1px solid #e5e7eb; display:flex; justify-content:flex-end; gap:12px; }
        .cancel-btn { padding:12px 24px; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:10px; font-weight:600; color:#475569; cursor:pointer; font-size:14px; }
        .save-btn { padding:12px 28px; background:#059669; color:#fff; border:none; border-radius:10px; font-weight:600; cursor:pointer; font-size:14px; }
        .save-btn:hover { background:#047857; }
        .save-btn:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>
    </div>
  )
}
