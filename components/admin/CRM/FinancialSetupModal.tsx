'use client'

import { useState } from 'react'
import type { ProjectMilestone } from '@/lib/types'

interface FinancialSetupModalProps {
  leadId: string
  companyName: string
  onSave: (data: FinancialSetupData) => void
  onCancel: () => void
}

export interface FinancialSetupData {
  project_title: string
  service_name: string
  pricing_structure: 'one-off' | 'milestone'
  payment_type?: 'full-upfront' | 'deposit-balance'
  currency: string
  agreed_value: number
  deposit_amount: number
  balance_amount: number
  balance_due_date?: string
  scope_notes: string
  expected_start_date?: string
  payment_notes?: string
  milestones: MilestoneInput[]
}

interface MilestoneInput {
  title: string
  description: string
  amount: number
  due_trigger: string
  expected_due_date: string
}

const CURRENCIES = ['USD', 'CAD', 'GBP', 'EUR']

export default function FinancialSetupModal({ leadId, companyName, onSave, onCancel }: FinancialSetupModalProps) {
  const [form, setForm] = useState<FinancialSetupData>({
    project_title: '',
    service_name: '',
    pricing_structure: 'one-off',
    payment_type: 'full-upfront',
    currency: 'USD',
    agreed_value: 0,
    deposit_amount: 0,
    balance_amount: 0,
    scope_notes: '',
    milestones: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const updateField = (field: string, value: any) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      // Auto-calculate balance
      if (field === 'agreed_value' || field === 'deposit_amount') {
        const agreed = field === 'agreed_value' ? value : prev.agreed_value
        const deposit = field === 'deposit_amount' ? value : prev.deposit_amount
        next.balance_amount = Math.max(0, agreed - deposit)
      }
      return next
    })
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const addMilestone = () => {
    setForm(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', description: '', amount: 0, due_trigger: '', expected_due_date: '' }],
    }))
  }

  const removeMilestone = (index: number) => {
    setForm(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }))
  }

  const updateMilestone = (index: number, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => i === index ? { ...m, [field]: value } : m),
    }))
  }

  const milestoneTotal = form.milestones.reduce((sum, m) => sum + Number(m.amount || 0), 0)
  const milestoneMismatch = form.pricing_structure === 'milestone' && form.milestones.length > 0 && milestoneTotal !== form.agreed_value

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!form.project_title.trim()) newErrors.project_title = 'Required'
    if (!form.service_name.trim()) newErrors.service_name = 'Required'
    if (!form.agreed_value || form.agreed_value <= 0) newErrors.agreed_value = 'Must be greater than 0'

    if (form.pricing_structure === 'one-off' && form.payment_type === 'deposit-balance') {
      if (!form.deposit_amount || form.deposit_amount <= 0) newErrors.deposit_amount = 'Required for deposit+balance'
      if (form.deposit_amount >= form.agreed_value) newErrors.deposit_amount = 'Must be less than total'
    }

    if (form.pricing_structure === 'milestone') {
      if (form.milestones.length === 0) newErrors.milestones = 'Add at least one milestone'
      form.milestones.forEach((m, i) => {
        if (!m.title.trim()) newErrors[`milestone_${i}_title`] = 'Required'
        if (!m.amount || m.amount <= 0) newErrors[`milestone_${i}_amount`] = 'Required'
      })
      if (milestoneTotal !== form.agreed_value) {
        newErrors.milestones = `Milestone total ($${milestoneTotal.toLocaleString()}) must equal agreed amount ($${form.agreed_value.toLocaleString()})`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    setErrors({})
    if (!validate()) {
      // Find the first error element and scroll to it
      const firstError = document.querySelector('.error')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    
    setSaving(true)
    try {
      await onSave(form)
    } catch (err: any) {
      setErrors({ submit: err.message || 'An unexpected error occurred while saving.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="setup-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Financial Setup</h2>
            <p className="subtitle">Configure payment terms for <strong>{companyName}</strong></p>
          </div>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>

        <div className="modal-body">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              ⚠️ {errors.submit}
            </div>
          )}
          
          {Object.keys(errors).length > 0 && !errors.submit && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-medium">
              Please fix the errors highlighted below before saving.
            </div>
          )}
          {/* Project Info */}
          <div className="section">
            <h3 className="section-title">Project Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Project / Engagement Title *</label>
                <input type="text" value={form.project_title} onChange={e => updateField('project_title', e.target.value)} placeholder="e.g. Company Website Redesign" />
                {errors.project_title && <span className="error">{errors.project_title}</span>}
              </div>
              <div className="form-group">
                <label>Agreed Service / Package *</label>
                <input type="text" value={form.service_name} onChange={e => updateField('service_name', e.target.value)} placeholder="e.g. Full Website Build" />
                {errors.service_name && <span className="error">{errors.service_name}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Scope / Notes</label>
              <textarea value={form.scope_notes} onChange={e => updateField('scope_notes', e.target.value)} placeholder="Brief description of what's included..." rows={2} />
            </div>
          </div>

          {/* Pricing */}
          <div className="section">
            <h3 className="section-title">Pricing Structure</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Pricing Type *</label>
                <div className="toggle-group">
                  <button className={`toggle-btn ${form.pricing_structure === 'one-off' ? 'active' : ''}`} onClick={() => updateField('pricing_structure', 'one-off')}>One-off Payment</button>
                  <button className={`toggle-btn ${form.pricing_structure === 'milestone' ? 'active' : ''}`} onClick={() => updateField('pricing_structure', 'milestone')}>Milestone Payment</button>
                </div>
              </div>
              <div className="form-group">
                <label>Currency</label>
                <select value={form.currency} onChange={e => updateField('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total Agreed Amount ({form.currency}) *</label>
                <input type="number" value={form.agreed_value || ''} onChange={e => updateField('agreed_value', Number(e.target.value))} placeholder="0.00" min="0" step="0.01" />
                {errors.agreed_value && <span className="error">{errors.agreed_value}</span>}
              </div>
              <div className="form-group">
                <label>Expected Start Date</label>
                <input type="date" value={form.expected_start_date || ''} onChange={e => updateField('expected_start_date', e.target.value)} />
              </div>
            </div>

            {/* One-off payment options */}
            {form.pricing_structure === 'one-off' && (
              <>
                <div className="form-group">
                  <label>Payment Arrangement</label>
                  <div className="toggle-group">
                    <button className={`toggle-btn ${form.payment_type === 'full-upfront' ? 'active' : ''}`} onClick={() => updateField('payment_type', 'full-upfront')}>Full Upfront</button>
                    <button className={`toggle-btn ${form.payment_type === 'deposit-balance' ? 'active' : ''}`} onClick={() => updateField('payment_type', 'deposit-balance')}>Deposit + Balance</button>
                  </div>
                </div>
                {form.payment_type === 'deposit-balance' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Deposit Amount ({form.currency}) *</label>
                      <input type="number" value={form.deposit_amount || ''} onChange={e => updateField('deposit_amount', Number(e.target.value))} placeholder="0.00" min="0" step="0.01" />
                      {errors.deposit_amount && <span className="error">{errors.deposit_amount}</span>}
                    </div>
                    <div className="form-group">
                      <label>Balance ({form.currency})</label>
                      <input type="number" value={form.balance_amount} readOnly className="readonly" />
                    </div>
                    <div className="form-group">
                      <label>Balance Due Date</label>
                      <input type="date" value={form.balance_due_date || ''} onChange={e => updateField('balance_due_date', e.target.value)} />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Milestone setup */}
            {form.pricing_structure === 'milestone' && (
              <div className="milestones-section">
                <div className="milestones-header">
                  <span>Milestones</span>
                  <button className="add-milestone-btn" onClick={addMilestone}>+ Add Milestone</button>
                </div>
                {form.milestones.map((m, i) => (
                  <div key={i} className="milestone-row">
                    <div className="milestone-number">{i + 1}</div>
                    <div className="milestone-fields">
                      <div className="form-row">
                        <div className="form-group">
                          <input type="text" value={m.title} onChange={e => updateMilestone(i, 'title', e.target.value)} placeholder="Milestone title *" />
                          {errors[`milestone_${i}_title`] && <span className="error">{errors[`milestone_${i}_title`]}</span>}
                        </div>
                        <div className="form-group">
                          <input type="number" value={m.amount || ''} onChange={e => updateMilestone(i, 'amount', Number(e.target.value))} placeholder="Amount *" min="0" step="0.01" />
                          {errors[`milestone_${i}_amount`] && <span className="error">{errors[`milestone_${i}_amount`]}</span>}
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <input type="text" value={m.description} onChange={e => updateMilestone(i, 'description', e.target.value)} placeholder="Description (optional)" />
                        </div>
                        <div className="form-group">
                          <input type="date" value={m.expected_due_date} onChange={e => updateMilestone(i, 'expected_due_date', e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <button className="remove-milestone" onClick={() => removeMilestone(i)}>×</button>
                  </div>
                ))}
                {form.milestones.length > 0 && (
                  <div className={`milestone-total ${milestoneMismatch ? 'mismatch' : 'match'}`}>
                    <span>Milestone Total: {form.currency} {milestoneTotal.toLocaleString()}</span>
                    <span>Agreed: {form.currency} {form.agreed_value.toLocaleString()}</span>
                    {milestoneMismatch && <span className="mismatch-warning">⚠ Totals must match</span>}
                  </div>
                )}
                {errors.milestones && <span className="error">{errors.milestones}</span>}
              </div>
            )}
          </div>

          {/* Payment Notes */}
          <div className="section">
            <div className="form-group">
              <label>Payment Notes / Special Agreements (Optional)</label>
              <textarea value={form.payment_notes || ''} onChange={e => updateField('payment_notes', e.target.value)} placeholder="Any special payment terms..." rows={2} />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Confirm & Save Financial Setup'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:2000; padding:20px; }
        .setup-modal { background:#fff; width:100%; max-width:800px; max-height:90vh; border-radius:20px; display:flex; flex-direction:column; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); }
        .modal-header { padding:24px 28px; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:flex-start; }
        .modal-header h2 { margin:0; font-size:20px; font-weight:700; color:#111; }
        .subtitle { font-size:14px; color:#6b7280; margin-top:4px; }
        .close-btn { background:none; border:none; font-size:28px; color:#9ca3af; cursor:pointer; line-height:1; }
        .modal-body { padding:24px 28px; overflow-y:auto; flex:1; }
        .section { margin-bottom:28px; }
        .section-title { font-size:13px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 16px 0; }
        .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .form-group { margin-bottom:14px; }
        .form-group label { display:block; font-size:12px; font-weight:600; color:#4b5563; margin-bottom:6px; }
        .form-group input, .form-group select, .form-group textarea { width:100%; padding:10px 14px; border:1px solid #d1d5db; border-radius:10px; font-size:14px; transition:all 0.2s; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color:#3b82f6; outline:none; box-shadow:0 0 0 3px rgba(59,130,246,0.1); }
        .readonly { background:#f9fafb; color:#6b7280; }
        .error { display:block; font-size:11px; color:#ef4444; margin-top:4px; }
        .toggle-group { display:flex; gap:8px; }
        .toggle-btn { flex:1; padding:10px; border:1px solid #d1d5db; border-radius:10px; background:#fff; font-size:13px; font-weight:600; color:#6b7280; cursor:pointer; transition:all 0.2s; }
        .toggle-btn.active { background:#0f172a; color:#fff; border-color:#0f172a; }
        .milestones-section { margin-top:16px; }
        .milestones-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
        .milestones-header span { font-size:13px; font-weight:600; color:#374151; }
        .add-milestone-btn { background:#f1f5f9; border:1px solid #e2e8f0; padding:6px 14px; border-radius:8px; font-size:12px; font-weight:600; color:#475569; cursor:pointer; }
        .add-milestone-btn:hover { background:#e2e8f0; }
        .milestone-row { display:flex; gap:12px; align-items:flex-start; padding:16px; background:#f9fafb; border-radius:12px; border:1px solid #e5e7eb; margin-bottom:10px; }
        .milestone-number { width:28px; height:28px; background:#0f172a; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; margin-top:4px; }
        .milestone-fields { flex:1; }
        .milestone-fields .form-group { margin-bottom:8px; }
        .milestone-fields .form-row { gap:10px; }
        .remove-milestone { background:none; border:none; color:#ef4444; font-size:20px; cursor:pointer; flex-shrink:0; padding:4px; }
        .milestone-total { display:flex; justify-content:space-between; padding:12px 16px; border-radius:10px; font-size:13px; font-weight:600; }
        .milestone-total.match { background:#dcfce7; color:#166534; }
        .milestone-total.mismatch { background:#fef2f2; color:#991b1b; }
        .mismatch-warning { color:#ef4444; }
        .modal-footer { padding:20px 28px; border-top:1px solid #e5e7eb; display:flex; justify-content:flex-end; gap:12px; }
        .cancel-btn { padding:12px 24px; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:10px; font-weight:600; color:#475569; cursor:pointer; font-size:14px; }
        .save-btn { padding:12px 28px; background:#0f172a; color:#fff; border:none; border-radius:10px; font-weight:600; cursor:pointer; font-size:14px; transition:background 0.2s; }
        .save-btn:hover { background:#1e293b; }
        .save-btn:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>
    </div>
  )
}
