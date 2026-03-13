'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AnalyticsMetrics, CRMLead, CRMFinancials, CRMStatusHistory } from '@/lib/types'
import { calculateAnalytics } from '@/lib/crm-logic'

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    const [leadsRes, finRes, histRes] = await Promise.all([
      supabase.from('crm_leads').select('*'),
      supabase.from('crm_financials').select('*'),
      supabase.from('crm_status_history').select('*').order('changed_at', { ascending: false }).limit(50),
    ])

    const leads = (leadsRes.data || []) as CRMLead[]
    const financials = (finRes.data || []) as CRMFinancials[]
    const history = (histRes.data || []) as CRMStatusHistory[]

    const m = calculateAnalytics(leads, financials, history)
    setMetrics(m)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  if (loading) return <div className="analytics-loading"><div className="spinner" />Loading analytics...</div>

  if (!metrics || metrics.totalLeads === 0) {
    return (
      <div className="analytics-empty">
        <div className="empty-icon">📊</div>
        <h2>No Analytics Data Yet</h2>
        <p>Analytics will populate automatically as you add leads and consultations to your CRM pipeline.</p>
        <div className="empty-hint">
          <span>💡</span>
          <span>Book a consultation through your website or add a lead manually in the CRM tab to get started.</span>
        </div>
      </div>
    )
  }

  const m = metrics

  // Find max funnel count for scaling bars
  const maxFunnel = Math.max(...m.conversionFunnel.map(f => f.count), 1)
  const maxRevMonth = Math.max(...m.revenueData.byMonth.map(r => Math.max(r.signed, r.paid)), 1)
  const maxTrend = Math.max(...m.leadsTrend.map(t => Math.max(t.newLeads, t.converted)), 1)

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="page-title">Analytics Dashboard</h1>
        <button className="refresh-btn" onClick={fetchAnalytics}>↻ Refresh</button>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-icon blue">📋</div>
          <div className="card-info">
            <span className="card-value">{m.totalLeads}</span>
            <span className="card-label">Total Leads</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon green">✅</div>
          <div className="card-info">
            <span className="card-value">{m.activeLeads}</span>
            <span className="card-label">Active Leads</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon purple">🎯</div>
          <div className="card-info">
            <span className="card-value">{m.conversionRate}%</span>
            <span className="card-label">Conversion Rate</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon amber">💰</div>
          <div className="card-info">
            <span className="card-value">${m.totalRevenue.toLocaleString()}</span>
            <span className="card-label">Total Revenue</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon emerald">💵</div>
          <div className="card-info">
            <span className="card-value">${m.totalPaid.toLocaleString()}</span>
            <span className="card-label">Total Collected</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon red">📊</div>
          <div className="card-info">
            <span className="card-value">${m.totalOutstanding.toLocaleString()}</span>
            <span className="card-label">Outstanding</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon indigo">📈</div>
          <div className="card-info">
            <span className="card-value">${m.averageDealSize.toLocaleString()}</span>
            <span className="card-label">Avg Deal Size</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon teal">🏆</div>
          <div className="card-info">
            <span className="card-value">{m.winRate}%</span>
            <span className="card-label">Win Rate</span>
          </div>
        </div>
        <div className="summary-card outline-amber">
          <div className="card-icon amber">⏳</div>
          <div className="card-info">
            <span className="card-value">${m.projectedRevenue.toLocaleString()}</span>
            <span className="card-label">Projected Revenue</span>
          </div>
        </div>
        <div className="summary-card outline-emerald">
          <div className="card-icon emerald">📈</div>
          <div className="card-info">
            <span className="card-value">${m.pipelineValue.toLocaleString()}</span>
            <span className="card-label">Total Pipeline Value</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Conversion Funnel */}
        <div className="chart-card wide">
          <h3>Conversion Funnel</h3>
          <div className="funnel-chart">
            {m.conversionFunnel.map((f) => (
              <div key={f.status} className="funnel-row">
                <div className="funnel-label">{f.status}</div>
                <div className="funnel-bar-container">
                  <div className="funnel-bar" style={{ width: `${(f.count / maxFunnel) * 100}%`, background: f.color }} />
                  <span className="funnel-value">{f.count} ({f.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Month */}
        {m.revenueData.byMonth.length > 0 && (
          <div className="chart-card">
            <h3>Revenue by Month</h3>
            <div className="bar-chart">
              {m.revenueData.byMonth.map(r => (
                <div key={r.month} className="bar-group">
                  <div className="bars">
                    <div className="bar signed" style={{ height: `${(r.signed / maxRevMonth) * 120}px` }} title={`Signed: $${r.signed.toLocaleString()}`} />
                    <div className="bar paid" style={{ height: `${(r.paid / maxRevMonth) * 120}px` }} title={`Paid: $${r.paid.toLocaleString()}`} />
                  </div>
                  <span className="bar-label">{r.month}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="dot signed" />Signed</span>
              <span className="legend-item"><span className="dot paid" />Paid</span>
            </div>
          </div>
        )}

        {/* Leads Trend */}
        {m.leadsTrend.length > 0 && (
          <div className="chart-card">
            <h3>Leads Trend</h3>
            <div className="bar-chart">
              {m.leadsTrend.map(t => (
                <div key={t.month} className="bar-group">
                  <div className="bars">
                    <div className="bar new-leads" style={{ height: `${(t.newLeads / maxTrend) * 120}px` }} title={`New: ${t.newLeads}`} />
                    <div className="bar converted-leads" style={{ height: `${(t.converted / maxTrend) * 120}px` }} title={`Converted: ${t.converted}`} />
                  </div>
                  <span className="bar-label">{t.month}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="dot new-leads" />New</span>
              <span className="legend-item"><span className="dot converted-leads" />Converted</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row */}
      <div className="bottom-grid">
        {/* Revenue by Industry */}
        {m.revenueData.byIndustry.length > 0 && (
          <div className="chart-card">
            <h3>Revenue by Industry</h3>
            <div className="list-chart">
              {m.revenueData.byIndustry.map((item, i) => {
                const max = m.revenueData.byIndustry[0]?.value || 1
                const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#0ea5e9', '#14b8a6', '#f59e0b']
                return (
                  <div key={item.industry} className="list-item">
                    <div className="list-label">{item.industry}</div>
                    <div className="list-bar-container">
                      <div className="list-bar" style={{ width: `${(item.value / max) * 100}%`, background: colors[i % colors.length] }} />
                    </div>
                    <span className="list-value">${item.value.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Revenue by Country */}
        {m.revenueData.byCountry.length > 0 && (
          <div className="chart-card">
            <h3>Leads by Country</h3>
            <div className="list-chart">
              {m.revenueData.byCountry.map(item => (
                <div key={item.country} className="country-item">
                  <div className="country-name">{item.country}</div>
                  <div className="country-stats">
                    <span className="country-count">{item.count} leads</span>
                    {item.value > 0 && <span className="country-value">${item.value.toLocaleString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {m.recentActivity.length > 0 && (
          <div className="chart-card">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {m.recentActivity.map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-dot" />
                  <div className="activity-content">
                    <span className="activity-lead">{a.lead}</span>
                    <span className="activity-action">{a.action}</span>
                    <span className="activity-date">{new Date(a.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .analytics-container { min-height:calc(100vh - 120px); }
        .analytics-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; }
        .page-title { font-size:24px; font-weight:700; color:#111; margin:0; }
        .refresh-btn { background:#f1f5f9; border:1px solid #e2e8f0; padding:8px 16px; border-radius:10px; font-size:13px; font-weight:600; color:#475569; cursor:pointer; }
        .refresh-btn:hover { background:#e2e8f0; }

        .analytics-loading { display:flex; align-items:center; justify-content:center; gap:12px; padding:80px; color:#64748b; font-size:14px; }
        .spinner { width:20px; height:20px; border:2px solid #e2e8f0; border-top-color:#3b82f6; border-radius:50%; animation:spin 0.6s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        .analytics-empty { text-align:center; padding:80px 40px; }
        .empty-icon { font-size:48px; margin-bottom:16px; }
        .analytics-empty h2 { font-size:22px; font-weight:700; color:#1e293b; margin:0 0 8px; }
        .analytics-empty p { color:#64748b; font-size:14px; margin:0 0 24px; }
        .empty-hint { display:inline-flex; align-items:center; gap:8px; background:#fffbeb; border:1px solid #fef3c7; padding:12px 20px; border-radius:12px; font-size:13px; color:#92400e; }

        .summary-grid { display:grid; grid-template-columns:repeat(5, 1fr); gap:16px; margin-bottom:28px; }
        .summary-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:20px; display:flex; align-items:center; gap:16px; transition:all 0.2s; }
        .summary-card:hover { box-shadow:0 4px 12px rgba(0,0,0,0.06); transform:translateY(-2px); }
        .summary-card.outline-amber { border-color:#fef3c7; background:#fffbf0; }
        .summary-card.outline-emerald { border-color:#d1fae5; background:#f2fdf7; }
        .card-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
        .card-icon.blue { background:#eff6ff; }
        .card-icon.green { background:#f0fdf4; }
        .card-icon.purple { background:#faf5ff; }
        .card-icon.amber { background:#fffbeb; }
        .card-icon.emerald { background:#ecfdf5; }
        .card-icon.red { background:#fef2f2; }
        .card-icon.indigo { background:#eef2ff; }
        .card-icon.teal { background:#f0fdfa; }
        .card-info { display:flex; flex-direction:column; }
        .card-value { font-size:22px; font-weight:800; color:#0f172a; line-height:1.2; }
        .card-label { font-size:12px; color:#64748b; font-weight:500; margin-top:2px; }

        .charts-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
        .chart-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:24px; }
        .chart-card.wide { grid-column:span 2; }
        .chart-card h3 { font-size:14px; font-weight:700; color:#1e293b; margin:0 0 20px; }

        .funnel-chart { display:flex; flex-direction:column; gap:10px; }
        .funnel-row { display:flex; align-items:center; gap:14px; }
        .funnel-label { width:220px; flex-shrink:0; font-size:12px; font-weight:600; color:#475569; text-align:right; }
        .funnel-bar-container { flex:1; display:flex; align-items:center; gap:10px; }
        .funnel-bar { height:28px; border-radius:6px; min-width:4px; transition:width 0.4s ease; }
        .funnel-value { font-size:12px; font-weight:600; color:#64748b; white-space:nowrap; }

        .bar-chart { display:flex; align-items:flex-end; gap:16px; justify-content:center; padding:20px 0; min-height:160px; }
        .bar-group { display:flex; flex-direction:column; align-items:center; gap:8px; }
        .bars { display:flex; gap:4px; align-items:flex-end; }
        .bar { width:24px; border-radius:4px 4px 0 0; min-height:4px; transition:height 0.4s ease; cursor:pointer; }
        .bar.signed { background:#3b82f6; }
        .bar.paid { background:#10b981; }
        .bar.new-leads { background:#6366f1; }
        .bar.converted-leads { background:#10b981; }
        .bar-label { font-size:10px; color:#94a3b8; font-weight:600; }
        .chart-legend { display:flex; gap:16px; justify-content:center; margin-top:12px; }
        .legend-item { display:flex; align-items:center; gap:6px; font-size:12px; color:#64748b; }
        .dot { width:10px; height:10px; border-radius:3px; }
        .dot.signed { background:#3b82f6; }
        .dot.paid { background:#10b981; }
        .dot.new-leads { background:#6366f1; }
        .dot.converted-leads { background:#10b981; }

        .bottom-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; }
        .list-chart { display:flex; flex-direction:column; gap:12px; }
        .list-item { display:flex; align-items:center; gap:12px; }
        .list-label { width:100px; font-size:12px; font-weight:500; color:#475569; flex-shrink:0; }
        .list-bar-container { flex:1; height:24px; background:#f1f5f9; border-radius:6px; overflow:hidden; }
        .list-bar { height:100%; border-radius:6px; min-width:4px; transition:width 0.4s ease; }
        .list-value { font-size:12px; font-weight:700; color:#0f172a; white-space:nowrap; }

        .country-item { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f1f5f9; }
        .country-item:last-child { border-bottom:none; }
        .country-name { font-size:13px; font-weight:600; color:#334155; }
        .country-stats { display:flex; gap:12px; }
        .country-count { font-size:12px; color:#64748b; }
        .country-value { font-size:12px; font-weight:700; color:#059669; }

        .activity-list { display:flex; flex-direction:column; gap:0; }
        .activity-item { display:flex; gap:12px; padding:10px 0; border-bottom:1px solid #f1f5f9; }
        .activity-item:last-child { border-bottom:none; }
        .activity-dot { width:8px; height:8px; border-radius:50%; background:#3b82f6; flex-shrink:0; margin-top:5px; }
        .activity-content { display:flex; flex-direction:column; }
        .activity-lead { font-size:13px; font-weight:600; color:#1e293b; }
        .activity-action { font-size:12px; color:#64748b; }
        .activity-date { font-size:11px; color:#94a3b8; }
      `}</style>
    </div>
  )
}
