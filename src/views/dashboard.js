import { S } from '../utils/state.js'

export function renderDashboard() {
  const openOrders = new Set(
    S.sales.filter(s => !s.fulfillment_status || s.fulfillment_status === 'Open')
      .map(s => s.order_number)
  ).size

  const shipped7 = S.sales.filter(s => {
    if (s.fulfillment_status !== 'Shipped') return false
    const d = new Date(s.sale_date)
    return d >= new Date(Date.now() - 7*24*60*60*1000)
  }).length

  const rev7 = S.sales.filter(s => {
    const d = new Date(s.sale_date)
    return d >= new Date(Date.now() - 7*24*60*60*1000)
  }).reduce((sum, s) => sum + (parseFloat(s.msrp)||0) * (s.qty||1), 0)

  return `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
      ${kpi('Awaiting Fulfillment', openOrders, '#E07B28', 'Ready to pack')}
      ${kpi('Shipped — 7 Days', shipped7, '#2ABFAA', '0 delivered')}
      ${kpi('Est. Revenue — 7 Days', '$'+rev7.toFixed(2), '#2ABFAA', 'Last 7 days')}
      ${kpi('Parts in Catalog', S.parts.length, '#8a9ba8', S.assemblies.length+' assemblies')}
    </div>
    <div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:20px">
      <div style="font-size:13px;font-weight:700;margin-bottom:12px">Recent Orders</div>
      ${S.sales.slice(0,10).map(s=>`
        <div style="display:flex;gap:12px;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px">
          <span style="font-weight:700;color:#2ABFAA">${s.order_number||'—'}</span>
          <span style="color:#4a5568">${s.pn||'—'}</span>
          <span style="margin-left:auto;color:#8a9ba8">${s.fulfillment_status||'Open'}</span>
        </div>
      `).join('')}
    </div>
  `
}

function kpi(label, value, color, sub) {
  return `
    <div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:20px">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#8a9ba8;margin-bottom:8px">${label}</div>
      <div style="font-size:28px;font-weight:800;color:${color}">${value}</div>
      <div style="font-size:11px;color:#8a9ba8;margin-top:4px">${sub}</div>
    </div>
  `
}