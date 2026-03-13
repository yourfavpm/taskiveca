import type { CRMLead, CRMFinancials, CRMStatusHistory, AnalyticsMetrics, LeadLifecycleStatus } from './types'
import { LEAD_STATUSES, ACTIVE_STATUSES } from './types'

export function calculateAnalytics(
    leads: CRMLead[],
    financials: CRMFinancials[],
    history: CRMStatusHistory[]
): AnalyticsMetrics {
    const totalLeads = leads.length
    const activeLeads = leads.filter(l => ACTIVE_STATUSES.includes(l.status)).length

    // Conversion funnel using new statuses
    const funnelStatuses: LeadLifecycleStatus[] = [
        'Consultation Booked',
        'Consultation Completed',
        'Qualification Review',
        'Proposal Sent',
        'Follow-Up / Discussion',
        'Approved — Awaiting Payment',
        'Deposit Paid',
        'Onboarding Started',
        'Project In Development',
    ]

    const conversionFunnel = funnelStatuses.map(status => {
        const statusInfo = LEAD_STATUSES.find(s => s.value === status)
        const stageIndex = funnelStatuses.indexOf(status)
        // Count leads at this stage or beyond
        const count = leads.filter(lead => {
            const leadIndex = funnelStatuses.indexOf(lead.status)
            return leadIndex >= stageIndex
        }).length

        return {
            status,
            count,
            percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
            color: statusInfo?.color || '#94a3b8',
        }
    })

    // Revenue metrics
    const totalRevenue = financials.reduce((sum, f) => {
        const lead = leads.find(l => l.id === f.lead_id)
        if (!lead || !ACTIVE_STATUSES.includes(lead.status) && !['Project In Development', 'Closed Lost', 'No Show', 'Budget Mismatch', 'Not Interested'].includes(lead.status)) return sum
        // Only count as true revenue if approved or beyond
        const idx = funnelStatuses.indexOf(lead.status)
        if (idx >= funnelStatuses.indexOf('Approved — Awaiting Payment')) {
            return sum + Number(f.agreed_value || 0)
        }
        return sum
    }, 0)

    const totalPaid = financials.reduce((sum, f) => sum + Number(f.amount_paid || 0), 0)
    const totalOutstanding = Math.max(0, totalRevenue - totalPaid)

    // Projected Revenue
    const projectedRevenue = leads.reduce((sum, lead) => {
        const fin = financials.find(f => f.lead_id === lead.id)
        if (!fin || !fin.agreed_value) return sum

        const value = Number(fin.agreed_value)
        if (lead.status === 'Proposal Sent') return sum + (value * 0.5)
        if (lead.status === 'Follow-Up / Discussion') return sum + (value * 0.75)
        if (lead.status === 'Qualification Review') return sum + (value * 0.25)
        return sum
    }, 0)

    const pipelineValue = totalOutstanding + projectedRevenue

    // Win rate: approved/paid/project vs proposals sent
    const proposalSentAndBeyond = leads.filter(l => {
        const idx = funnelStatuses.indexOf(l.status)
        return idx >= funnelStatuses.indexOf('Proposal Sent')
    }).length
    const approvedAndBeyond = leads.filter(l => {
        const idx = funnelStatuses.indexOf(l.status)
        return idx >= funnelStatuses.indexOf('Approved — Awaiting Payment')
    }).length
    const winRate = proposalSentAndBeyond > 0 ? Math.round((approvedAndBeyond / proposalSentAndBeyond) * 100) : 0

    // Average deal size
    const dealsWithValue = financials.filter(f => Number(f.agreed_value) > 0)
    const averageDealSize = dealsWithValue.length > 0
        ? Math.round(dealsWithValue.reduce((sum, f) => sum + Number(f.agreed_value), 0) / dealsWithValue.length)
        : 0

    // Conversion rate: leads that reached approval or beyond / total
    const conversionRate = totalLeads > 0 ? Math.round((approvedAndBeyond / totalLeads) * 100) : 0

    // Revenue by industry
    const byIndustryMap: Record<string, number> = {}
    leads.forEach(lead => {
        const fin = financials.find(f => f.lead_id === lead.id)
        if (fin && Number(fin.agreed_value) > 0 && lead.industry) {
            byIndustryMap[lead.industry] = (byIndustryMap[lead.industry] || 0) + Number(fin.agreed_value)
        }
    })
    const byIndustry = Object.entries(byIndustryMap)
        .map(([industry, value]) => ({ industry, value }))
        .sort((a, b) => b.value - a.value)

    // Revenue by country
    const byCountryMap: Record<string, { value: number; count: number }> = {}
    leads.forEach(lead => {
        const country = lead.country || 'Unknown'
        if (!byCountryMap[country]) byCountryMap[country] = { value: 0, count: 0 }
        byCountryMap[country].count += 1
        const fin = financials.find(f => f.lead_id === lead.id)
        if (fin) byCountryMap[country].value += Number(fin.agreed_value || 0)
    })
    const byCountry = Object.entries(byCountryMap)
        .map(([country, data]) => ({ country, ...data }))
        .sort((a, b) => b.value - a.value)

    // Revenue by month
    const revenueByMonthMap: Record<string, { signed: number; paid: number }> = {}
    leads.forEach(lead => {
        const fin = financials.find(f => f.lead_id === lead.id)
        if (fin && Number(fin.agreed_value) > 0) {
            const dateStr = lead.contract_signed_date || lead.created_at
            if (!dateStr) return
            try {
                const date = new Date(dateStr)
                if (isNaN(date.getTime())) return
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                if (!revenueByMonthMap[key]) revenueByMonthMap[key] = { signed: 0, paid: 0 }
                revenueByMonthMap[key].signed += Number(fin.agreed_value)
                revenueByMonthMap[key].paid += Number(fin.amount_paid || 0)
            } catch { /* skip */ }
        }
    })
    const byMonth = Object.entries(revenueByMonthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, data]) => ({ month, ...data }))

    // Leads trend
    const trendMap: Record<string, { newLeads: number; converted: number }> = {}
    leads.forEach(lead => {
        if (!lead.created_at) return
        try {
            const d = new Date(lead.created_at)
            if (isNaN(d.getTime())) return
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            if (!trendMap[key]) trendMap[key] = { newLeads: 0, converted: 0 }
            trendMap[key].newLeads += 1
            const idx = funnelStatuses.indexOf(lead.status)
            if (idx >= funnelStatuses.indexOf('Approved — Awaiting Payment')) {
                trendMap[key].converted += 1
            }
        } catch { /* skip */ }
    })
    const leadsTrend = Object.entries(trendMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, data]) => ({ month, ...data }))

    // Recent activity from history
    const recentActivity = history
        .slice(0, 10)
        .map(h => {
            const lead = leads.find(l => l.id === h.lead_id)
            return {
                date: h.changed_at,
                action: h.notes || `Status changed to ${h.new_status}`,
                lead: lead?.company_name || 'Unknown',
            }
        })

    return {
        totalLeads,
        activeLeads,
        conversionRate,
        totalRevenue,
        totalPaid,
        totalOutstanding,
        projectedRevenue,
        pipelineValue,
        averageDealSize,
        winRate,
        conversionFunnel,
        revenueData: { byMonth, byIndustry, byCountry },
        leadsTrend,
        recentActivity,
    }
}
