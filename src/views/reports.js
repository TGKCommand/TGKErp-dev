import { S } from '../utils/state.js'

export function renderReports() {
  const last30 = new Date(Date.now() - 30*24*60*60*1000).toISOString().slice(0,10)
  const last7 = new Date(Date.now() - 7*24*60*60*1000).toISOString().slice(0,10)

  const sales30 = S.sales.filter(s => (s.sale_date||'') >= last30)
  const sales7 = S.sales.filter(s => (s.sale_date||'') >= last7)

  const topParts = {}
  S.sales.filter(s => (s.sale_date||'') >= last30).forEach(s => {
    if (!s.pn) return
    topParts[s.pn] = (topParts[s.pn]||0) + (s.qty||1)
  })
  const topPartsList = Object.entries(topParts).sort((a,b)=>b[1]-a[1]).slice(0,10)

  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">'
    + kpiCard('Orders — Last 7 Days', sales7.length, '#2ABFAA')
    + kpiCard('Orders — Last 30 Days', sales30.length, '#E07B28')
    + kpiCard('Parts in Catalog', S.parts.length, '#8b5cf6')
    + kpiCard('Active Dealers', S.dealers.filter(d=>d.status==='Active').length, '#22c55e')
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:20px">'
    + '<div style="font-size:12px;font-weight:700;color:#1a1c1e;margin-bottom:14px">Top Selling Parts — Last 30 Days</div>'
    + (topPartsList.length === 0
      ? '<div style="color:#8a9ba8;font-size:12px">No data</div>'
      : topPartsList.map((e,i) =>
          '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:12px">'
          + '<span style="font-size:10px;font-weight:700;color:#8a9ba8;width:16px">' + (i+1) + '</span>'
          + '<span style="font-family:monospace;font-weight:700;color:#2ABFAA;flex:1">' + e[0] + '</span>'
          + '<span style="font-weight:700;color:#1a1c1e">' + e[1] + ' units</span>'
          + '</div>'
        ).join('')
    )
    + '</div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:20px">'
    + '<div style="font-size:12px;font-weight:700;color:#1a1c1e;margin-bottom:14px">Order Status Breakdown</div>'
    + ['Open','Packed','Partial','Shipped','Delivered','On Hold','Cancelled','Refunded'].map(st => {
        const count = S.sales.filter(s => (s.fulfillment_status||'Open') === st).length
        const pct = S.sales.length > 0 ? Math.round(count/S.sales.length*100) : 0
        const colors = {Open:'#E07B28',Packed:'#8b5cf6',Partial:'#3b82f6',Shipped:'#2ABFAA',Delivered:'#22c55e','On Hold':'#f59e0b',Cancelled:'#ef4444',Refunded:'#8a9ba8'}
        const c = colors[st]||'#8a9ba8'
        return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;font-size:12px">'
          + '<span style="width:80px;color:#4a5568">' + st + '</span>'
          + '<div style="flex:1;height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden">'
          + '<div style="height:100%;background:' + c + ';width:' + pct + '%"></div>'
          + '</div>'
          + '<span style="width:50px;text-align:right;font-weight:700;color:#1a1c1e">' + count + '</span>'
          + '</div>'
      }).join('')
    + '</div>'
    + '</div>'

  function kpiCard(label, value, color) {
    return '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:20px">'
      + '<div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">' + label + '</div>'
      + '<div style="font-size:28px;font-weight:800;color:' + color + '">' + value + '</div>'
      + '</div>'
  }
}