'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CRMLead, CRMFinancials, CRMStatusHistory, LeadLifecycleStatus, PaymentRecord, ProjectMilestone, AdditionalCharge } from '@/lib/types'
import { LEAD_STATUSES, ACTIVE_STATUSES, CLOSED_STATUSES } from '@/lib/types'
import FinancialSetupModal, { type FinancialSetupData } from './FinancialSetupModal'
import PaymentRecorder, { type PaymentInput } from './PaymentRecorder'
import AdditionalChargeForm, { type ChargeInput } from './AdditionalChargeForm'

interface LeadDetailViewProps {
  lead: CRMLead
  onClose: () => void
  onUpdate: () => void
}

export default function LeadDetailView({ lead, onClose, onUpdate }: LeadDetailViewProps) {
  const [financials, setFinancials] = useState<CRMFinancials | null>(null)
  const [history, setHistory] = useState<CRMStatusHistory[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([])
  const [charges, setCharges] = useState<AdditionalCharge[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'payments' | 'audit'>('overview')

  // Modal states
  const [showFinancialSetup, setShowFinancialSetup] = useState(false)
  const [showPaymentRecorder, setShowPaymentRecorder] = useState(false)
  const [showChargeForm, setShowChargeForm] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<LeadLifecycleStatus | null>(null)

  const supabase = createClient()

  const fetchAllData = useCallback(async () => {
    setLoading(true)
    const [finRes, histRes, payRes, chargeRes] = await Promise.all([
      supabase.from('crm_financials').select('*').eq('lead_id', lead.id).single(),
      supabase.from('crm_status_history').select('*').eq('lead_id', lead.id).order('changed_at', { ascending: false }),
      supabase.from('payment_records').select('*').eq('lead_id', lead.id).order('payment_date', { ascending: false }),
      supabase.from('additional_charges').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false }),
    ])
    if (finRes.data) {
      setFinancials(finRes.data as CRMFinancials)
      // Fetch milestones if financial exists
      const { data: msData } = await supabase.from('project_milestones').select('*').eq('financial_id', finRes.data.id).order('sort_order')
      if (msData) setMilestones(msData as ProjectMilestone[])
    }
    if (histRes.data) setHistory(histRes.data as CRMStatusHistory[])
    if (payRes.data) setPayments(payRes.data as PaymentRecord[])
    if (chargeRes.data) setCharges(chargeRes.data as AdditionalCharge[])
    setLoading(false)
  }, [lead.id, supabase])

  useEffect(() => { fetchAllData() }, [fetchAllData])

  const logAudit = async (actionType: string, entityType: string, entityId: string, prev: Record<string, unknown> | null, next: Record<string, unknown> | null) => {
    await supabase.from('audit_logs').insert([{
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      previous_value: prev,
      new_value: next,
      performed_by: 'admin',
    }])
  }

  // Status change with financial setup interception
  const handleStatusChange = async (newStatus: LeadLifecycleStatus) => {
    if (newStatus === 'Approved — Awaiting Payment' && !financials) {
      // Must set up financials first
      setPendingStatus(newStatus)
      setShowFinancialSetup(true)
      return
    }
    setIsUpdating(true)
    const { error } = await supabase
      .from('crm_leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', lead.id)
    if (!error) {
      await logAudit('status_change', 'lead', lead.id, { status: lead.status }, { status: newStatus })
      onUpdate()
    }
    setIsUpdating(false)
  }

  // Save financial setup
  const handleFinancialSave = async (data: FinancialSetupData) => {
    const payload = {
      lead_id: lead.id,
      project_title: data.project_title,
      service_name: data.service_name,
      pricing_structure: data.pricing_structure,
      payment_type: data.payment_type,
      currency: data.currency,
      agreed_value: data.agreed_value,
      deposit_amount: data.deposit_amount,
      balance_amount: data.balance_amount,
      balance_due_date: data.balance_due_date || null,
      scope_notes: data.scope_notes,
      expected_start_date: data.expected_start_date || null,
      payment_notes: data.payment_notes || null,
      payment_model: data.pricing_structure === 'milestone' ? 'Milestone-based' : 'One-time',
    }

    try {
      const { data: finData, error } = await supabase.from('crm_financials').insert([payload]).select().single()
      if (error) {
        console.error('Submission error:', error)
        alert('Error saving financials: ' + error.message)
        return
      }

      // Save milestones if applicable
      if (data.pricing_structure === 'milestone' && data.milestones.length > 0 && finData) {
        const msPayload = data.milestones.map((m, i) => ({
          financial_id: finData.id,
          title: m.title,
          description: m.description || null,
          amount: m.amount,
          due_trigger: m.due_trigger || null,
          expected_due_date: m.expected_due_date || null,
          sort_order: i,
        }))
        const { error: msError } = await supabase.from('project_milestones').insert(msPayload)
        if (msError) {
          console.error('Milestone error:', msError)
          alert('Financials saved, but error saving milestones: ' + msError.message)
        }
      }

      await logAudit('financial_setup', 'financials', finData?.id || '', null, payload)

      // Now update the lead status
      if (pendingStatus) {
        const { error: statusError } = await supabase.from('crm_leads').update({ status: pendingStatus, updated_at: new Date().toISOString() }).eq('id', lead.id)
        if (statusError) {
          console.error('Status update error:', statusError)
        } else {
          await logAudit('status_change', 'lead', lead.id, { status: lead.status }, { status: pendingStatus })
        }
        setPendingStatus(null)
      }

      setShowFinancialSetup(false)
      onUpdate()
      fetchAllData() // Refresh local state
    } catch (err: unknown) {
      console.error('Unexpected error:', err)
      const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please check console.'
      alert(message)
    }
  }

  // Record payment
  const handlePaymentSave = async (data: PaymentInput) => {
    if (!financials) return
    const payload = {
      lead_id: lead.id,
      financial_id: financials.id,
      milestone_id: data.milestone_id || null,
      amount: data.amount,
      payment_date: data.payment_date,
      payment_method: data.payment_method,
      reference_id: data.reference_id || null,
      allocation_target: data.allocation_target,
      notes: data.notes || null,
      recorded_by: 'admin',
    }
    const { data: payData, error } = await supabase.from('payment_records').insert([payload]).select().single()
    if (error) { alert('Error recording payment: ' + error.message); return }

    // Update financials total paid
    const newPaid = Number(financials.amount_paid) + data.amount
    await supabase.from('crm_financials').update({ amount_paid: newPaid, updated_at: new Date().toISOString() }).eq('id', financials.id)

    // Update milestone paid amount if applicable
    if (data.allocation_target === 'milestone' && data.milestone_id) {
      const ms = milestones.find(m => m.id === data.milestone_id)
      if (ms) {
        const newMsPaid = Number(ms.amount_paid) + data.amount
        await supabase.from('project_milestones').update({
          amount_paid: newMsPaid,
          status: newMsPaid >= Number(ms.amount) ? 'completed' : 'in-progress',
          updated_at: new Date().toISOString()
        }).eq('id', ms.id)
      }
    }

    await logAudit('payment_recorded', 'payment', payData?.id || '', null, payload)
    setShowPaymentRecorder(false)
    fetchAllData()
  }

  // Add additional charge
  const handleChargeSave = async (data: ChargeInput) => {
    if (!financials) return
    const payload = {
      lead_id: lead.id,
      financial_id: financials.id,
      title: data.title,
      description: data.description || null,
      amount: data.amount,
      added_by: 'admin',
    }
    const { error } = await supabase.from('additional_charges').insert([payload])
    if (error) { alert('Error adding charge: ' + error.message); return }
    // Update agreed value
    const newAgreed = Number(financials.agreed_value) + data.amount
    await supabase.from('crm_financials').update({ agreed_value: newAgreed, updated_at: new Date().toISOString() }).eq('id', financials.id)
    await logAudit('additional_charge', 'charge', lead.id, { agreed_value: financials.agreed_value }, { agreed_value: newAgreed, charge: data })
    setShowChargeForm(false)
    fetchAllData()
  }

  // Void payment
  const handleVoidPayment = async (paymentId: string) => {
    const reason = prompt('Reason for voiding this payment:')
    if (!reason) return
    const payment = payments.find(p => p.id === paymentId)
    if (!payment || !financials) return

    await supabase.from('payment_records').update({
      is_voided: true,
      void_reason: reason,
      voided_at: new Date().toISOString(),
      voided_by: 'admin',
    }).eq('id', paymentId)

    // Reduce total paid
    const newPaid = Math.max(0, Number(financials.amount_paid) - Number(payment.amount))
    await supabase.from('crm_financials').update({ amount_paid: newPaid, updated_at: new Date().toISOString() }).eq('id', financials.id)

    await logAudit('payment_voided', 'payment', paymentId, { amount: payment.amount }, { void_reason: reason })
    fetchAllData()
  }

  const handleConvertToProject = async () => {
    if (!financials) {
      alert('You must set up financials before converting to a project.')
      return
    }

    if (!confirm('Are you sure you want to convert this lead into an active project?')) return
    
    setIsUpdating(true)
    try {
      // 1. Double check if project already exists
      const { data: existing } = await supabase.from('projects').select('id').eq('lead_id', lead.id).single()
      if (existing) {
        alert('A project already exists for this lead.')
        setIsUpdating(false)
        return
      }

      // 2. Insert into projects
      const { data: projData, error: projError } = await supabase.from('projects').insert([{
        lead_id: lead.id,
        financial_id: financials.id,
        title: financials.project_title || lead.company_name,
        client_name: lead.company_name,
        status: 'Planning',
        description: lead.notes,
        start_date: financials.expected_start_date || new Date().toISOString().split('T')[0],
      }]).select().single()

      if (projError) throw projError

      await logAudit('converted_to_project', 'project', projData.id, null, { lead_id: lead.id })
      
      alert('Successfully converted to project!')
      onUpdate()
      onClose()
    } catch (err: unknown) {
      console.error('Conversion error:', err)
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert('Failed to convert: ' + message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteLead = async () => {
    if (!confirm(`Are you sure you want to delete "${lead.company_name}"? This action cannot be undone.`)) return
    setIsUpdating(true)
    await supabase.from('crm_leads').delete().eq('id', lead.id)
    await logAudit('lead_deleted', 'lead', lead.id, lead as unknown as Record<string, unknown>, null)
    onClose()
    onUpdate()
  }

  // Calculate live totals
  const activePayments = payments.filter(p => !p.is_voided)
  const totalPaid = activePayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalCharges = charges.reduce((sum, c) => sum + Number(c.amount), 0)
  const agreedValue = financials ? Number(financials.agreed_value) : 0
  const remaining = agreedValue - totalPaid
  const paymentPercentage = agreedValue > 0 ? Math.round((totalPaid / agreedValue) * 100) : 0
  const isOverpaid = remaining < 0
  const statusColor = LEAD_STATUSES.find(s => s.value === lead.status)?.color || '#94a3b8'

  if (loading) return <div className="detail-overlay"><div className="detail-modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div></div>

  return (
    <>
      <div className="detail-overlay" onClick={onClose}>
        <div className="detail-modal" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div className="header-info">
              <h2>{lead.company_name}</h2>
              <div className="header-meta">
                <span className="status-badge" style={{ background: `${statusColor}15`, color: statusColor, borderColor: `${statusColor}40` }}>{lead.status}</span>
                <span className="source-tag">{lead.source}</span>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>

          {/* Tabs */}
          <div className="tabs">
            {(['overview', 'financials', 'payments', 'audit'] as const).map(tab => (
              <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab === 'overview' ? '📋 Overview' : tab === 'financials' ? '💰 Financials' : tab === 'payments' ? '💳 Payments' : '📜 Audit Log'}
              </button>
            ))}
          </div>

          <div className="modal-content">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="tab-content">
                <div className="overview-grid">
                  <div className="main-col">
                    <section className="info-section">
                      <h3>Contact Information</h3>
                      <div className="info-grid">
                        <div className="info-item"><label>Contact</label><span>{lead.contact_name}</span></div>
                        <div className="info-item"><label>Email</label><span>{lead.email}</span></div>
                        <div className="info-item"><label>Phone</label><span>{lead.phone || '—'}</span></div>
                        <div className="info-item"><label>Industry</label><span>{lead.industry || '—'}</span></div>
                        <div className="info-item"><label>Country</label><span>{lead.country || '—'}</span></div>
                        <div className="info-item"><label>Created</label><span>{new Date(lead.created_at).toLocaleDateString()}</span></div>
                      </div>
                    </section>

                    {lead.notes && (
                      <section className="info-section">
                        <h3>Notes</h3>
                        <div className="notes-box">{lead.notes}</div>
                      </section>
                    )}

                    <section className="info-section">
                      <h3>Update Status</h3>
                      <select value={lead.status} onChange={e => handleStatusChange(e.target.value as LeadLifecycleStatus)} disabled={isUpdating} className="status-select">
                        <optgroup label="Active Pipeline">
                          {ACTIVE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </optgroup>
                        <optgroup label="Closed">
                          {CLOSED_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </optgroup>
                      </select>
                      <button className="delete-btn" onClick={handleDeleteLead} disabled={isUpdating}>Delete Lead</button>
                    </section>
                  </div>

                  {/* Financial Summary Card */}
                  <div className="side-col">
                    {financials ? (
                      <div className="fin-summary-card">
                        <h3>Financial Summary</h3>
                        <div className="fin-summary-item"><label>Project</label><span>{financials.project_title || '—'}</span></div>
                        <div className="fin-summary-item"><label>Service</label><span>{financials.service_name || '—'}</span></div>
                        <div className="fin-summary-divider" />
                        <div className="fin-summary-item"><label>Agreed Value</label><span className="value">{financials.currency} {agreedValue.toLocaleString()}</span></div>
                        {totalCharges > 0 && <div className="fin-summary-item"><label>+ Additional Charges</label><span className="value charge">{financials.currency} {totalCharges.toLocaleString()}</span></div>}
                        <div className="fin-summary-item"><label>Total Paid</label><span className="value paid">{financials.currency} {totalPaid.toLocaleString()}</span></div>
                        <div className="fin-summary-item"><label>Remaining</label><span className={`value ${isOverpaid ? 'overpaid' : 'remaining'}`}>{financials.currency} {Math.abs(remaining).toLocaleString()}{isOverpaid ? ' (Overpaid)' : ''}</span></div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${Math.min(paymentPercentage, 100)}%`, background: isOverpaid ? '#ef4444' : '#10b981' }} />
                        </div>
                        <span className="progress-label">{paymentPercentage}% paid</span>
                        <div className="fin-actions">
                          <button className="action-btn green" onClick={() => setShowPaymentRecorder(true)}>Record Payment</button>
                          <button className="action-btn amber" onClick={() => setShowChargeForm(true)}>Add Charge</button>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <button 
                             onClick={handleConvertToProject}
                             disabled={isUpdating}
                             className="w-full py-2 bg-blue-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10 disabled:opacity-50"
                          >
                            🚀 {isUpdating ? 'Converting...' : 'Move to Projects'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="fin-summary-card empty">
                        <h3>Financial Setup</h3>
                        <p>No financial agreement configured yet.</p>
                        <button className="action-btn primary" onClick={() => { setPendingStatus(null); setShowFinancialSetup(true) }}>Set Up Financials</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* FINANCIALS TAB */}
            {activeTab === 'financials' && (
              <div className="tab-content">
                {financials ? (
                  <>
                    <div className="fin-detail-grid">
                      <div className="fin-card"><label>Project Title</label><span>{financials.project_title || '—'}</span></div>
                      <div className="fin-card"><label>Service</label><span>{financials.service_name || '—'}</span></div>
                      <div className="fin-card"><label>Pricing</label><span>{financials.pricing_structure === 'milestone' ? 'Milestone-based' : 'One-off'}</span></div>
                      <div className="fin-card"><label>Payment Type</label><span>{financials.payment_type?.replace('-', ' ') || '—'}</span></div>
                      <div className="fin-card highlight"><label>Agreed Value</label><span>{financials.currency} {agreedValue.toLocaleString()}</span></div>
                      <div className="fin-card highlight green"><label>Total Paid</label><span>{financials.currency} {totalPaid.toLocaleString()}</span></div>
                      <div className="fin-card highlight red"><label>Outstanding</label><span>{financials.currency} {Math.abs(remaining).toLocaleString()}</span></div>
                      <div className="fin-card"><label>Start Date</label><span>{financials.expected_start_date || '—'}</span></div>
                    </div>

                    {financials.scope_notes && (
                      <section className="info-section"><h3>Scope Notes</h3><div className="notes-box">{financials.scope_notes}</div></section>
                    )}

                    {milestones.length > 0 && (
                      <section className="info-section">
                        <h3>Milestones</h3>
                        <div className="milestones-list">
                          {milestones.map((ms, i) => (
                            <div key={ms.id} className={`milestone-item ${ms.status}`}>
                              <div className="ms-number">{i + 1}</div>
                              <div className="ms-info">
                                <div className="ms-title">{ms.title}</div>
                                {ms.description && <div className="ms-desc">{ms.description}</div>}
                              </div>
                              <div className="ms-amount">
                                <span className="ms-total">{financials.currency} {Number(ms.amount).toLocaleString()}</span>
                                <span className="ms-paid">Paid: {financials.currency} {Number(ms.amount_paid).toLocaleString()}</span>
                                <span className={`ms-status ${ms.status}`}>{ms.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {charges.length > 0 && (
                      <section className="info-section">
                        <h3>Additional Charges</h3>
                        {charges.map(c => (
                          <div key={c.id} className="charge-item">
                            <div><strong>{c.title}</strong> {c.description && <span className="charge-desc">— {c.description}</span>}</div>
                            <span className="charge-amount">{financials.currency} {Number(c.amount).toLocaleString()}</span>
                          </div>
                        ))}
                      </section>
                    )}

                    <div className="fin-actions-row">
                      <button className="action-btn green" onClick={() => setShowPaymentRecorder(true)}>💳 Record Payment</button>
                      <button className="action-btn amber" onClick={() => setShowChargeForm(true)}>➕ Add Charge</button>
                      <button className="action-btn primary" onClick={() => { setPendingStatus(null); setShowFinancialSetup(true) }}>✏️ Edit Setup</button>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <p>No financial agreement has been set up for this lead.</p>
                    <button className="action-btn primary" onClick={() => { setPendingStatus(null); setShowFinancialSetup(true) }}>Set Up Financials</button>
                  </div>
                )}
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div className="tab-content">
                {financials && (
                  <div className="payment-summary-cards">
                    <div className="psc"><label>Total Agreed</label><span>{financials.currency} {agreedValue.toLocaleString()}</span></div>
                    <div className="psc green"><label>Total Paid</label><span>{financials.currency} {totalPaid.toLocaleString()}</span></div>
                    <div className="psc red"><label>Balance Left</label><span>{financials.currency} {Math.abs(remaining).toLocaleString()}</span></div>
                    <div className="psc"><label>Payments Made</label><span>{activePayments.length}</span></div>
                  </div>
                )}

                <div className="payments-actions">
                  <h3>Payment History</h3>
                  {financials && <button className="action-btn green" onClick={() => setShowPaymentRecorder(true)}>+ Record Payment</button>}
                </div>

                {payments.length > 0 ? (
                  <div className="payments-list">
                    {payments.map(p => (
                      <div key={p.id} className={`payment-item ${p.is_voided ? 'voided' : ''}`}>
                        <div className="payment-main">
                          <div className="payment-amount">{financials?.currency || 'USD'} {Number(p.amount).toLocaleString()}</div>
                          <div className="payment-meta">
                            <span>{new Date(p.payment_date).toLocaleDateString()}</span>
                            <span>{p.payment_method}</span>
                            <span className="alloc-tag">{p.allocation_target}</span>
                          </div>
                          {p.reference_id && <div className="payment-ref">Ref: {p.reference_id}</div>}
                          {p.notes && <div className="payment-notes">{p.notes}</div>}
                        </div>
                        <div className="payment-actions">
                          {p.is_voided ? (
                            <span className="voided-badge">VOIDED: {p.void_reason}</span>
                          ) : (
                            <button className="void-btn" onClick={() => handleVoidPayment(p.id)}>Void</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">No payments recorded yet.</div>
                )}
              </div>
            )}

            {/* AUDIT TAB */}
            {activeTab === 'audit' && (
              <div className="tab-content">
                <h3>Activity Timeline</h3>
                <div className="timeline">
                  {history.map(entry => (
                    <div key={entry.id} className="timeline-item">
                      <div className="timeline-marker" />
                      <div className="timeline-content">
                        <span className="timeline-date">{new Date(entry.changed_at).toLocaleString()}</span>
                        {entry.notes ? (
                          <p className="timeline-text audit-note">{entry.notes}</p>
                        ) : (
                          <p className="timeline-text">
                            {entry.old_status ? `${entry.old_status} → ` : 'Created as '}
                            <strong>{entry.new_status}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFinancialSetup && (
        <FinancialSetupModal leadId={lead.id} companyName={lead.company_name} onSave={handleFinancialSave} onCancel={() => { setShowFinancialSetup(false); setPendingStatus(null) }} />
      )}
      {showPaymentRecorder && financials && (
        <PaymentRecorder leadId={lead.id} financialId={financials.id} currency={financials.currency} milestones={milestones} onSave={handlePaymentSave} onCancel={() => setShowPaymentRecorder(false)} />
      )}
      {showChargeForm && financials && (
        <AdditionalChargeForm leadId={lead.id} financialId={financials.id} currency={financials.currency} onSave={handleChargeSave} onCancel={() => setShowChargeForm(false)} />
      )}

      <style jsx>{`
        .detail-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; }
        .detail-modal { background:#fff; width:100%; max-width:1100px; max-height:92vh; border-radius:20px; display:flex; flex-direction:column; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); }
        .modal-header { padding:24px 28px; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:flex-start; }
        .header-info h2 { margin:0; font-size:22px; font-weight:700; color:#111; }
        .header-meta { display:flex; gap:8px; margin-top:8px; align-items:center; }
        .status-badge { padding:4px 14px; border-radius:20px; font-size:12px; font-weight:600; border:1px solid; }
        .source-tag { font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.04em; }
        .close-btn { background:none; border:none; font-size:30px; color:#9ca3af; cursor:pointer; }
        .tabs { display:flex; gap:4px; padding:0 28px; border-bottom:1px solid #e5e7eb; background:#f9fafb; }
        .tab { padding:12px 18px; border:none; background:transparent; font-size:13px; font-weight:600; color:#64748b; cursor:pointer; border-bottom:2px solid transparent; transition:all 0.2s; }
        .tab.active { color:#0f172a; border-bottom-color:#0f172a; }
        .tab:hover { color:#334155; }
        .modal-content { padding:24px 28px; overflow-y:auto; flex:1; }
        .tab-content { animation:fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

        .overview-grid { display:grid; grid-template-columns:1fr 340px; gap:28px; }
        .main-col, .side-col { display:flex; flex-direction:column; gap:24px; }
        .info-section h3 { font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.06em; margin:0 0 14px 0; }
        .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .info-item label { display:block; font-size:11px; color:#94a3b8; margin-bottom:2px; }
        .info-item span { font-size:14px; color:#334155; font-weight:500; }
        .notes-box { background:#fffbeb; padding:14px; border-radius:10px; border:1px solid #fef3c7; font-size:13px; color:#92400e; line-height:1.6; }
        .status-select { width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; margin-bottom:12px; }
        .delete-btn { width:100%; padding:10px; background:#fef2f2; border:1px solid #fecaca; border-radius:10px; color:#dc2626; font-weight:600; cursor:pointer; font-size:13px; }
        .delete-btn:hover { background:#fee2e2; }

        .fin-summary-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:20px; }
        .fin-summary-card.empty { text-align:center; }
        .fin-summary-card.empty p { color:#64748b; font-size:13px; margin:12px 0 16px; }
        .fin-summary-card h3 { font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.06em; margin:0 0 16px 0; }
        .fin-summary-item { display:flex; justify-content:space-between; padding:8px 0; }
        .fin-summary-item label { font-size:12px; color:#64748b; }
        .fin-summary-item span { font-size:13px; font-weight:600; color:#334155; }
        .fin-summary-divider { height:1px; background:#e2e8f0; margin:4px 0; }
        .value { font-size:15px; }
        .value.paid { color:#059669; }
        .value.remaining { color:#ef4444; }
        .value.overpaid { color:#ef4444; }
        .value.charge { color:#f59e0b; }
        .progress-bar { height:6px; background:#e2e8f0; border-radius:3px; margin-top:12px; overflow:hidden; }
        .progress-fill { height:100%; border-radius:3px; transition:width 0.3s; }
        .progress-label { font-size:11px; color:#94a3b8; margin-top:4px; display:block; }
        .fin-actions { display:flex; gap:8px; margin-top:16px; }
        .action-btn { padding:10px 16px; border:none; border-radius:10px; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .action-btn.primary { background:#0f172a; color:#fff; }
        .action-btn.green { background:#059669; color:#fff; }
        .action-btn.green:hover { background:#047857; }
        .action-btn.amber { background:#f59e0b; color:#fff; }
        .action-btn.amber:hover { background:#d97706; }

        .fin-detail-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-bottom:24px; }
        .fin-card { background:#f8fafc; padding:14px; border-radius:12px; border:1px solid #e2e8f0; }
        .fin-card label { display:block; font-size:11px; color:#94a3b8; margin-bottom:4px; }
        .fin-card span { font-size:14px; font-weight:600; color:#334155; }
        .fin-card.highlight { background:#f0f9ff; border-color:#bae6fd; }
        .fin-card.highlight.green { background:#f0fdf4; border-color:#bbf7d0; }
        .fin-card.highlight.green span { color:#059669; }
        .fin-card.highlight.red { background:#fef2f2; border-color:#fecaca; }
        .fin-card.highlight.red span { color:#ef4444; }
        .fin-actions-row { display:flex; gap:10px; margin-top:24px; }

        .milestones-list { display:flex; flex-direction:column; gap:8px; }
        .milestone-item { display:flex; align-items:center; gap:14px; padding:14px; background:#f9fafb; border-radius:12px; border:1px solid #e2e8f0; }
        .milestone-item.completed { background:#f0fdf4; border-color:#bbf7d0; }
        .ms-number { width:28px; height:28px; background:#0f172a; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; }
        .ms-info { flex:1; }
        .ms-title { font-size:14px; font-weight:600; color:#1e293b; }
        .ms-desc { font-size:12px; color:#64748b; margin-top:2px; }
        .ms-amount { text-align:right; }
        .ms-total { display:block; font-size:14px; font-weight:700; color:#0f172a; }
        .ms-paid { display:block; font-size:11px; color:#64748b; }
        .ms-status { display:inline-block; font-size:10px; padding:2px 8px; border-radius:10px; margin-top:4px; font-weight:600; text-transform:uppercase; }
        .ms-status.pending { background:#f1f5f9; color:#64748b; }
        .ms-status.in-progress { background:#fef9c3; color:#854d0e; }
        .ms-status.completed { background:#dcfce7; color:#166534; }

        .charge-item { display:flex; justify-content:space-between; align-items:center; padding:12px; background:#fffbeb; border:1px solid #fef3c7; border-radius:10px; margin-bottom:8px; }
        .charge-desc { color:#92400e; font-size:12px; }
        .charge-amount { font-weight:700; color:#d97706; font-size:15px; }

        .payment-summary-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
        .psc { background:#f8fafc; padding:16px; border-radius:12px; border:1px solid #e2e8f0; }
        .psc label { display:block; font-size:11px; color:#94a3b8; margin-bottom:4px; }
        .psc span { font-size:18px; font-weight:700; color:#0f172a; }
        .psc.green span { color:#059669; }
        .psc.red span { color:#ef4444; }
        .payments-actions { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
        .payments-actions h3 { margin:0; font-size:14px; font-weight:600; color:#334155; }
        .payments-list { display:flex; flex-direction:column; gap:10px; }
        .payment-item { display:flex; justify-content:space-between; align-items:flex-start; padding:16px; background:#f9fafb; border-radius:12px; border:1px solid #e2e8f0; }
        .payment-item.voided { opacity:0.5; background:#fef2f2; border-color:#fecaca; }
        .payment-amount { font-size:18px; font-weight:700; color:#059669; }
        .voided .payment-amount { text-decoration:line-through; color:#dc2626; }
        .payment-meta { display:flex; gap:10px; font-size:12px; color:#64748b; margin-top:4px; }
        .alloc-tag { background:#e2e8f0; padding:1px 8px; border-radius:6px; font-weight:600; text-transform:uppercase; font-size:10px; }
        .payment-ref { font-size:11px; color:#94a3b8; margin-top:4px; }
        .payment-notes { font-size:12px; color:#64748b; margin-top:4px; font-style:italic; }
        .void-btn { background:#fef2f2; border:1px solid #fecaca; padding:6px 14px; border-radius:8px; font-size:11px; font-weight:600; color:#dc2626; cursor:pointer; }
        .void-btn:hover { background:#fee2e2; }
        .voided-badge { font-size:11px; color:#dc2626; font-weight:600; }
        .empty-state { text-align:center; padding:40px; color:#64748b; }

        .timeline { border-left:2px solid #e2e8f0; padding-left:24px; }
        .timeline-item { position:relative; margin-bottom:20px; }
        .timeline-marker { position:absolute; left:-33px; top:4px; width:14px; height:14px; border-radius:50%; background:#fff; border:3px solid #3b82f6; }
        .timeline-date { font-size:11px; color:#94a3b8; }
        .timeline-text { margin:4px 0 0; font-size:13px; color:#475569; }
        .audit-note { background:#fffbeb; padding:6px 10px; border-radius:6px; border-left:3px solid #f59e0b; font-size:12px; color:#92400e; }
      `}</style>
    </>
  )
}
